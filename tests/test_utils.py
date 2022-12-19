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

def runSpontiniServerDaemon(maxRetries = 120):
  spontiniServerExec = ["python3", os.path.join(os.path.dirname(__file__), "..", "SpontiniServer.py"), "nogui"]
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
    req = urllib.request.Request("http://localhost:8000/cgi")
    req.add_header('Content-Type', 'application/json; charset=utf-8')
    jsonData = json.dumps(body)
    print("REQUEST: " + jsonData)
    response = urllib.request.urlopen(req, jsonData.encode('utf-8'))
    jsonObj = json.loads(response.read().decode('utf-8'))
    print("RESPONSE[STATUS] : " + jsonObj['status'])
    print("RESPONSE[CONTENT]: " + jsonObj['content'])
    return jsonObj

  except:
    print(traceback.format_exc())
    shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))
    exit(1)
