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
from test_utils import *
import signal
import shutil

webServerProc = runSpontiniServerDaemon()
if webServerProc == None:
  print("Error: can't start SpontiniServer")
  exit(1)

examplesDir = os.path.join(os.path.dirname(__file__), "..", "examples")
body = {'cmd': 'SET_WORKSPACE', 'param1': examplesDir}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK':
  print("Error: can't set workspace")
  exit(1)

cmd = []
for file in sorted(os.listdir(examplesDir)):
  if ".ly" in file:
    cmd.append("http://localhost:8000/spontini-editor/?doc="+file)

cmd.insert(0, "chromium-browser")
subprocess.run(cmd, stderr=subprocess.STDOUT)
webServerProc.send_signal(signal.SIGINT)
shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))
