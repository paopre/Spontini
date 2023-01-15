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
import glob
import urllib
import urllib.request
from urllib import request
from urllib.request import urlopen
import zipfile
import platform
from pathlib import Path
import tarfile
from os.path import basename
import xml.etree.ElementTree as ET
import pathlib
from datetime import datetime
import colorlog
from colorlog import ColoredFormatter
import zipfile
import ssl
#?? REMOVE!
import tkinter as tk
from tkinter import *
from tkinter.filedialog import askdirectory
from tkinter.filedialog import askopenfilename

spontiniLogger = None
textArea = None
msgQueueForTkGUI = None
asgiServer = None

def setASGIServerInstance(server):
  global asgiServer
  asgiServer = server

def getASGIServerInstance():
  return asgiServer

def setMsgQueueForTkGUI(q):
  global msgQueueForTkGUI
  msgQueueForTkGUI = q

def getSpontiniLogger():
  return spontiniLogger

def getLibPythonPath():
  if getattr(sys, 'frozen', False):
    return os.path.join(os.path.dirname(sys.executable), 'lib', 'python')
  else:
    return os.path.dirname(__file__)

def setSpontiniLogger():
  global spontiniLogger
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
  streamHandler = logging.StreamHandler()
  streamHandler.setFormatter(formatter)
  spontiniLogger = logging.getLogger("spontini")
  # prevents duplication of msgs. See:
  # https://stackoverflow.com/questions/11820338/replace-default-handler-of-python-logger
  # TODO could not be necessary anymore
  spontiniLogger.handlers = []
  spontiniLogger.addHandler(streamHandler)
  spontiniLogger.propagate = False
  spontiniLogger.setLevel(logging.INFO-1)

  #TODO customize for other possible ASGI webserver too
  if "uvicorn" in sys.modules:
    class UvicornCustomLogHandler(logging.Handler):
      def emit(self, record):
        #critical', 'error', 'warning', 'info', 'debug', 'trace'.
        tag = "I"
        if record.levelname.lower() == "warning":
          tag = "W"
        elif record.levelname.lower() == "critical" or record.levelname.lower() == "error":
          tag = "E"
        msg = record.getMessage()
        if "uvicorn running on" in msg.lower():
          msgSplit = msg.split(' ')
          if len(msgSplit) >= 4:
            msgOrig = msg
            msg = "\nRun the editor on the browser by opening:\n" + msgSplit[3] + "/spontini-editor "
            if (len(msgSplit) > 4) and \
                ("(press" in msgSplit[4].lower()) and \
                msgQueueForTkGUI == None:
              msg += " ".join(msgSplit[4:])
        log(msg, tag)

    logHandler = UvicornCustomLogHandler()
    logging.getLogger("uvicorn").handlers = []
    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn").addHandler(logHandler)


def getWebserverParam(param):
  try:
    path = os.path.abspath(os.path.join(getLibPythonPath(), "protocolAndPort"))
    fp = open(path,'r')
    ret = ""
    if param == "protocol":
      ret = fp.readline().rstrip().split(":")[0]
    else:
      ret = int(fp.readline().rstrip().split(":")[1])
    fp.close()
    return ret
  except:
    pass

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

def mute(a, b):
  pass

def log(msg, logType = ""):

  global msgQueueForTkGUI
  if msgQueueForTkGUI != None:
    msgQueueForTkGUI.put([msg, logType])
    return

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

#TODO ugly exception handling, must be fixed
def getSupportedLilyPondList():
  supportedLilypondVersions = os.path.join(getLibPythonPath(), "..", "supported_lilyponds.txt")
  lilypondLinksFile = os.path.join(getLibPythonPath(), "..", "lilypond_links.xml")
  f = open(supportedLilypondVersions,'r')
  versions = [line.rstrip() for line in f]
  lilyItems = {}
  for version in versions:
    version = version.replace("[D]", "")
    if version.startswith("#"):
      continue
    linUrl    = ""
    winUrl    = ""
    darwinUrl = ""
    tree = ET.parse(lilypondLinksFile)
    root = tree.getroot()
    for tag in root.findall('lilypond'):
      if version in tag.get('versions'):
        linUrl    = tag.get('linux').replace("%%VERSION%%", version)
        darwinUrl = tag.get('darwin').replace("%%VERSION%%", version)
        winUrl    = tag.get('windows').replace("%%VERSION%%", version)
        break
      elif tag.get('versions') == 'others':
        linUrl    = tag.get('linux').replace("%%VERSION%%", version)
        darwinUrl = tag.get('darwin').replace("%%VERSION%%", version)
        winUrl    = tag.get('windows').replace("%%VERSION%%", version)

    isBlacklisted = False
    try:
      blacklistedVersionsFile = open(os.path.join(getLibPythonPath(), "..", "blacklisted_lilyponds_" + platform.system().lower() + ".txt"),'r')
      blacklistedVersions = [line.rstrip() for line in blacklistedVersionsFile]
      if version in blacklistedVersions:
        isBlacklisted = True
      blacklistedFile.close()
    except:
      pass
    if not isBlacklisted:
      lilyItems[version] = { "Linux" : linUrl, "Darwin" : darwinUrl, "Windows": winUrl }
  f.close()
  return lilyItems

