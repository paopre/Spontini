#!/usr/bin/env python3
#
# Created (28/11/2020) by Paolo-Prete.
# This file is part of Spontini-Editor project.
#
# Spontini-Editor is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# Spontini-Editor is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
#

import sys
import re
import os
import logging
import traceback
import signal
import subprocess
import shutil

spontiniLogger = None

def getSpontiniLogger():
  return spontiniLogger

def setSpontiniLogger(moduleName, redirect=None):

  import colorlog
  from colorlog import ColoredFormatter

  formatter = ColoredFormatter(
    "%(log_color)s%(asctime)-.19s [%(levelname)-.1s]%(reset)s %(message_log_color)s%(message)s",
    log_colors={
      'DEBUG':    'purple',
      'INFO':     'cyan',
      'SUCCESS':  'bold_green',
      'WARNING':  'yellow',
      'ERROR':    'red',
      'CRITICAL': 'bold_red,bg_white',
    },
    secondary_log_colors={
      'message': {
      'ERROR':    'white',
      'CRITICAL': 'red'
      }
    }
  )

  logging.addLevelName(logging.INFO-1, 'SUCCESS')
  streamHandler = None
  if redirect != None:
    streamHandler = logging.StreamHandler(redirect)
  else:
    streamHandler = logging.StreamHandler()
  streamHandler.setFormatter(formatter)
  global spontiniLogger
  spontiniLogger = logging.getLogger(moduleName)
  # prevents duplication of msgs. See:
  # https://stackoverflow.com/questions/11820338/replace-default-handler-of-python-logger
  spontiniLogger.handlers = []
  spontiniLogger.addHandler(streamHandler)
  spontiniLogger.propagate = False
  spontiniLogger.setLevel(logging.INFO-1)

def cmdlineSplit(s, platform='this'):
    #see https://stackoverflow.com/questions/33560364/python-windows-parsing-command-lines-with-shlex
    if platform == 'this':
        platform = (sys.platform != 'win32')
    if platform == 1:
        RE_CMD_LEX = r'''"((?:\\["\\]|[^"])*)"|'([^']*)'|(\\.)|(&&?|\|\|?|\d?\>|[<])|([^\s'"\\&|<>]+)|(\s+)|(.)'''
    elif platform == 0:
        RE_CMD_LEX = r'''"((?:""|\\["\\]|[^"])*)"?()|(\\\\(?=\\*")|\\")|(&&?|\|\|?|\d?>|[<])|([^\s"&|<>]+)|(\s+)|(.)'''
    else:
        raise AssertionError('unkown platform %r' % platform)

    args = []
    accu = None
    for qs, qss, esc, pipe, word, white, fail in re.findall(RE_CMD_LEX, s):
        if word:
            pass
        elif esc:
            word = esc[1]
        elif white or pipe:
            if accu is not None:
                args.append(accu)
            if pipe:
                args.append(pipe)
            accu = None
            continue
        elif fail:
            raise ValueError("invalid or incomplete shell string")
        elif qs:
            word = qs.replace('\\"', '"').replace('\\\\', '\\')
            if platform == 0:
                word = word.replace('""', '"')
        else:
            word = qss

        accu = (accu or '') + word

    if accu is not None:
        args.append(accu)

    return args

def removeSharedInfos(shPath):
  for currFile in os.listdir(shPath):
    try:
      os.remove(os.path.join(shPath, currFile))
    except:
      log("Could not remove shared info file: "+currFile, "W")
      print(traceback.format_exc())

def getWebServerConfParam(param):
  ret = None
  with open(os.path.join(os.path.dirname(__file__), "webserver.conf")) as fp:
    while True:
      line = fp.readline().rstrip()
      if not line:
        break
      if line.startswith(param):
        if param != "required-modules":
          ret = line.split(param+"=")[1]
        else:
          ret = line.split(param+"=")[1].split(" ")
  fp.close()
  return ret

def terminateSpawnedProcesses():
  shPath = (os.path.join(os.path.dirname(__file__), '..', '..', 'plugins', 'shared'))
  for currFile in os.listdir(shPath):
    if currFile.startswith("PID_"):
      try:
        pid = int(currFile[4:])
        os.kill(pid, signal.SIGTERM)
      except:
        print("Could not close process with pid "+str(pid), "W")
        print(traceback.format_exc())

