#!/usr/bin/env python3
#
# Created (03/01/2022) by Paolo-Prete.
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

import os
import subprocess
import time
import urllib
import urllib.request
from urllib.request import urlopen
import json
import traceback
import glob
import signal
import shutil
import platform
import sys

def createBinaryDist():
  HERE = os.path.dirname(__file__)
  proc = [sys.executable, os.path.join(HERE, "..", "bin", "create_binary_dist.py")]
  subprocess.run(proc)

def runSpontiniServerDaemon(runExecutable, maxRetries = 300):
  HERE = os.path.dirname(__file__)
  spontiniServerExec = [sys.executable, os.path.join(HERE, "..", "SpontiniServer.py"), "nogui"]
  if runExecutable:
    versionFile = open(os.path.join(HERE, '..', 'lib', 'version.txt'))
    spontiniVersion = versionFile.read().rstrip()
    versionFile.close()
    platformToken = ""
    execFile = "SpontiniServer"
    if platform.system() == 'Linux':
      platformToken = "linux_x86_64"
    elif platform.system() == 'Windows':
      platformToken = "windows_x86_64"
      execFile += ".exe"
    else:
      platformToken = "darwin_x86_64"
    execFile = os.path.join(HERE, '..', 'bin', 'Spontini-Editor-' + spontiniVersion + '-' + platformToken, execFile)
    spontiniServerExec = [execFile, "nogui"]

  webServerProc = subprocess.Popen(spontiniServerExec, stderr=subprocess.STDOUT)
  #wait until the webserver is ready
  webServerReady = False
  while True and not webServerReady:
    if webServerProc.poll() is not None:
      return None
    else:
      #webserver is running
      url = "http://localhost:8000/spontini-editor"
      try:
        response = urlopen(url)
        webServerReady = True
      except:
        pass
      maxRetries = maxRetries - 1
      if maxRetries == 0:
        print("Could not start SpontiniServer: timeout reached")
        return None
      time.sleep(1)
  return webServerProc

def sendMsgToSpontiniServer(body):
  try:
    if body['cmd'] == 'SHUTDOWN' and platform.system() != "Linux":
      return
    req = urllib.request.Request("http://localhost:8000/cgi")
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    jsonData = json.dumps(body)
    print("REQUEST: " + jsonData)
    response = urllib.request.urlopen(req, jsonData.encode('utf-8'))
    if body['cmd'] == 'SHUTDOWN':
      return
    jsonObj = json.loads(response.read().decode('utf-8'))
    print("RESPONSE[STATUS] : " + jsonObj['status'])
    print("RESPONSE[CONTENT]: " + jsonObj['content'])
    return jsonObj

  except:
    shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))
    if body['cmd'] == 'SHUTDOWN':
      return
    print(traceback.format_exc())
    exit(1)

lineMadeOfStars = "***********************************"
def logTaskLabel(label):
  global lineMadeOfStars
  print("\n")
  print(lineMadeOfStars)
  print("TASK: " + label)
  print(lineMadeOfStars)

def shutdownServer(webServerProc):
  if platform.system() != "Windows":
    webServerProc.send_signal(signal.SIGINT)
  shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))

def shutdownServerAndExit(webServerProc, exitCode):
  if exitCode != 0:
    print("ERROR!")
  shutdownServer(webServerProc)
  exit(exitCode)

def checkStatusAndContent(jsonRes, expectedContent):
  if jsonRes['status'] != 'OK' or jsonRes['content'] != expectedContent:
    shutdownServerAndExit(webServerProc, 1)
