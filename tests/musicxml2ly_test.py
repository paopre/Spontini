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

# This script launches Spontini-Server and tests musicxml2ly plugin for all the supported
# LilyPond versions. If a set of versions is in argv, tests will be made only for that set. If "remove_installation" is provided in argv, each installed LilyPond version is removed.

import sys
import os
import platform
from sys import argv
from test_utils import *

##########################
# TESTS
##########################

def musicXMLToLyTask():
  logTaskLabel("EXECUTE MUSICXML TO LY PLUGIN")
  body = { \
  'cmd': 'EXEC_PLUGIN', \
  'param1': "", \
  'param2': "", \
  'param3': "", \
  'param4': "", \
  'param5': "" \
  }

  body['param1'] = "Musicxml to ly"
  body['param2'] = "\
  <score-partwise version=\"4.0\"> \
    <part-list> \
      <score-part id=\"P1\"> \
        <part-name>Music</part-name> \
      </score-part> \
    </part-list> \
    <part id=\"P1\"> \
      <measure number=\"1\"> \
        <attributes> \
          <divisions>1</divisions> \
          <key> \
            <fifths>0</fifths> \
          </key> \
          <time> \
            <beats>4</beats> \
            <beat-type>4</beat-type> \
          </time> \
          <clef> \
            <sign>G</sign> \
            <line>2</line> \
          </clef> \
        </attributes> \
        <note> \
          <pitch> \
            <step>C</step> \
            <octave>4</octave> \
          </pitch> \
          <duration>4</duration> \
          <type>whole</type> \
        </note> \
      </measure> \
    </part> \
  </score-partwise>"

  jsonRes = sendMsgToSpontiniServer(body)
  matches = ["4/4", "\\score {", "\"treble\""]
  if jsonRes['status'] != 'OK' or not all(x in jsonRes['content'] for x in matches):
    shutdownServerAndExit(webServerProc, 1)

runExec = False
if len(argv) > 1 and argv[1] == "run_exec":
  runExec = True
  argv.remove("run_exec")
  createBinaryDist()

webServerProc = runSpontiniServerDaemon(runExec)
if webServerProc == None:
  shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))
  exit(1)

##########################

examplesDir = os.path.join(os.path.dirname(__file__), "..", "examples")
testDir = os.path.dirname(__file__)
initialWorkspace = ""

removeTkn = "remove_installation"
removeInstallationFlag = False
if removeTkn in argv:
  argv.remove(removeTkn)
  removeInstallationFlag = True

##########################

logTaskLabel("GET AUTOINSTALLABLE LILYPONDS LIST ")
body = {'cmd': 'AUTOINSTALLABLE_LILYPONDS_LIST'}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK':
  shutdownServerAndExit(webServerProc, 1)
versions = jsonRes['content'].split(";;::;;")

for version in versions:

  if len(argv) > 1 and version not in argv:
    continue

  #WARNING musicxlm2ly in 2.23.8 version seems buggy, skip it
  if version == "2.23.8":
    continue

  #Same as above...
  if (version == "2.20.0-1") and (platform.system() == 'Darwin'):
    continue

  logTaskLabel("INSTALL LILYPOND " + version)
  body = {'cmd': 'INSTALL_LILYPOND', 'param1': version}
  jsonRes = sendMsgToSpontiniServer(body)
  if jsonRes['status'] != 'OK':
    shutdownServerAndExit(webServerProc, 1)

  logTaskLabel("SET LILYPOND TO " + jsonRes['content'])
  body = {'cmd': 'SET_LILYPOND', 'param1': jsonRes['content']}
  jsonRes = sendMsgToSpontiniServer(body)
  if jsonRes['status'] != 'OK':
    shutdownServerAndExit(webServerProc, 1)

  musicXMLToLyTask()

  if removeInstallationFlag:
    logTaskLabel("UNINSTALL LILYPOND " + version)
    body = {'cmd': 'UNINSTALL_LILYPOND', 'param1': version}
    jsonRes = sendMsgToSpontiniServer(body)
    if jsonRes['status'] != 'OK':
      shutdownServerAndExit(webServerProc, 1)

##########################

print("\n")
print(lineMadeOfStars)
print(lineMadeOfStars)
print("ALL TASKS PASSED SUCCESSFULLY!")
print(lineMadeOfStars)
print(lineMadeOfStars)

#TODO FIXME: doesn't seem to work properly on Win and Macos
try:
  sendMsgToSpontiniServer({'cmd': 'SHUTDOWN'})
except:
  pass

shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))
