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

from sys import argv
from json import dumps
import json
import os
import glob
import shutil
import pathlib
import platform
import subprocess
from subprocess import PIPE
import xml.etree.ElementTree as ET
import threading
import traceback
from datetime import datetime
from urllib.parse import parse_qs
import time
import signal
import logging
import sys
import re
import types
import importlib.machinery
from PyPDF2 import PdfFileWriter, PdfFileReader, PdfFileMerger

sys.path.insert(1, os.path.dirname(__file__))
from spontini_server_utils import *

os.chdir(os.path.join(os.path.dirname(__file__), '..'))
port = 8000
wsDirPath = ""
currDirAbsolutePath = pathlib.Path(".").resolve()
httpd = None
lilyExecutableCmd = ""
inkscapeExecutableCmd = ""
WORKSPACE_PARAM = "workspace"
VERSION_PARAM = "version"
CAN_CONFIG_FROM_NON_LOCALHOST_PARAM = "can-config-from-non-localhost"
FORK_ACCESS_ONLY_PARAM = "fork-access-only"
DEBUG_PARAM = "debug"
LILYPOND_EXEC_PARAM = "lilypond-exec"
INKSCAPE_EXEC_PARAM = "inkscape-exec"
MIDI_ENABLED_PARAM = "midi-enabled"
SOUNDFONT_URL_PARAM = "soundfont-url"
configurableParams = [WORKSPACE_PARAM, VERSION_PARAM, CAN_CONFIG_FROM_NON_LOCALHOST_PARAM, FORK_ACCESS_ONLY_PARAM, DEBUG_PARAM, LILYPOND_EXEC_PARAM, INKSCAPE_EXEC_PARAM, MIDI_ENABLED_PARAM, SOUNDFONT_URL_PARAM]

lilyPondProgramInfo = {
  'programName' : 'LilyPond',
  'commonExecName' : 'lilypond',
  'winSubPath': ['Lilypond*', 'usr', 'bin'],
  'winExecName': 'lilypond-windows.exe',
  'macSubPath': ['/Applications', 'LilyPond.app','Contents', 'Resources', 'bin']
}

inkscapeProgramInfo = {
  'programName' : 'Inkscape',
  'commonExecName' : 'inkscape',
  'winSubPath': ['Inkscape', 'bin'],
  'winExecName': 'inkscape.exe',
  'macSubPath': ['/Applications', 'Inkscape.app','Contents', 'MacOS']
}

debug = True
venvedPyCmd = ""
venvedExecDir = ""
pip3Exists = False
venvExists = False
savedConFilename = "saved-config.txt"
savedConFilenameWithPath = os.path.join(savedConFilename)
version = "??"
forkAccessOnly = False
canConfigFromNonLocalhost = False
sepTkn = ";;::;;"

if not getSpontiniLogger():
  setSpontiniLogger("spontini")
else:
  setSpontiniLogger(getWebServerConfParam("webserver-name"), sys.stdout)

def setConfigParam(param, val):
  global savedConFilenameWithPath

  if param not in configurableParams:
    return False

  try:
    newContent = ""
    with open(savedConFilenameWithPath) as fp:

      line = fp.readline().rstrip()

      while line:
        currParam = line.split("=")[0]
        if currParam == param:
          newContent = newContent + currParam + "=" + val + "\n"
          log("Updated saved config file (" + param + "=" + val + ")", "D")
        elif line != '':
          newContent = newContent + line + "\n"

        line = fp.readline().rstrip()

      if param not in newContent:
        newContent = newContent + param + "=" + val + "\n"

      newContent = newContent[0 : (len(newContent) - 1)]

    fp.close()

    fp = open(savedConFilenameWithPath,'w+')
    fp.write(newContent)
    fp.close()
    return True

  except:
    log("Error while writing to saved conf file", "E")
    log(traceback.format_exc(), "E")
    return False

def addMaskToPdf(mask, pdf):
  maskPdf = PdfFileReader(open(mask, "rb"))
  generatedPdf = PdfFileReader(open(pdf, "rb"))
  output = PdfFileWriter()
  page = generatedPdf.getPage(0)
  page.mergePage(maskPdf.getPage(0))
  output.addPage(page)
  outputStream = open(pdf+"BAK", "wb")
  output.write(outputStream)
  outputStream.close()
  maskPdf.stream.close()
  generatedPdf.stream.close()
  os.remove(pdf)
  os.rename(pdf+"BAK", pdf)

def executeScript(clientInfo, scriptFile):

  if scriptFile.endswith(".py"):
    loader = importlib.machinery.SourceFileLoader(scriptFile.replace(".py", ""), os.path.join(wsDirPath, scriptFile))
    mod = types.ModuleType(loader.name)
    loader.exec_module(mod)
    #mod.run(wsDirPath)

  else:
    try:
      p = subprocess.run([os.path.join(wsDirPath, scriptFile)],
                          encoding='utf-8', stderr=subprocess.STDOUT, stdout=subprocess.PIPE)
      if p.returncode == 0:
        outLines = p.stdout
        log(clientInfo + outLines, "I")
      else:
        log(clientInfo + p.stdout, "E")
    except:
        log(clientInfo + traceback.format_exc(), "E")

