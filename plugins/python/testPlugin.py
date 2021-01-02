#!/usr/bin/env python3
#
# Created (28/09/2020) by Paolo-Prete.
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
from sys import argv
import traceback

def main():

  if len(argv) != 5:
    print("Usage: python3 " + argv[0] + " input_params language inputfile outputfile", file=sys.stderr)
    return 1

  inputParams = argv[1]
  language = argv[2]
  inFileName = argv[3]
  outFileName = argv[4]
  inFile = None
  outFile = None
  spontiniInput = ''
  spontiniOutput = ''

  try:
    inFile = open(inFileName, "r")
    spontiniInput = inFile.read()
    inFile.close()
  except:
    traceback.print_exc()
    return 1

  #---------------------------
  # INSERT CUSTOM CODE HERE
  #---------------------------

  spontiniOutput = "Input to uppercase:\n"
  spontiniOutput += spontiniInput.upper() + "\n"
  spontiniOutput += "Input param: \"" + inputParams + "\"\n"
  spontiniOutput += "Language of the current ly document: " + language + "\n"

  #---------------------------
  # END OF CUSTOM CODE
  #---------------------------

  try:
    outFile = open(outFileName, "wb")
    outFile.write(spontiniOutput.encode('utf-8').strip())
    outFile.close()
  except:
    traceback.print_exc()
    return 1

  return 0

if __name__ == "__main__":
    # execute only if run as a script
    sys.exit(main())
