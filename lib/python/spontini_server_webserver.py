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
import os
import atexit
from sys import argv
sys.path.insert(1, os.path.join(os.path.dirname(__file__)))
from spontini_server_utils import *

atexit.register(terminateSpawnedProcesses)

webserverName = getWebServerConfParam("webserver-name")
requiredModules = getWebServerConfParam("required-modules")

setSpontiniLogger("spontini", sys.stdout)

log("*** Checking required modules for \""+webserverName+"\" web server ***", "I")
pip3VenvCmd = os.path.join(getVenvedExecDir(), "pip3")
installedModules = subprocess.check_output([pip3VenvCmd, "freeze"], encoding='utf-8')
error = False
for module in requiredModules:
  if module != "":
    try:
      error = not checkAndInstallModule(module, installedModules, log)
      if error:
        break
    except:
      log(traceback.format_exc(), "E")
      error = True
      break

if error:
  log("Installation not completed", "C")
else:
  log("", "I")
  if webserverName == "daphne":
    import daphne.cli
    cliParams = getWebServerConfParam("cli-params")
    setProtocolAndPortForPyGUIFromCLIParams(cliParams, webserverName)
    cliParamsArr = cmdlineSplit(cliParams)
    daphne.cli.CommandLineInterface().run(cliParamsArr)
  elif webserverName == "uvicorn":
    import uvicorn
    from uvicorn_cli import cli
    protocol = "http"
    if "ssl_keyfile" in cli:
      protocol = "https"
    setProtocolAndPortForPyGUI(protocol, cli["port"])
    uvicorn.run(**cli)
