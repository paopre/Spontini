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

# This script launches Spontini-Server and executes multiple different tests on it
# It can be launched with: python3 spontini_server_test.py
# If a LilyPond supported version is provided as argv[1], it will install and compile a dummy .ly
# file with that version

import sys
import os
from sys import argv
from test_utils import *

def sendMergeTableCellsCmdAndCheck(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, \
                                   resTextFrom, resTextTo, lang = "nederlands"):
  body = {'cmd': 'MERGE_TABLE_CELLS', \
          'param1': textFrom, \
          'param2': fragmentOffsetStart, \
          'param3': fragmentOffsetEnd, \
          'param4': textTo, \
          'param5': lang }
  res = sendMsgToSpontiniServer(body)['content'].split(";;::;;")
  if res[0] != resTextFrom or res[1] != resTextTo:
    shutdownServerAndExit(webServerProc, 1)

def createCompileAndRemoveDummyLyFile():
  lyFilename = os.path.join(testDir, 'test.ly')
  lyFile = open(lyFilename,'w')
  lyFile.write("{ c' c' c' c' }")
  lyFile.close()

  body = { \
          'cmd': 'COMPILE', \
          'param1': lyFilename, \
          'param2': "{ c' c' c' c' }", \
          'param3': "svg", \
          'param4': "", \
          'param5': "" \
         }
  jsonRes = sendMsgToSpontiniServer(body)
  try:
    os.remove(lyFilename)
    os.remove(lyFilename.replace('ly', 'svg'))
  except:
    pass

  if 'OK' not in jsonRes['status']:
    shutdownServerAndExit(webServerProc, 1)

##########################
# TESTS
##########################

runExec = False
if len(argv) > 1 and argv[1] == "run_exec":
  runExec = True
  argv.remove("run_exec")
  createBinaryDist()

webServerProc = runSpontiniServerDaemon(runExec)
if webServerProc == None:
  shutil.rmtree(os.path.join(os.path.dirname(__file__), "__pycache__"))
  exit(1)

examplesDir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "examples"))
testDir = os.path.abspath(os.path.dirname(__file__))
initialWorkspace = ""

##########################

logTaskLabel("GET CURRENT WORKSPACE")
body = {'cmd': 'GET_WORKSPACE'}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK':
  shutdownServerAndExit(webServerProc, 1)
initialWorkspace = jsonRes['content']

##########################

logTaskLabel("SET WORKSPACE TO " + testDir)
body = {'cmd': 'SET_WORKSPACE', 'param1': testDir}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK':
  shutdownServerAndExit(webServerProc, 1)

##########################
if len(argv) > 1:

  logTaskLabel("INSTALL LILYPOND " + argv[1])
  body = {'cmd': 'INSTALL_LILYPOND', 'param1': argv[1]}
  jsonRes = sendMsgToSpontiniServer(body)
  if jsonRes['status'] != 'OK':
    shutdownServerAndExit(webServerProc, 1)

##########################

  logTaskLabel("SET LILYPOD TO " + jsonRes['content'])
  body = {'cmd': 'SET_LILYPOND', 'param1': jsonRes['content']}
  jsonRes = sendMsgToSpontiniServer(body)
  if jsonRes['status'] != 'OK':
    shutdownServerAndExit(webServerProc, 1)

##########################

  logTaskLabel("CREATE, COMPILE AND REMOVE DUMMY .ly FILE")
  createCompileAndRemoveDummyLyFile()

##########################

logTaskLabel("RESET LILYPOND")
body = {'cmd': 'RESET_LILYPOND'}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK':
  shutdownServerAndExit(webServerProc, 1)

##########################

logTaskLabel("CREATE, COMPILE AND REMOVE DUMMY .ly FILE")
createCompileAndRemoveDummyLyFile()

##########################

logTaskLabel("SET WORKSPACE TO " + examplesDir)
body = {'cmd': 'SET_WORKSPACE', 'param1': examplesDir}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK':
  shutdownServerAndExit(webServerProc, 1)

##########################

exampleName = "padding-on-brackets-example"
logTaskLabel("CREATE PDF FILE FROM " + exampleName + ".ly")
body = {'cmd': 'CREATE_PDF', 'param1': exampleName + '.ly'}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK' or \
   os.path.getsize(os.path.join(examplesDir, exampleName + "-svgexport.pdf")) <= 0:
  shutdownServerAndExit(webServerProc, 1)
