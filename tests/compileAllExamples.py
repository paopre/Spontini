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
import sys
import glob
import traceback
import subprocess
import shutil
from sys import argv

switchToGitLabIdx = 12

lilyPondItems = [
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.19.84-1.linux-64.sh", "2.19.84-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.20.0-1.linux-64.sh",  "2.20.0-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.22.0-1.linux-64.sh",  "2.22.0-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.22.1-1.linux-64.sh",  "2.22.1-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.22.2-1.linux-64.sh",  "2.22.2-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.23.0-1.linux-64.sh",  "2.23.0-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.23.1-1.linux-64.sh",  "2.23.1-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.23.2-1.linux-64.sh",  "2.23.2-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.23.3-1.linux-64.sh",  "2.23.3-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.23.4-1.linux-64.sh",  "2.23.4-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.23.5-1.linux-64.sh",  "2.23.5-1"],
  ["http://lilypond.org/download/binaries/linux-64/lilypond-2.23.6-1.linux-64.sh",  "2.23.6-1"],
#  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.7/downloads/lilypond-2.23.7-linux-x86_64.tar.gz",
#   "2.23.7"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.8/downloads/lilypond-2.23.8-linux-x86_64.tar.gz",
   "2.23.8"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.9/downloads/lilypond-2.23.9-linux-x86_64.tar.gz",
   "2.23.9"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.10/downloads/lilypond-2.23.10-linux-x86_64.tar.gz",
   "2.23.10"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.11/downloads/lilypond-2.23.11-linux-x86_64.tar.gz",
   "2.23.11"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.12/downloads/lilypond-2.23.12-linux-x86_64.tar.gz",
   "2.23.12"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.13/downloads/lilypond-2.23.13-linux-x86_64.tar.gz",
   "2.23.13"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.14/downloads/lilypond-2.23.14-linux-x86_64.tar.gz",
   "2.23.14"],
  ["https://gitlab.com/lilypond/lilypond/-/releases/v2.23.80/downloads/lilypond-2.23.80-linux-x86_64.tar.gz",
   "2.23.80"]
]

acceptableWarnings = [
  "skipping zero-duration score",
  "to suppress this, consider adding a spacer rest",
  "omitting tuplet bracket with neither left nor right bound",
  "no music found in score",
  "ignoring unsupported formats (pdf)"
]

lilyPondsDir = os.path.join(os.path.dirname(__file__), "..", "..", "LilyPonds")
removeTkn = "remove_installation"
removeInstallationFlag = False
if removeTkn in argv:
  argv.remove(removeTkn)
  removeInstallationFlag = True

def removeInstallationIfRequired(version):
  global lilyPondsDir
  global removeInstallationFlag
  if removeInstallationFlag:
    print("Removing local installation of LilyPond " + version + "...")
    partialPath = os.path.join(lilyPondsDir, version)
    shutil.rmtree(partialPath)
    for filename in glob.glob(partialPath + "*"):
        os.remove(filename)
    print("Done")

ctr = 0
for lilyPondItem in lilyPondItems:

  if len(argv) > 1 and not lilyPondItem[1] in argv:
    ctr = ctr + 1
    continue

  manyStars = "******************************"
  longLine =  "______________________________"

  print("")
  print(manyStars)
  print(manyStars)
  print("Compile all the examples on LilyPond " + lilyPondItem[1])
  print(manyStars)
  print(manyStars)

  if not os.path.exists(lilyPondsDir):
    ret = os.system("mkdir " + lilyPondsDir)
    if ret != 0:
      print("Error creating LilyPonds dir")
      exit(1)

  if not os.path.exists(os.path.join(lilyPondsDir, lilyPondItem[1])):
    print("")
    print("DOWNLOADING LILYPOND " + lilyPondItem[1])
    print(longLine)

    extension = ".tar.gz"
    if ctr < switchToGitLabIdx:
      extension = ".sh"
    ret = os.system("wget " + lilyPondItem[0] + " -O " +
                    os.path.join(lilyPondsDir, lilyPondItem[1] + extension))
    if ret != 0:
      print ("Error downloading " + lilyPondItem[1] + " from " + lilyPondItems[0])
      exit(1)

    print("")
    print("INSTALLING LILYPOND " + lilyPondItem[1])
    print(longLine)

    if ctr < switchToGitLabIdx:
      ret = os.system("echo '\n' | sh " + os.path.join(lilyPondsDir, lilyPondItem[1] + \
                      extension) + " --prefix " + os.path.join(lilyPondsDir, lilyPondItem[1]))
    else:
      ret =  os.system("mkdir " + os.path.join(lilyPondsDir, lilyPondItem[1]))
      ret &= os.system("tar -zxvf " + os.path.join(lilyPondsDir, lilyPondItem[1] + extension) + \
                       " -C " + os.path.join(lilyPondsDir, lilyPondItem[1]) + \
                       " --strip-components=1")

    if ret != 0:
      print ("Error installing " + lilyPondItem[1])
      exit(1)

  examplesPath = os.path.join(os.path.dirname(__file__), '..', "examples")
  for currFile in os.listdir(examplesPath):
    if currFile.endswith(".ly") and currFile != "chunks-example.ly":
      print("")
      print(longLine)
      print("COMPILING:")
      print(currFile)
      print(longLine)
      cmd = [os.path.join(lilyPondsDir, lilyPondItem[1], "bin", "lilypond"),
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

  removeInstallationIfRequired(lilyPondItem[1])
  ctr = ctr + 1