def readConfigParams():
  #FIXME: too much "global" stuff everywhere!
  global port
  global debug
  global lilyExecutableCmd
  global inkscapeExecutableCmd
  global wsDirPath
  global savedConFilenameWithPath
  global version
  global forkAccessOnly
  global WORKSPACE_PARAM
  global VERSION_PARAM
  global CAN_CONFIG_FROM_NON_LOCALHOST_PARAM
  global FORK_ACCESS_ONLY_PARAM
  global DEBUG_PARAM
  global LILYPOND_EXEC_PARAM
  global INKSCAPE_EXEC_PARAM
  global configurableParams

  try:
    with open(savedConFilenameWithPath) as fp:
      line = fp.readline().rstrip()
      while line:
        try:
          parm = line.split("=")[0]
          val = line.split("=")[1]

          if parm == WORKSPACE_PARAM:
            wsDirPath = val
            # Workaround for a Lilypond Bug (the compile command doesn't work with abs path
            # on the base directory)
            if str(wsDirPath) == str(currDirAbsolutePath):
              wsDirPath = "."

          # TODO: old code?? remove it??
          if parm == "port":
            port = int(val)

          if parm == VERSION_PARAM:
            version = val

          if parm == CAN_CONFIG_FROM_NON_LOCALHOST_PARAM:
            if val == "yes":
              canConfigFromNonLocalhost = True
            else:
              canConfigFromNonLocalhost = False

          if parm == FORK_ACCESS_ONLY_PARAM:
            if val == "yes":
              forkAccessOnly = True
            else:
              forkAccessOnly = False

          if parm == DEBUG_PARAM:
            if val == "yes":
              debug = True
            else:
              debug = False

          if parm == LILYPOND_EXEC_PARAM:
            lilyExecutableCmd = val

          if parm == INKSCAPE_EXEC_PARAM:
            inkscapeExecutableCmd = val

          if parm not in configurableParams:
            log ("  (skipping unknown '"+parm+"' param)", "W")
          else:
            log("  " + parm + " ---> " + val, "I")

        except:
          log("Bad config line: "+line+" -> ignoring it", "W")

        line = fp.readline().rstrip()
    fp.close()

  except:
    log("Could not open config file. Using default values...", "I")

def checkExecutable(execCmd, errorLoggedAs = 'E'):
  log("Checking if \"" + execCmd + "\" is a valid executable", "I")
  ret = False
  try:
    p = subprocess.run([execCmd, "--version"], encoding='utf-8')
    if p.returncode == 0:
      ret = True
  except Exception as e:
    log(e, errorLoggedAs)
    pass

  if not ret:
    log("\"" + execCmd + "\" is not a valid executable", errorLoggedAs)
  else:
    log("\"" + execCmd + "\" is a valid executable", "S")

  return ret

def getDefaultExecutableCmd(programInfo, errorLoggedAs = 'E'):

  ret = ""
  log("Checking default " + programInfo['programName'] + " installation in sys path", "I")
  if checkExecutable(programInfo['commonExecName'], errorLoggedAs):
    ret = programInfo['commonExecName']
  elif platform.system() == 'Windows':
    programFilesEnv = os.environ.get('ProgramFiles', 'C:\\Program Files')
    log("Could not find default " + programInfo['programName'] + " installation in sys path", "I")
    log("Checking default " + programInfo['programName'] + " installation in " + programFilesEnv + " path", "I")
    path = glob.glob(os.path.join(programFilesEnv, *programInfo['winSubPath']))
    if not path:
      programFilesEnvX86 = os.environ.get('ProgramFiles(x86)', 'C:\\Program Files (x86)')
      log("Could not find default " + programInfo['programName'] + " installation in "+programFilesEnv+" path", "I")
      log("Checking default " + programInfo['programName'] + " installation in " + programFilesEnvX86 + " path", "I")
      path = glob.glob(os.path.join(programFilesEnvX86, *programInfo['winSubPath']))
      if path:
        ret = os.path.join(path[0], programInfo['commonExecName'])
    else:
      ret = os.path.join(path[0], programInfo['commonExecName'])

    if path:
      log("Found executable: \"" + ret + "\"", "I")
      if not checkExecutable(ret, errorLoggedAs):
        ret = ""
  elif platform.system() == 'Darwin':
    path = os.path.join(*programInfo['macSubPath'], programInfo['commonExecName'])
    if os.path.exists(path):
      if checkExecutable(path, errorLoggedAs):
        ret = path

  if ret == "":
    log("Could not find default valid " + programInfo['programName'] + " installation", errorLoggedAs)
  else:
    log("Found default valid " + programInfo['programName'] + " installation", "S")

  return ret

def writeInfoSharedWithPlugins(filename, info):
  fNameWithPath = os.path.join("..", "plugins", "shared", filename)
  try:
    infoFile = open(fNameWithPath,'w+')
    infoFile.write(info)
    infoFile.close()
  except:
    log("Error while writing to shared info file", "E")
    log(traceback.format_exc(), "E")

def checkIfIsChildFile(possibleChild, possibleParent, extension):
  ret = (possibleChild == possibleParent.replace(".ly", extension))
  ret = ret or ((possibleChild.startswith(possibleParent.replace(".ly", "")+"-")) and possibleChild.endswith(extension))
  return ret

#----------------------------
#----------------------------
#   FASTAPI
#----------------------------
#----------------------------

from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from asgiref.sync import sync_to_async

def sendMalformedMsgResponse():
  return sendCompleteResponse("KO", "Malformed message")

def checkMsgStructure(msg, numOfParams):
  ret = True
  for i in range(1, numOfParams):
    try:
      a = msg['param'+str(i)]
    except:
      return False
  return True

def sendCompleteResponse(status, content = ""):
  return {"status" : status, "content" : content}

asgi = FastAPI()
asgi.mount("/spontini-editor", StaticFiles(directory="webgui", html = True), name="")

asgi.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["*"],
  allow_headers=["*"]
)

@asgi.on_event("shutdown")
async def shutdown():
  terminateSpawnedProcesses()

@asgi.get("/files")
async def doGet(request: Request):
  sys.stdout.flush()
  fname = request.query_params['filename']
  try:
    return FileResponse(os.path.join(wsDirPath, fname))
  except:
    raise HTTPException(
      status_code=404,
      detail="Item not found",
      headers={"X-Error": "Error"},
    )

def removeFilteredTknFromOutputFiles(fileName):
  global wsDirPath
  fileNameWOSuffix = fileName.replace(".ly", "")
  if not fileNameWOSuffix.endswith("-FILTERED"):
    return
  for currFile in os.listdir(wsDirPath):
    if checkIfIsChildFile(currFile, fileName, ".svg") or checkIfIsChildFile(currFile, fileName, ".midi"):
      currFileRenamed = currFile[::-1].replace('DERETLIF-', '', 1)[::-1]
      os.rename(os.path.join(wsDirPath, currFile), os.path.join(wsDirPath, currFileRenamed))
  try:
    os.remove(os.path.join(wsDirPath, fileName))
  except:
    pass