else:
  os.remove(os.path.join(examplesDir, exampleName + "-svgexport.pdf"))

##########################

logTaskLabel("CREATE ZIP FILE FROM " + exampleName + ".ly")
body = {'cmd': 'CREATE_ZIP', 'param1': exampleName + '.ly'}
jsonRes = sendMsgToSpontiniServer(body)
if jsonRes['status'] != 'OK' or \
   os.path.getsize(os.path.join(examplesDir, exampleName + ".zip")) <= 0:
  shutdownServerAndExit(webServerProc, 1)
else:
  os.remove(os.path.join(examplesDir, exampleName + ".zip"))

##########################

body = { \
'cmd': 'EXEC_PLUGIN', \
'param1': "", \
'param2': "c'[\\mf(-!^\"foo\"\\trill c'\\)\\mordent\\p-.]", \
'param3': "", \
'param4': "", \
'param5': "nederlands" }
logTaskLabel("EXECUTE REMOVE ARTICULATIONS PLUGIN")
body['param1'] = "Remove articulations"
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "c'[\\mf(^\"foo\"\\trill c'\\)\\mordent\\p]")

##########################

logTaskLabel("EXECUTE REMOVE DYNAMICS PLUGIN")
body['param1'] = "Remove dynamics"
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "c'[(-!^\"foo\"\\trill c'\\)\\mordent-.]")

##########################

logTaskLabel("EXECUTE REMOVE ORNAMENTS PLUGIN")
body['param1'] = "Remove ornaments"
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "c'[\\mf(-!^\"foo\" c'\\)\\p-.]")

##########################

logTaskLabel("EXECUTE REMOVE SLURS PLUGIN")
body['param1'] = "Remove slurs"
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "c'[\\mf-!^\"foo\"\\trill c'\\mordent\\p-.]")

##########################

logTaskLabel("EXECUTE REMOVE TEXT MARKUP PLUGIN")
body['param1'] = "Remove text markup"
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "c'[\\mf(-!\\trill c'\\)\\mordent\\p-.]")

##########################

logTaskLabel("EXECUTE TRANSPOSE PLUGIN 1")
body['param1'] = "Transpose"
body['param2'] = "c' d' e\mf <a a,>"
body['param3'] = ""
body['param4'] = "e e'"
body['param5'] = "nederlands"
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "c'' d'' e'\mf <a' a>")

##########################

logTaskLabel("EXECUTE TRANSPOSE PLUGIN 2")
body['param1'] = "Transpose"
body['param2'] = "<do' mi' sol''>\pp fa'^\"text\" re,"
body['param3'] = ""
body['param4'] = "do do,"
body['param5'] = "italiano"
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "<do mi sol'>\pp fa^\"text\" re,,")

##########################

logTaskLabel("EXECUTE MUSICXML TO LY PLUGIN")
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

##########################

logTaskLabel("TRANSLATE PITCHES")
body = {'cmd': 'TRANSLATE_PITCHES', 'param1': "<c' d' e,> f", 'param2': "italiano"}
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "<mi, fa do' re'> fa")

##########################

lang = "nederlands"
logTaskLabel("MERGE 1) NOTE --> NOTE --> NOTE")
sendMergeTableCellsCmdAndCheck("\\CS a''", 4, 6, "\\tuplet 3/2 { e'\\mf", \
                               "\\CS s", "\\tuplet 3/2 { <e' a''>\\mf")

##########################

logTaskLabel("MERGE 2) NOTE --> NOTE --> NOTES")
sendMergeTableCellsCmdAndCheck("\\CS a'", 4, 5, "\\tuplet 3/2 { <e' f''>\mf", \
                                         "\\CS s", "\\tuplet 3/2 { <e' a' f''>\\mf")

##########################

logTaskLabel("MERGE 3) NOTE --> NOTE --> SPACER/REST")
sendMergeTableCellsCmdAndCheck("\\CS a''", 4, 6, "\\tuplet 3/2 { s\\mf", \
                               "\\CS s", "\\tuplet 3/2 { a''\mf")

##########################

logTaskLabel("MERGE 4) NOTES --> NOTE --> NOTE")
sendMergeTableCellsCmdAndCheck("\\CS <a' b''>", 5, 6, "\\tuplet 3/2 { e'\\mf", \
                               "\\CS b''", "\\tuplet 3/2 { <e' a'>\\mf")