def getDefaultLilypondVersion():
  supportedLilypondVersions = os.path.join(getLibPythonPath(), "..", "supported_lilyponds.txt")
  f = open(supportedLilypondVersions,'r')
  versions = [line.rstrip() for line in f]
  ret = ""
  for version in versions:
    if "[D]" in version:
      ret = version.replace("[D]", "")
  f.close()
  return ret

def getAutoinstallableLilyPondList():
  lilyItems = getSupportedLilyPondList()
  filteredItems = {}
  for k, v in lilyItems.items():
    if v[platform.system()] != "":
      filteredItems[k] = v
  return filteredItems

def getPathOfInstalledLilyPond(version, installBaseDir):
  try:
    dirs = [d for d in os.listdir(installBaseDir) if d.endswith(version)]
    if len(dirs) == 0:
      return ""
    installDir = os.path.join(installBaseDir, dirs[0])
    platSys = platform.system()
    if platSys == "Linux":
      lilyPondExec = os.path.abspath(os.path.join(installDir, "bin", "lilypond"))
      return lilyPondExec
    elif platSys == "Windows":
      for lilyPondExec in pathlib.Path(installDir).rglob("lilypond.exe"):
        return str(lilyPondExec)
    elif platSys == "Darwin":
      for lilyPondExec in pathlib.Path(installDir).rglob("lilypond"):
        lastElem = os.path.basename(os.path.normpath(lilyPondExec.parent))
        if lastElem == 'bin':
          return str(lilyPondExec)
  except:
    return ""
  return ""

def installLilyPond(version, installBaseDir):
  platSys = platform.system()
  autoinstallableLilypondItems = getAutoinstallableLilyPondList()
  supportedLilypondItems = getSupportedLilyPondList()

  if version not in supportedLilypondItems:
    raise Exception("Version " + version + " not supported")

  if version in supportedLilypondItems and version not in autoinstallableLilypondItems:
    raise Exception("Can't install " + version + " version automatically. Please install it manually")

  lilyExecPath = getPathOfInstalledLilyPond(version, installBaseDir)
  if lilyExecPath != "":
    return lilyExecPath

  Path(installBaseDir).mkdir(parents=True, exist_ok=True)

  if not os.path.exists(os.path.join(installBaseDir, version)):
    extension = ".tar.gz"
    if ".sh" in autoinstallableLilypondItems[version][platSys]:
      extension = ".sh"
    if ".zip" in autoinstallableLilypondItems[version][platSys]:
      extension = ".zip"
    if ".tar.bz2"  in autoinstallableLilypondItems[version][platSys]:
      extension = ".tar.bz2"

    ssl._create_default_https_context = ssl._create_unverified_context
    #ctx = ssl.create_default_context()
    #ctx.check_hostname = False
    #ctx.verify_mode = ssl.CERT_NONE
    archiveFile = None
    url = autoinstallableLilypondItems[version][platSys]
    try:
      archiveFile = request.urlopen(request.Request(url)).info().get_filename()
    except:
      pass

    if not archiveFile:
      response = urlopen(autoinstallableLilypondItems[version][platSys])
      archiveFile = basename(response.url)

    archiveFile = os.path.join(installBaseDir, archiveFile)

    urllib.request.urlretrieve(autoinstallableLilypondItems[version][platSys], archiveFile)

    if extension == ".sh":
      ret = os.system("echo '\n' | sh " + archiveFile + " --prefix " + os.path.join(installBaseDir, "lilypond-"+version))
    elif extension == ".tar.gz" or extension == ".tar.bz2":
      archive = tarfile.open(archiveFile)
      extractDir = installBaseDir
      if platSys == "Darwin":
        extractDir = os.path.join(installBaseDir, "lilypond-" + version)
      archive.extractall(extractDir)
      archive.close()
    else: #zip
      with zipfile.ZipFile(archiveFile, 'r') as zipRef:
          zipRef.extractall(installBaseDir)

    os.remove(archiveFile)

  lilyExecPath = getPathOfInstalledLilyPond(version, installBaseDir)
  if lilyExecPath != "":
    return lilyExecPath

  return ""

def uninstallLilyPond(version, installBaseDir):
  lilyDir = ""
  for file in os.listdir(installBaseDir):
    d = os.path.join(installBaseDir, file)
    if os.path.isdir(d) and d.endswith(version):
      lilyDir = d
      break
  shutil.rmtree(lilyDir)
  for filename in glob.glob(lilyDir + "*"):
    os.remove(filename)
  if len(os.listdir(installBaseDir)) == 0:
    shutil.rmtree(installBaseDir)

  return "OK"
