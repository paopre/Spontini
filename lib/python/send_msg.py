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
import httpx
import traceback
from sys import argv
import json

try:
  r = None
  if "https" in argv[1]:
    #we are on the server(localhost)
    r = httpx.post(argv[1], data=argv[2], verify=False, timeout=600)
  else: #http
    r = httpx.post(argv[1], data=argv[2], timeout=600)
  #jsonObj = json.loads(r.read().decode('utf-8'))
  print(r.json()["content"])
except:
  print(traceback.format_exc())