def setProtocolAndPortForPyGUI(protocol, port):
  path = os.path.join(os.path.dirname(__file__), "protocolAndPort")
  fp = open(path,'w+')
  fp.write(protocol+":"+str(port))
  fp.close()

def setProtocolAndPortForPyGUIFromCLIParams(cliParams, webserverName):
  cliParamsArr = cmdlineSplit(cliParams)
  ok = True
  path = os.path.join(os.path.dirname(__file__), "protocolAndPort")

  if webserverName == "daphne":
    if "-p" in cliParamsArr:
      fp = open(path,'w+')
      fp.write("http:"+cliParamsArr[cliParamsArr.index("-p") + 1])
      fp.close()
    elif "-e" in cliParamsArr:
      entryPointTkn = cliParamsArr[cliParamsArr.index("-e") + 1]
      subTkns = entryPointTkn.split(":")
      if "ssl" in subTkns:
        fp = open(path,'w+')
        fp.write("https:"+subTkns[subTkns.index("ssl") + 1])
        fp.close()
      elif "onion" in subTkns:
        fp = open(path,'w+')
        fp.write("onion:"+subTkns[subTkns.index("onion") + 1])
        fp.close()
      else:
        ok = False

  if not ok:
    spontiniLogger.critical("Webserver port not set!")
    sys.exit(0)

def mute(a, b):
  pass

def upgradePip(logFunc):
  pyCmd = getVenvedPyCmd()
  error = False
  output = subprocess.Popen([pyCmd, "-m", "pip", "install", "--upgrade", "pip"],
                                                encoding='utf-8',
                                                stdout=subprocess.PIPE,
                                                stderr=subprocess.PIPE)

  while True:
    line = output.stdout.readline().replace("\n", "")
    if not line:
        break
    logFunc(line, "I")

  stderrLines = ""
  while True:
    line = output.stderr.readline()
    stderrLines = stderrLines + line
    if not line:
      break

  output.communicate()
  if output.returncode != 0:
    error = True
    logFunc(stderrLines, "E")
  elif stderrLines:
    logFunc(stderrLines, "I")

  return not error

def checkAndInstallModule(module, installedModules, logFunc):

  error = False
  msg = "Checking if "+module+" is inside venv: "
  if module in installedModules:
    if not module.startswith("wheel=="):
      logFunc(msg+"YES", "I")
  else:
    if not module.startswith("wheel=="):
      logFunc(msg+"NO. Collecting it...", "I")
    moduleName = module.split("==")[0]
    pip3VenvCmd = os.path.join(getVenvedExecDir(), "pip3")
    output = subprocess.Popen([pip3VenvCmd, "install", module],
                                                  encoding='utf-8',
                                                  stdout=subprocess.PIPE,
                                                  stderr=subprocess.PIPE)

    while True:
      line = output.stdout.readline().replace("\n", "")
      if not line:
        break
      logFunc(line, "I")
    stderrLines = ""
    while True:
      line = output.stderr.readline()
      stderrLines = stderrLines + line
      if not line:
        break
    output.communicate()
    if output.returncode != 0:
      error = True
      logFunc(stderrLines, "E")
    elif stderrLines:
      logFunc(stderrLines, "I")

  return not error

def getVenvName():
  return "spontinivenv"

def log(msg, logType = ""):
  if logType == "I":
    getSpontiniLogger().info(msg)
  if logType == "E":
    getSpontiniLogger().error(msg)
  if logType == "C":
    getSpontiniLogger().critical(msg)
  if logType == "W":
    getSpontiniLogger().warning(msg)
  if logType == "D":
    getSpontiniLogger().debug(msg)
  elif logType == "S":
    getSpontiniLogger().log(logging.INFO-1, msg)

def getVenvedExecDir():
  venvDir = os.path.join(os.path.dirname(__file__), getVenvName())
  if os.name == "nt":
    return os.path.join(venvDir, "Scripts")
  else:
    return os.path.join(venvDir, "bin")

def getVenvedPyCmd():
  return os.path.join(getVenvedExecDir(), "python")