def doPostSync(message, request):
  host = str(request.client.host)
  clPort = str(request.client.port)
  global savedConFilenameWithPath
  global wsDirPath
  global lilyExecutableCmd
  global sepTkn

  clientInfo = "["+host+":"+clPort+"] "

  if message['cmd']:
    log(clientInfo + "Received '" + str(message) + "' message", "D")
  else:
    return

  if message['cmd'] == 'SAVE':
    if not checkMsgStructure(message, 2):
      return sendMalformedMsgResponse()
    lilyFileWithPath = os.path.join(wsDirPath, message['param1'])
    content = message['param2'].encode('utf-8').strip()
    log(clientInfo + "Saving file: " + lilyFileWithPath, "I")
    f = open(lilyFileWithPath,'wb')
    f.write(content)
    f.close()
    return sendCompleteResponse("OK")

  if message['cmd'] == 'FORK':
    if not checkMsgStructure(message, 3):
      return sendMalformedMsgResponse()
    forkName = message['param1']
    lilyFileWithPath = os.path.join(wsDirPath, forkName)
    origFileName = message['param3']
    origFileNameWithPath = os.path.join(wsDirPath, origFileName)
    content = message['param2'].encode('utf-8').strip()
    log(clientInfo + "Forking file: " + origFileName, "I")
    f = open(lilyFileWithPath,'wb')
    f.write(content)
    f.close()
    numOfSvgs = 0
    for currFile in os.listdir(wsDirPath):
      if checkIfIsChildFile(currFile, origFileName, ".svg")  :
        numOfSvgs = numOfSvgs + 1

    for currFile in os.listdir(wsDirPath):
      if checkIfIsChildFile(currFile, origFileName, ".svg")  :
        if numOfSvgs == 1:
          shutil.copyfile(os.path.join(wsDirPath, currFile),
                          os.path.join(wsDirPath, forkName.replace(".ly", ".svg")))
        else:
          tkns = currFile.split("-")
          pageNum = tkns[len(tkns)-1].replace(".svg", "")
          shutil.copyfile(os.path.join(wsDirPath, currFile),
                          os.path.join(wsDirPath, forkName.replace(".ly", "")+"-"+pageNum+".svg"))

    if os.path.isfile(origFileNameWithPath.replace(".ly", ".pdf")):
      shutil.copyfile(origFileNameWithPath.replace(".ly", ".pdf"),
                      lilyFileWithPath.replace(".ly", ".pdf"))

    if os.path.isfile(origFileNameWithPath.replace(".ly", ".zip")):
      shutil.copyfile(origFileNameWithPath.replace(".ly", ".zip"),
                      lilyFileWithPath.replace(".ly", ".zip"))

    if os.path.isfile(origFileNameWithPath.replace(".ly", ".midi")):
      shutil.copyfile(origFileNameWithPath.replace(".ly", ".midi"),
                      lilyFileWithPath.replace(".ly", ".midi"))

    return sendCompleteResponse("OK")

  if message['cmd'] == 'NEW':
    writeInfoSharedWithPlugins("CURRENT_LY_FILE", "")
    return sendCompleteResponse("OK")

  if message['cmd'] == 'DELETE':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    inputFileName = message['param1']
    inputFileNameWOSuffix = message['param1'].replace(".ly", "")
    lilyFileWithPath = os.path.join(wsDirPath, inputFileName)
    if inputFileName.endswith(".ly"):
      writeInfoSharedWithPlugins("CURRENT_LY_FILE", "")
      log(clientInfo + "Deleting files associated to: " + lilyFileWithPath, "I")
    os.remove(os.path.join(wsDirPath, lilyFileWithPath))
    try:
      os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".midi"))
    except:
      pass
    try:
      os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".pdf"))
    except:
      pass
    try:
      os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".zip"))
    except:
      pass

    for currFile in sorted(os.listdir(wsDirPath)):
      if currFile == inputFileNameWOSuffix+".svg" :
        os.remove(os.path.join(wsDirPath, currFile))
      if currFile.startswith(inputFileNameWOSuffix+"-") and currFile.endswith(".svg") :
        os.remove(os.path.join(wsDirPath, currFile))

    return sendCompleteResponse("OK")

  if message['cmd'] == 'COMPILE':
    if not checkMsgStructure(message, 3):
      return sendMalformedMsgResponse()
    inputFileName = message['param1']
    lilyFileWithPath = os.path.join(wsDirPath, inputFileName)
    content = message['param2'].encode('utf-8').strip()
    param3 = message['param3']

    # remove midi, zip and pdf file too, if they exist
    inputFileNameWOSuffix = inputFileName.replace(".ly", "")
    try:
      os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".midi"))
    except:
      pass
    try:
      os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".pdf"))
    except:
      pass
    try:
      os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".zip"))
    except:
      pass

    fileFilteredWithPath = lilyFileWithPath
    filtered = False
    if 'param5' in message and param3 != 'null':
      #TODO: add better check
      if (message['param5'] != "") and (message['param5'] != "empty") and (message['param5'] != message['param2']):
        filtered = True

    inputFileNameNotFiltered = inputFileName
    if filtered:
      fileFilteredWithPath = fileFilteredWithPath.replace(".ly", "-FILTERED.ly")
      inputFileName = inputFileName.replace(".ly", "-FILTERED.ly")

    log(clientInfo + "Saving file: " + fileFilteredWithPath, "I")
    f = open(fileFilteredWithPath,'wb')
    f.write(content)
    f.close()

    for currFile in os.listdir(wsDirPath):
      if checkIfIsChildFile(currFile, inputFileName, ".svg") or checkIfIsChildFile(currFile, inputFileNameNotFiltered, ".svg"):
        os.rename(os.path.join(wsDirPath, currFile),
                  os.path.join(wsDirPath, currFile.replace(".svg", ".ljssvgswap")))

    global lilyExecutableCmd
    log(clientInfo + "Compiling file: "+fileFilteredWithPath, "I")
    status = ""
    try:
      p = subprocess.run([lilyExecutableCmd,
                          "-dmidi-extension=midi", "-dbackend="+param3,
                          "-o", wsDirPath, fileFilteredWithPath],
                          encoding='utf-8', stderr=subprocess.STDOUT, stdout=subprocess.PIPE)
      if p.returncode == 0:
        for currFile in os.listdir(wsDirPath):
          if checkIfIsChildFile(currFile, inputFileName, ".ljssvgswap")  :
            try:
              os.remove(os.path.join(wsDirPath, currFile))
            except:
              pass
          if checkIfIsChildFile(currFile, inputFileNameNotFiltered, ".ljssvgswap")  :
            try:
              os.remove(os.path.join(wsDirPath, currFile))
            except:
              pass
        numPages = 0
        for currFile in os.listdir(wsDirPath):
          if checkIfIsChildFile(currFile, inputFileName, ".svg") :
            numPages += 1
        status = "OK_"+str(numPages)
        outLines = p.stdout
        if 'param4' in message:
          outLines = '\n'.join([s for s in outLines.split('\n') if message['param4'] in s])
        log(clientInfo + outLines, "S")

      else:
        for currFile in os.listdir(wsDirPath):
          if checkIfIsChildFile(currFile, inputFileName, ".ljssvgswap") :
            os.rename(os.path.join(wsDirPath, currFile),
              os.path.join(wsDirPath, currFile.replace(".ljssvgswap", ".svg")))
        status = "KO"
        log(clientInfo + p.stdout, "E")

      if filtered:
        removeFilteredTknFromOutputFiles(inputFileName)

      # Remove temporary chunk files, if any
      if param3 == 'null':
        try:
          inputFileNameWOSuffix = inputFileName.replace(".ly", "")
          os.remove(os.path.join(wsDirPath, inputFileName))
          os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".midi"))
        except:
          pass

      return sendCompleteResponse(status, p.stdout.encode("utf8"))

    except:
      status = "KO"

      if filtered:
        removeFilteredTknFromOutputFiles(inputFileName)

      # Remove temporary chunk files, if any
      if param3 == 'null':
        try:
          inputFileNameWOSuffix = inputFileName.replace(".ly", "")
          os.remove(os.path.join(wsDirPath, inputFileName))
          os.remove(os.path.join(wsDirPath, inputFileNameWOSuffix+".midi"))
        except:
          pass

      if not checkExecutable(lilyExecutableCmd):
        log(clientInfo + "Lilypond called, but its executable file is not set!", "E")
        return sendCompleteResponse(status, "lilypondnotfound".encode("utf8"))
      else:
        log(clientInfo + traceback.format_exc(), "E")
        err = "Bad lilypond command. Please report this!"
        log(clientInfo + err, "E")
        return sendCompleteResponse(status, err.encode("utf8"))

  if message['cmd'] == 'SET_WORKSPACE':
    if not canConfigFromNonLocalhost and ((not "localhost" in host) and (not "127.0.0.1" in host)):
      return sendCompleteResponse("KO", "Not allowed")
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()

    wsDirPath_ = message['param1']
    if os.path.isdir(wsDirPath_):
      setConfigParam(WORKSPACE_PARAM, os.path.abspath(wsDirPath_))
      log(clientInfo + "Workspace set to: "+wsDirPath_, "S")
      wsDirPath = wsDirPath_
      return sendCompleteResponse("OK", "")
    else:
      log(clientInfo + "Can't set current workspace to: "+wsDirPath_, "E")
      log(clientInfo + "The directory doesn't exist", "E")
      return sendCompleteResponse("KO", "")

  if message['cmd'] == 'SET_LILYPOND':
    if not canConfigFromNonLocalhost and ((not "localhost" in host) and (not "127.0.0.1" in host)):
      return sendCompleteResponse("KO", "Not allowed")
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    lilyExecutableCmd_ = message['param1']
    if checkExecutable(lilyExecutableCmd_):
      setConfigParam(LILYPOND_EXEC_PARAM, lilyExecutableCmd_)
      log(clientInfo + "Lilypond executable set to: "+lilyExecutableCmd_, "S")
      lilyExecutableCmd = lilyExecutableCmd_
      return sendCompleteResponse("OK", "")
    else:
      log(clientInfo + "Can't set \""+lilyExecutableCmd_+"\"", "E")
      return sendCompleteResponse("KO", "")

  if message['cmd'] == 'RESET_LILYPOND':
    if not canConfigFromNonLocalhost and ((not "localhost" in host) and (not "127.0.0.1" in host)):
      return sendCompleteResponse("KO", "Not allowed")
    lilyExecutableCmd = getDefaultExecutableCmd(lilyPondProgramInfo)
    if lilyExecutableCmd != "":
      log(clientInfo + "Lilypond executable reset to: "+lilyExecutableCmd, "S")
      setConfigParam(LILYPOND_EXEC_PARAM, lilyExecutableCmd)
      return sendCompleteResponse("OK", "")
    else:
      log(clientInfo + "Could not reset Lilypond executable", "E")
      return sendCompleteResponse("KO", "")

  if message['cmd'] == 'EXEC_CMD':
    if not canConfigFromNonLocalhost and ((not "localhost" in host) and (not "127.0.0.1" in host)):
      return sendCompleteResponse("KO", "Not allowed")
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    command = message['param1']
    commandArr = cmdlineSplit(command)
    log(clientInfo + "Executing: " + command, "I")
    try:
      p = subprocess.run(commandArr, encoding='utf-8', stderr=subprocess.PIPE, stdout=subprocess.PIPE)
      if p.returncode == 0:
        return sendCompleteResponse("OK", p.stdout.encode("utf8"))
        log(clientInfo + "Command executed!", "S")
        log(clientInfo + p.stdout, "S")
      else:
        return sendCompleteResponse("KO", p.stderr.encode("utf8"))
        log(clientInfo + "Error while executing command", "E")
        log(clientInfo + p.stderr, "E")
    except:
      return sendCompleteResponse("KO", traceback.format_exc().encode("utf8"))
      log(clientInfo + "Error while executing command", "E")
      log(clientInfo + traceback.format_exc(), "E")

  if message['cmd'] == 'EXEC_PLUGIN':
    if not checkMsgStructure(message, 5):
      return sendMalformedMsgResponse()
    pluginName = message['param1']
    pluginInput = message['param2'].encode('utf-8')
    absDirPath = os.path.abspath(os.getcwd())
    outputFileName = os.path.join(absDirPath, message['param3'])
    outputTempFileName = os.path.join(absDirPath, "spontini_plugin_output")
    inputTempFileName = os.path.join(absDirPath, "spontini_plugin_input")
    inputParams = message['param4']
    lang = message['param5']
    gotError0 = False
    gotError = True
    res = ""
    koToken = ''
    log(clientInfo + "Executing plugin: "+pluginName, "I")
    spawn = False
    try:
      pluginsFile = os.path.join("..", "plugins", "plugins.xml")
      f = open(pluginsFile,'rb')
      f.close()
      try:
        tree = ET.parse(pluginsFile)
        root = tree.getroot()
        for plugin in root.findall('plugin'):
          try:
            displayedName = plugin.find('displayedname').text
            if displayedName == pluginName:

              appOutput = plugin.find('output').text

              try:
                spawnVal = plugin.find('spawn').text
                if spawnVal == 'yes':
                  spawn = True
              except:
                pass

              try:
                access = plugin.find('access').text
                if ("127.0.0.1" in access) or ("localhost" in access):
                  if (not "localhost" in host) and (not "127.0.0.1" in host):
                    return sendCompleteResponse("KO", "Not allowed")
              except:
                pass

              try:
                enabled = plugin.find('enabled').text
                if enabled == "false":
                  return sendCompleteResponse("KO", "Not allowed")
              except:
                pass

              try:
                outputTempFileName = outputTempFileName + "." + plugin.find('output-file-extension').text
              except:
                pass

              try:
                inputTempFileName = inputTempFileName + "." + plugin.find('input-file-extension').text
              except:
                pass

              command = plugin.find('command').text
              try:
                if os.name == 'nt':
                  command = plugin.find('command-win').text
              except:
                pass

              if (appOutput == "document"
                  or appOutput == "selection"
                  or appOutput == "after-selection") and "%%OUTPUT_FILE%%" in command:
                outputFileName = outputTempFileName

              command = command.replace("%%OUTPUT_FILE%%", outputFileName)
              command = command.replace("%%INPUT_FILE%%", inputTempFileName)
              command = command.replace("%%VENVEDPYTHON3%%", venvedPyCmd)

              if inputParams != '':
                command = command.replace("%%INPUT_PARAMS%%", inputParams)

              command = command.replace("%%NOTES_NAME_LANG%%", lang)
              commandArr = cmdlineSplit(command)

              try:
                tmpfin = open(inputTempFileName,'wb')
                try:
                  tmpfin.write(plugin.find('input-file-pre-token').text.encode('utf-8'))
                except:
                  pass
                tmpfin.write(pluginInput)
                try:
                  tmpfin.write(plugin.find('input-file-post-token').text.encode('utf-8'))
                except:
                  pass
                tmpfin.close()
              except:
                res = "Can't create temporary input file before executing command: " + command
                log(clientInfo + traceback.format_exc(), "E")
                gotError0 = True
                p = None
              if gotError0 == False:
                try:
                  for i in range(len(commandArr)):

                    pluginsAbsPath = os.path.abspath(os.path.join("..", "plugins"))
                    if commandArr[i].startswith("%%PLUGINS_ABS_PATH%%"):
                      commandArr[i] = commandArr[i].replace("%%PLUGINS_ABS_PATH%%",pluginsAbsPath)
                      commandArr[i] = os.path.join(commandArr[i])

                    if commandArr[i].startswith("%%VENV%%"):
                      commandArr[i] = commandArr[i].replace("%%VENV%%","")
                      commandArr[i] = os.path.join(venvedExecDir, commandArr[i])

                    if commandArr[i].startswith("%%LILYINSTDIR%%"):
                      lilyInstDir = str(pathlib.Path(lilyExecutableCmd).parent)
                      commandArr[i] = commandArr[i].replace("%%LILYINSTDIR%%", "")
                      commandArr[i] = os.path.join(lilyInstDir, commandArr[i])

                  missingInstallation = False
                  log(clientInfo + " ".join(commandArr), "I")

                  p = subprocess.run(commandArr, encoding='utf-8',
                                      stderr=subprocess.PIPE,
                                      stdout=subprocess.PIPE)

                  if p.returncode == 0:
                    res = p.stdout
                    gotError = False
                    log(clientInfo + "Plugin executed (res='"+res+"')", "S")
                  elif p.returncode == 2:
                    res = "Error while executing command: " + " ".join(commandArr)
                    res = res + "\n" + p.stderr
                    koToken = "_"+p.stdout
                    log(clientInfo + res, "E")
                  else:
                    res = "Error while executing command: " + " ".join(commandArr)
                    res = res + "\n" + p.stderr
                    log(clientInfo + res, "E")

                  #FIXME: this is more or less a workaround. Find a cleaner solution
                  if "python -m" in " ".join(commandArr) and "No module named" in p.stderr:
                    missingInstallation = True

                except FileNotFoundError:
                  missingInstallation = True
                  res = "Error while executing command: " + " ".join(commandArr)
                  res = res + "\n" + traceback.format_exc()
                  log(clientInfo + traceback.format_exc(), "E")
                except Exception:
                  res = "Error while executing command: " + " ".join(commandArr)
                  res = res + "\n" + traceback.format_exc()
                  log(clientInfo + traceback.format_exc(), "E")

                if missingInstallation:
                    try:
                      koToken = "_" + plugin.find('install-command').text
                      koToken = koToken.replace("%%VENVEDPYTHON3%%", venvedPyCmd)
                    except:
                      pass

                try:
                  os.remove(os.path.join(wsDirPath, inputTempFileName))
                except:
                  log(clientInfo + "Can't remove " + inputTempFileName, "W")
          except:
            res = "Badly formatted <plugin> element in plugins.xml file"
            log(clientInfo + clientInfo + traceback.format_exc(), "E")
      except:
        res = "Badly formatted plugins.xml file: "
        log(clientInfo + traceback.format_exc(), "E")

    # Can't find/open the xml file
    except:
      res = "Can't find/open plugins.xml file"

    status = ""
    if gotError == True:
      status = "KO"+koToken.strip()
    else:
      status = "OK"

    if gotError == True:
      return sendCompleteResponse(status, res.encode("utf8"))
    elif outputTempFileName != outputFileName:
      #wfile.write(res.encode("utf8"))
      return sendCompleteResponse(status, res.encode("utf8"))
    else:
      try:
        with open(outputTempFileName, 'rb') as tmpfout:
          #shutil.copyfileobj(tmpfout, wfile)
          return sendCompleteResponse(status, tmpfout.read())
        tmpfout.close()
      except:
        #wfile.write(pluginInput)
        return sendCompleteResponse(status, pluginInput)
    try:
      outTempFileExists = os.path.isfile(outputTempFileName)
      if outTempFileExists:
        os.remove(outputTempFileName)
    except:
      log(clientInfo + "Can't remove " + outputTempFileName, "W")

  if message['cmd'].startswith('CREATE_'):
    if not checkMsgStructure(message, 2):
      return sendMalformedMsgResponse()

    fileName = message['param1']
    if not os.path.isfile(os.path.join(wsDirPath, fileName)):
      return sendCompleteResponse("KO", "The file doesn't exist")

    fileNameWOSuffix = fileName.replace(".ly", "")

    if "ZIP" in message['cmd']:
      from zipfile import ZipFile
      from os.path import basename
      zipObj = ZipFile(os.path.join(wsDirPath,fileNameWOSuffix+".zip"), 'w')

      for currFile in sorted(os.listdir(wsDirPath)):
        if (
            (currFile == fileNameWOSuffix + ".svg") or
            (currFile.startswith(fileNameWOSuffix+"-") and currFile.endswith(".svg")) or
            (currFile == fileName) or
            (currFile == fileNameWOSuffix + ".pdf") or
            (currFile == fileNameWOSuffix + ".midi")
          ):
          totPath = os.path.join(wsDirPath, currFile)
          zipObj.write(totPath, basename(totPath))

      zipObj.close()

    else: #PDF

      # process beforepdf script
      for currFile in sorted(os.listdir(wsDirPath)):
        if fileNameWOSuffix + "-beforepdf" in currFile:
          log(clientInfo + "[generating PDF] executing : " + currFile + " script", "I")
          executeScript(clientInfo, currFile)
          break

      svgList = []
      for currFile in sorted(os.listdir(wsDirPath)):
        if ((currFile == fileNameWOSuffix + ".svg") or
            (currFile.startswith(fileNameWOSuffix+"-") and currFile.endswith(".svg"))):
          svgList.append(os.path.abspath(os.path.join(wsDirPath, currFile)))

      if len(svgList) == 0:
        return sendCompleteResponse("KO", "Missing SVG associated files")

      from natsort import natsorted

      svgList = natsorted(svgList)
      pdfList = []
      for svgFile in svgList:
        fileWOSuffix = svgFile.replace(".svg", "")
        try:
          log(clientInfo + "[generating PDF] processing: " + svgFile, "I")
          p = subprocess.run([inkscapeExecutableCmd, svgFile, "--export-text-to-path", "--export-filename="+fileWOSuffix+".pdf"],
                              encoding='utf-8', stderr=subprocess.STDOUT, stdout=subprocess.PIPE)
          if p.returncode == 0:
            status = "OK"
            outLines = p.stdout.rstrip()
            if outLines:
              log(clientInfo + outLines, "I")
            pdfList.append(fileWOSuffix+".pdf")
          else:
            status = "KO"
            log(clientInfo + p.stdout, "E")
            return sendCompleteResponse(status, p.stdout.encode("utf8"))
        except:
          status = "KO"
          if not checkExecutable(inkscapeExecutableCmd):
            log(clientInfo + "Inkscape called, but its executable file is not set!", "E")
            return sendCompleteResponse(status, "Inkscape executable not found".encode("utf8"))
          else:
            log(clientInfo + traceback.format_exc(), "E")
            err = "Bad Inkscape command. Please report this!"
            log(clientInfo + err, "E")
            return sendCompleteResponse(status, err.encode("utf8"))

      merger = PdfFileMerger()

      # process afterpdf script
      for currFile in sorted(os.listdir(wsDirPath)):
        if fileNameWOSuffix + "-afterpdf" in currFile:
          log(clientInfo + "[generating PDF] executing : " + currFile + " script", "I")
          executeScript(clientInfo, currFile)
          break

      if len(pdfList) > 1:
        log(clientInfo + "[generating PDF] Concatenating all the pages into one PDF file...", "I")
      for pdf in pdfList:
          merger.append(pdf)

      merger.write(os.path.join(wsDirPath, fileNameWOSuffix+"-cpy.pdf"))
      merger.close()
      for pdf in pdfList:
        os.remove(os.path.join(wsDirPath, pdf))
      os.rename(os.path.join(wsDirPath, fileNameWOSuffix+"-cpy.pdf"), os.path.join(wsDirPath, fileNameWOSuffix+".pdf"))
      log(clientInfo + "[generating PDF] Generated: " + os.path.join(wsDirPath, fileNameWOSuffix+".pdf"), "S")

    return sendCompleteResponse("OK")

  if message['cmd'] == 'SVG_CONTENT':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    lilyFileWithPath = os.path.join(wsDirPath, message['param1'])
    #sendCompleteResponse("OK")
    content = ""
    try:
      with open(lilyFileWithPath, 'rb') as f:
        content = f.read()
      f.close()
    except:
      return sendCompleteResponse("KO", "not found")
    return sendCompleteResponse("OK", content)

  if message['cmd'] == 'LY_CONTENT':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    lilyFileWithPath = os.path.join(wsDirPath, message['param1'])
    writeInfoSharedWithPlugins("CURRENT_LY_FILE", lilyFileWithPath)
    #sendCompleteResponse("OK")
    content = ""
    try:
      with open(lilyFileWithPath, 'rb') as f:
        content = f.read()
      f.close()
    except:
      return sendCompleteResponse("KO", "not found")
    return sendCompleteResponse("OK", content)

  if message['cmd'] == 'FILE_LIST':
    if forkAccessOnly:
      return sendCompleteResponse("KO", "Not allowed")
    filelist = ""
    for currFile in sorted(os.listdir(wsDirPath)):
      if currFile.endswith(".ly"):
        filelist = filelist + currFile + sepTkn
    if filelist.endswith(sepTkn):
      filelist = filelist[0:-len(sepTkn)]
    #sendCompleteResponse("OK")
    return sendCompleteResponse("OK", filelist.encode("utf8"))
    #wfile.write(filelist.encode("utf8"))

  if message['cmd'] == 'PLUGINS':
    plugins = ""
    sep1 = ";;;;;;"
    sep2 = "-.-.-."
    try:
      log(clientInfo + "Parsing plugins.xml...", "D")
      try:
        pluginsFile = os.path.join("..", "plugins", "plugins.xml")
        f = open(pluginsFile,'rb')
        f.close()
        tree = ET.parse(pluginsFile)
        root = tree.getroot()
        for plugin in root.findall('plugin'):
          try:
            displayedName = plugin.find('displayedname').text
            appInput = plugin.find('input').text
            appOutput = plugin.find('output').text
            command = plugin.find('command').text
            outExt = '_none_'
            inputParamsPrompt = 'false'
            winCommand = ''
            installPluginCommand = ''
            showResult = 'false'

            try:
              showResult = plugin.find('show-result').text
            except:
              pass

            try:
              access = plugin.find('access').text
              if ("127.0.0.1" in access) or ("localhost" in access):
                if (not "localhost" in host) and (not "127.0.0.1" in host):
                  continue
            except:
              pass

            try:
              enabled = plugin.find('enabled').text
              if enabled == "false":
                continue
            except:
              pass

            try:
              winCommand = plugin.find('win-command').text
            except:
              pass
            try:
              installPluginCommand = plugin.find('install-command').text
            except:
              pass
            try:
              outExt = plugin.find('output-extension').text
            except:
              pass

            try:
              inputParamsPrompt = plugin.find('input-params-prompt').text
            except:
              pass

            currPlugin = displayedName + sep2 + appInput + sep2 + appOutput + sep2
            currPlugin = currPlugin + command + sep2 + outExt + sep2 + inputParamsPrompt + sep2 + showResult
            addPip3Warn = False
            addVenvWarn = False
            venvPySomewhere = "%%VENVEDPYTHON3%%" in command or "%%VENVEDPYTHON3%%" in winCommand
            venvPySomewhere = venvPySomewhere or "%%VENVEDPYTHON3%%" in installPluginCommand

            if not pip3Exists and venvPySomewhere:
              addPip3Warn = True
              addVenvWarn = True

            if pip3Exists and not venvExists and venvPySomewhere:
              addVenvWarn = True

            if addPip3Warn:
              currPlugin = currPlugin + sep2 + "PIP3_MISSING"
            if addVenvWarn:
              currPlugin = currPlugin + sep2 + "VENV_MISSING"

            plugins = plugins + currPlugin + sep1

          except:
            log(clientInfo + "Badly formatted <plugin> element in plugins.xml file: ", "E")
            log(clientInfo + traceback.format_exc(), "E")
            plugins = ""
      except:
        log(clientInfo + "Badly formatted plugins.xml file: ", "E")
        log(clientInfo + traceback.format_exc(), "E")
        plugins = ""
    # Can't find/open the xml file
    except:
      pass

    if plugins != "":
      plugins = plugins[:-len(sep1)]

    #sendCompleteResponse("OK")
    #wfile.write(plugins.encode("utf8"))
    return sendCompleteResponse("OK", plugins.encode("utf8"))

  if message['cmd'] == 'FILE_EXISTS':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    res = "NO"
    for currFile in sorted(os.listdir(wsDirPath)):
      if currFile == message['param1']:
        res = "YES"
    #sendCompleteResponse("OK")
    #wfile.write(res.encode("utf8"))
    return sendCompleteResponse("OK", res.encode("utf8"))

  if message['cmd'] == 'TKGUICLEARSCREEN':
    log("%%TKGUICLEARSCREEN%%", "I")
    return sendCompleteResponse("OK", "")

  if message['cmd'] == 'GET_CONFIG_PARAM':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    res = ""
    try:
      with open(savedConFilenameWithPath) as fp:
        line = fp.readline().rstrip()
        while line:
          try:
            currParm = line.split("=")[0]
            val = line.split("=")[1]
            if currParm == message['param1']:
              res = val
              break
          except:
            pass

          line = fp.readline().rstrip()
      fp.close()
    except:
      pass

    status = ""
    if res != "":
      status = "OK"
    else:
      status = "KO"

    #wfile.write(res.encode("utf8"))
    return sendCompleteResponse(status, res.encode("utf8"))

  if message['cmd'] == 'SET_CONFIG_PARAM':
    if not canConfigFromNonLocalhost and ((not "localhost" in host) and (not "127.0.0.1" in host)):
      return sendCompleteResponse("KO", "Not allowed")
    if not checkMsgStructure(message, 2):
      return sendMalformedMsgResponse()
    res = setConfigParam(message['param1'], message['param2'])
    if res:
      status = "OK"
    else:
      status = "KO"

    return sendCompleteResponse(status, "".encode("utf8"))

  if message['cmd'] == 'NUM_SVG_PAGES':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    resNum = 0
    fileName = message['param1'].replace(".ly", "")
    for currFile in sorted(os.listdir(wsDirPath)):
      if currFile == fileName + ".svg":
        resNum = 1
      if currFile.startswith(fileName+"-") and currFile.endswith(".svg"):
        resNum = resNum + 1
    #sendCompleteResponse("OK")
    #wfile.write(str(resNum).encode("utf8"))
    return sendCompleteResponse("OK", str(resNum).encode("utf8"))

  if message['cmd'] == 'GET_SAVED_SCORE_FILTER':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    filterFileWithPath = os.path.join(wsDirPath, message['param1'])
    #sendCompleteResponse("OK")
    content = ""
    try:
      with open(filterFileWithPath, 'rb') as f:
        content = f.read()
      f.close()
    except:
      return sendCompleteResponse("KO", "not found")
    return sendCompleteResponse("OK", content)

  if message['cmd'] == 'TEMPLATE_LIST':
    filelist = ""
    templatesPath = os.path.join("..", "templates")
    if os.path.exists(templatesPath):
      for currFile in sorted(os.listdir(templatesPath)):
        filelist = filelist + currFile + sepTkn
      if filelist.endswith(sepTkn):
        filelist = filelist[0:-len(sepTkn)]
    #sendCompleteResponse("OK")
    return sendCompleteResponse("OK", filelist.encode("utf8"))
    #wfile.write(filelist.encode("utf8"))

  if message['cmd'] == 'TEMPLATE_CONTENT':
    if not checkMsgStructure(message, 1):
      return sendMalformedMsgResponse()
    templateFileWithPath = os.path.join("..", "templates", message['param1'])
    content = ""
    try:
      with open(templateFileWithPath, 'rb') as f:
        content = f.read().rstrip()
      f.close()
    except:
      return sendCompleteResponse("KO", "not found")
    return sendCompleteResponse("OK", content)