##########################

logTaskLabel("MERGE 5) NOTES --> NOTE --> NOTES")
sendMergeTableCellsCmdAndCheck("\\CS <a'' b'>", 5, 7, "\\tuplet 3/2 { <e' f, g,>\\mf", \
                               "\\CS b'", "\\tuplet 3/2 { <f, g, e' a''>\\mf")

##########################

logTaskLabel("MERGE 6) NOTES --> NOTE --> SPACER/REST")
sendMergeTableCellsCmdAndCheck("\\CS <a'' b'>", 9, 10, "\\tuplet 3/2 s\\mf", \
                               "\\CS a''", "\\tuplet 3/2 b'\\mf")

##########################

logTaskLabel("MERGE 7) NOTES --> NOTES --> NOTE (a)")
sendMergeTableCellsCmdAndCheck("\\CS <b' a' c''>", 5, 9, "\\tuplet 3/2 { e''\\mf", \
                               "\\CS c''", "\\tuplet 3/2 { <a' b' e''>\mf")

##########################

logTaskLabel("MERGE 8) NOTES --> NOTES --> NOTE (b)")
sendMergeTableCellsCmdAndCheck("\\CS <a' b''>", 5, 10, "\\tuplet 3/2 { e''\\mf", \
                               "\\CS s", "\\tuplet 3/2 { <a' e'' b''>\\mf")

##########################

logTaskLabel("MERGE 9) NOTES --> NOTES --> NOTES")
sendMergeTableCellsCmdAndCheck("\\CS <a'' b' c'>", 5, 12, "\\tuplet 3/2 { <e' f, g,>\\mf", \
                               "\\CS s", "\\tuplet 3/2 { <f, g, c' e' b' a''>\\mf")

##########################

logTaskLabel("MERGE 10) NOTES --> NOTES --> SPACER/REST")
sendMergeTableCellsCmdAndCheck("\\CS <a' c''>", 5, 10, "\\tuplet 3/2 { s\\mf", \
                               "\\CS s", "\\tuplet 3/2 { <a' c''>\\mf")

##########################

logTaskLabel("MERGE 11) NOTE --> NOTE --> SPACER/REST")
textFrom    = "\\growingBeamVolatina 3 { <re' mi' fad'>8\\sustainOn\\ppp_\\subito 0.5\\<"
textTo      = "\\growingBeamVolatina 3 { mi''8[                                     "
resTextFrom = "\\growingBeamVolatina 3 { <re' fad'>8\\sustainOn\\ppp_\\subito 0.5\\<"
resTextTo   = "\\growingBeamVolatina 3 { <mi' mi''>8[                                     "
sendMergeTableCellsCmdAndCheck(textFrom, 30, 32, textTo, resTextFrom, resTextTo, "italiano")

##########################

logTaskLabel("MERGE 12) NOTES --> NOTES --> SPACER/REST")
sendMergeTableCellsCmdAndCheck("\\CS <do' re''>\p", 5, 10, "\\tuplet 3/2 { s\mf", \
                               "\\CS s\\p", "\\tuplet 3/2 { <do' re''>\\mf", "italiano")

##########################

logTaskLabel("MERGE 13) NOTES --> NOTES --> NOTES")
sendMergeTableCellsCmdAndCheck("<d dis' a''>", 6, 9, "<f g>", "d", "<f g dis' a''>")

##########################

logTaskLabel("CONVERT PITCHES TO ENHARMONIC")
body = {'cmd': 'CONVERT_PITCHES_TO_ENHARMONIC', \
        'param1': "<cis'' ees>4 fes'", \
        'param2': 2, \
        'param3': 14, \
        'param4': "nederlands"}
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "<des'' diss>4 e'")

##########################

logTaskLabel("CONVERT PITCHES TO ENHARMONIC")
body = {'cmd': 'CONVERT_PITCHES_TO_ENHARMONIC', \
        'param1': "<dod'' solb>4 fad'", \
        'param2': 2, \
        'param3': 15, \
        'param4': "italiano"}
jsonRes = sendMsgToSpontiniServer(body)
checkStatusAndContent(jsonRes, "<reb'' fad>4 solb'")

##########################

logTaskLabel("SET WORKSPACE TO INITIAL VALUE: " + initialWorkspace)
body = {'cmd': 'SET_WORKSPACE', 'param1': initialWorkspace}
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
