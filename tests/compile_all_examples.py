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

# This test compiles all the examples with all the supported LilyPond versions, which are downloaded
# and installed into the "lilyponds" directory.
# It can be launched with:
# 1) python3 compile_all_examples.py (all the supported LilyPond versions are tested)
# OR
# 2) python3 compile_all_examples.py VERSION1 VERSION2 ... VERSIONn (test only a subset of versions)
# If "remove_installation" is provided as argv, each installed version is removed after all the examples are compiled with it

import re
import os
import sys
import glob
import traceback
import subprocess
import shutil
import fileinput
from sys import argv
spontini_utils_path = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                      '..', 'lib', 'python'))
sys.path.insert(1, spontini_utils_path)
from spontini_server_utils import *

acceptableWarnings = [
  "skipping zero-duration score",
  "to suppress this, consider adding a spacer rest",
  "omitting tuplet bracket with neither left nor right bound",
  "no music found in score",
  "ignoring unsupported formats (pdf)"
]

lilyPondsDir = os.path.join(os.path.dirname(__file__), "..", "lilyponds")
removeTkn = "remove_installation"
removeInstallationFlag = False
if removeTkn in argv:
  argv.remove(removeTkn)
  removeInstallationFlag = True

manyStars = "******************************\n******************************"
longLine =  "______________________________"

lilyPondVersions = getAutoinstallableLilyPondList().keys()
for lilyPondVersion in lilyPondVersions:

  if len(argv) > 1 and not lilyPondVersion in argv:
    continue

  print("")
  print(manyStars)
  print("Downloading and installing LilyPond " + lilyPondVersion)
  print(manyStars)
  lilyExec = ""
  try:
    lilyExec = installLilyPond(lilyPondVersion, lilyPondsDir)
  except:
    print("Error installing LilyPond " + lilyPondVersion)
    exit(1)

  print("")
  print(manyStars)
  print("Compile all the examples on LilyPond " + lilyPondVersion)
  print(manyStars)

  examplesPath = os.path.join(os.path.dirname(__file__), '..', "examples")
  for currFile in os.listdir(examplesPath):
    if currFile.endswith(".ly") and currFile != "chunks-example.ly":
      print("")
      print(longLine)
      print("COMPILING:")
      print(currFile)
      print(longLine)
      cmd = [lilyExec,
            "-dmidi-extension=midi", "-dbackend=svg",
            "-o", examplesPath, os.path.join(examplesPath, currFile)]

      p = subprocess.run(cmd, encoding='utf-8',
                         stderr=subprocess.STDOUT, stdout=subprocess.PIPE)

      if p.returncode == 0:
        outLines = p.stdout
        print(outLines)

        outLinesArr = outLines.split('\n')
        for outLine in outLinesArr:
          if "warning" in outLine and not any(x in outLine for x in acceptableWarnings):
            print("Got suspicious warning during compile: " + outLine)
            exit(1)

      else:
        print("Error compiling " + currFile)
        exit(1)

  # Replace personal path with dummy path for point and click
  # How would be life without #regex channel on Libera #irc?
  regex = r"(?<=xlink:href=\")((?:\w+://)?[^:]*?)[\w.-]+(?=(?::\d+){3}\")"
  for currFile in os.listdir(examplesPath):
    if currFile.endswith(".svg"):
      with fileinput.FileInput(os.path.join(examplesPath, currFile), inplace=True) as file:
        for line in file:
          result = re.sub(regex, "textedit:///dummy/path/file.ly", line, 0, re.MULTILINE)
          print(result, end='')

  if removeInstallationFlag == True:
    try:
      uninstallLilyPond(lilyPondVersion, lilyPondsDir)
    except:
      print("Error uninstalling LilyPond " + lilyPondVersion)
      exit(1)