doPostAsync = sync_to_async(doPostSync, thread_sensitive=False)

@asgi.post("/cgi", response_class=JSONResponse)
async def doPost(message: dict, request: Request):
  return await doPostAsync(message, request)

#----------------------------
#----------------------------
#   INIT
#----------------------------
#----------------------------

shPath = os.path.abspath(os.path.join('..', 'plugins', 'shared'))
removeSharedInfos(shPath)

HTTPServerError = ''
pipAndVenvParams = None
if getVenvName() in sys.prefix:
  # we are already in the venv
  # do the following operation silently
  pipAndVenvParams = setPip3AndVenvParams()
else:
  # log the venv creation/setting
  pipAndVenvParams = setPip3AndVenvParams(log)
  log("", "I")

pip3Exists = pipAndVenvParams[0]
venvExists = pipAndVenvParams[1]
venvedExecDir = pipAndVenvParams[2]
venvedPyCmd = pipAndVenvParams[3]

log("*** Initializing Spontini Server ***", "I")
log("Read config params", "I")
readConfigParams()
log("Setting workspace", "I")

if not os.path.isdir(wsDirPath):
  if wsDirPath == '':
    log("Workspace not configured: setting it to default 'examples' dir", "I")
  else:
    log("Configured directory '" + wsDirPath+ "' not found: setting workspace to default 'examples' dir", "W")
  wsDirPath = os.path.join("..", "examples")
  if not os.path.isdir(wsDirPath):
    log("Workspace '" + wsDirPath+ "' not found. Resetting to '.' dir", "W")
    wsDirPath = '.'
    setConfigParam(WORKSPACE_PARAM, wsDirPath)
  else:
    setConfigParam(WORKSPACE_PARAM, os.path.abspath(wsDirPath))