def setPip3AndVenvParams(logFunc = mute):

  logFunc("*** Initializing virtual environment ***", "I")
  pip3Exists = False
  venvExists = False
  venvCmdExists = False
  venvModuleExists = False
  venvedExecDir = ""
  venvedPyCmd = ""
  logFunc("Checking for pip3", "I")
  try:
    pipcmdArr = None
    venvcmdArr = None
    if os.name == "nt":
      pipcmdArr = ["py", "-3", "-m", "pip", "--version"]
      venvcmdArr = ["py", "-3", "-m", "venv", "-h"]
    else:
      pipcmdArr = ["python3", "-m", "pip", "--version"]
      venvcmdArr = ["python3", "-m", "venv", "-h"]
    p = subprocess.run(pipcmdArr, encoding='utf-8',
                       stderr=subprocess.PIPE,
                       stdout=subprocess.PIPE)
    if p.returncode == 0:
      pip3Exists = True
      logFunc(p.stdout, "I")
      logFunc("Pip3 found", "I")
    else:
      logFunc("Could not find pip3", "E")
      logFunc(p.stderr, "E")

    if pip3Exists:
      logFunc("Checking for venv module", "I")
      p = subprocess.run(venvcmdArr, encoding='utf-8',
                        stderr=subprocess.PIPE,
                        stdout=subprocess.DEVNULL)

      if p.returncode == 0:
        venvCmdExists = True
        logFunc("Venv found", "I")
      else:
        logFunc("Could not find venv", "E")
        logFunc(p.stderr, "E")

      venvDir = os.path.join(os.path.dirname(__file__), getVenvName())
      execName = "pip3"
      if os.name == "nt":
        execName = "pip3.exe"
      venvedPip = os.path.join(getVenvedExecDir(), execName)
      if venvCmdExists and os.path.isdir(venvDir):
        venvCmdExists = os.path.isfile(venvedPip)
        if not venvCmdExists:
          logFunc("Could not find pip executable inside "+getVenvName(), "E")
          logFunc("Make sure that both pip and venv are installed and run again the server", "E")
          try:
            shutil.rmtree(venvDir)
            #we force an error so to have information on how to install venv
            p = subprocess.run(venvcmdArr, encoding='utf-8',
                               stderr=subprocess.PIPE,
                               stdout=subprocess.DEVNULL)
            logFunc(p.stderr, "E")
          except:
            logFunc(traceback.format_exc(), "E")
        else:
          logFunc("Found pip executable inside venv", "I")
  except:
    logFunc(traceback.format_exc(), "E")

  if pip3Exists and venvCmdExists:

    currFileDir = os.path.dirname(__file__)
    venvDir = os.path.join(currFileDir, getVenvName())

    logFunc("Checking for virtual environment inside "+venvDir, "I")
    try:
      venvedExecDir = getVenvedExecDir()
      venvedPyCmd = getVenvedPyCmd()
      p = subprocess.run([venvedPyCmd, "--version"], encoding='utf-8',
                          stderr=subprocess.PIPE, stdout=subprocess.PIPE)
      venvExists = True
    except:
      pass

    if venvExists:
      logFunc("A virtual environment for python3 already exists inside "+venvDir, "I")
    else:
      logFunc("", "I")
      logFunc("----------------------------------------------", "I")
      logFunc("Spontini Server is completing its installation", "I")
      logFunc("This can take some time: please wait", "I")
      logFunc("----------------------------------------------", "I")
      logFunc("", "I")
      logFunc("Virtual environment missing. Creating a new one...", "I")
      try:
        createVenvCmd = None
        if os.name == "nt":
          createVenvCmd = ["py", "-3", "-m", "venv", venvDir]
        else:
          createVenvCmd = ["python3", "-m", "venv", venvDir]
        p = subprocess.run(createVenvCmd, encoding='utf-8',
                                        stderr=subprocess.PIPE, stdout=subprocess.PIPE)
        if p.returncode == 0:
          if p.stdout != '':
            logFunc(p.stdout, "I")
          logFunc("Venv Created", "S")
          venvExists = True
        else:
          logFunc("Could not create venv", "E")
          logFunc(p.stderr, "E")
          logFunc(p.stdout, "E")
          venvExists = False
      except:
        logFunc("Could not create venv", "E")
        logFunc(traceback.format_exc(), "E")
        venvExists = False

  return [pip3Exists, venvExists, venvedExecDir, venvedPyCmd]
