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

# This script launches Spontini-Server and a Cypress instance that runs webgui-test-1/2.js

# Example:
# python3 webgui_tests.py npx cypress run --env testnum=2,timeout=20000 --config-file tests/cypress.config.js --config specPattern=tests/ --browser chrome --spec tests/run-webgui-test.cy.js

import sys
import os
from sys import argv
from test_utils import *

runExec = False
if len(argv) > 1 and argv[1] == "run_exec":
  runExec = True
  argv.remove("run_exec")
  createBinaryDist()

webServerProc = runSpontiniServerDaemon(runExec)
if webServerProc == None:
  shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))
  exit(1)

cypressProc = subprocess.run(argv[1:])
#TODO? this works only on Linux. Implement on Macos and Win too?
shutdownServerAndExit(webServerProc, cypressProc.returncode)