if lilyExecutableCmd:
  log("Found configured Lilypond executable: "+ lilyExecutableCmd , "I")
if lilyExecutableCmd and not checkExecutable(lilyExecutableCmd):
  lilyExecutableCmd = getDefaultExecutableCmd(lilyPondProgramInfo)
  setConfigParam(LILYPOND_EXEC_PARAM, lilyExecutableCmd)
elif not lilyExecutableCmd:
  lilyExecutableCmd = getDefaultExecutableCmd(lilyPondProgramInfo)
  setConfigParam(LILYPOND_EXEC_PARAM, lilyExecutableCmd)

if inkscapeExecutableCmd:
  log("Found configured Inkscape executable: "+ inkscapeExecutableCmd , "I")
if inkscapeExecutableCmd and not checkExecutable(inkscapeExecutableCmd):
  inkscapeExecutableCmd = getDefaultExecutableCmd(inkscapeProgramInfo, 'W')
  setConfigParam(INKSCAPE_EXEC_PARAM, inkscapeExecutableCmd)
elif not inkscapeExecutableCmd:
  inkscapeExecutableCmd = getDefaultExecutableCmd(inkscapeProgramInfo, 'W')
  setConfigParam(INKSCAPE_EXEC_PARAM, inkscapeExecutableCmd)

writeInfoSharedWithPlugins("CURRENT_LY_FILE", "")

log("", "I")
log("***********************************", "I")
log("***********************************", "I")
log("", "I")

log("-- Version: " + version, "I")
log("-- Workspace: " + wsDirPath, "I")

if lilyExecutableCmd:
  log("-- Lilypond executable: " + lilyExecutableCmd, "I")
else:
  log("-- Lilypond executable not found/set", "E")

if inkscapeExecutableCmd:
  log("-- Inkscape executable: " + inkscapeExecutableCmd, "I")
else:
  log("-- Inkscape executable not found/set", "W")

if pip3Exists:
  log("-- Pip3 found", "I")
else:
  log("-- Pip3 not found", "W")
  log("   Python embedded scripts that require pip3 won't work!", "W")
if venvExists:
  log("-- Python virtual env found/set", "I")
else:
  log("-- Python virtual env not set", "W")
  log("   Python embedded plugins won't work!", "W")

if forkAccessOnly:
  log("-- fork-access-only option set", "I")

if getVenvName() in sys.prefix:
  log("-- Running in virtual env: "+getVenvName(), "I")

log("", "I")
if HTTPServerError == '':
  labelTxt = "Spontini Server initialized"
  log(labelTxt, "I")
else:
  log("Spontini Server can't start: ", "E")
  log("-- "+HTTPServerError, "E")

log("", "I")
log("***********************************", "I")
log("***********************************", "I")
log("", "I")
