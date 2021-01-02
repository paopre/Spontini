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

# transpose script which calls python-ly ( https://pypi.org/project/python-ly/ )

import os
import sys
import subprocess
from sys import argv
import traceback
spontini_utils_path = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                      '..', '..', 'lib', 'python'))
sys.path.insert(1, spontini_utils_path)
from spontini_server_utils import getVenvedPyCmd
lyModuleFound = False
try:

  import ly.document
  lyModuleFound = True

except:
  pass

def main():

  if len(argv) != 5:
    print("Usage: python3 " + argv[0] + " input_params language inputfile outputfile", file=sys.stderr)
    return 1

  if not lyModuleFound:
    print(getVenvedPyCmd() + " -m pip install python-ly")
    traceback.print_exc()
    return 2

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
    print(traceback.format_exc(), file=sys.stderr)
    return 1

  try:

    inFile = open(inFileName, "wb")
    inFile.write(("{ " + inputParams + " }").encode('utf-8').strip())
    inFile.close()

  except:
    print(traceback.format_exc(), file=sys.stderr)
    return 1

  try:

    cmd = [getVenvedPyCmd(), '-m', 'ly', '-l', language, 'translate nederlands', '-o', outFileName, inFileName]
    p = subprocess.run(cmd, encoding='utf-8', stderr=subprocess.PIPE, stdout=subprocess.PIPE)

    inputParamsInNederlands = 'will-be-replaced'
    outFile = open(outFileName, "r")
    lines = outFile.readlines()
    for line in lines:
      if line.startswith("{"):
        inputParamsInNederlands = line[1:(len(line)-1)]
    outFile.close()

    inFile = open(inFileName, "wb")
    spontiniInput = "{ " + spontiniInput + " }"
    inFile.write(spontiniInput.encode('utf-8').strip())
    inFile.close()

    cmd = [getVenvedPyCmd(), '-m', 'ly', '-l', language, 'transpose ' + inputParamsInNederlands, '-o', outFileName, inFileName]
    p = subprocess.run(cmd, encoding='utf-8', stderr=subprocess.STDOUT, stdout=subprocess.PIPE)

    if p.returncode != 0:
      print("Error while executing command: " + str(cmd), file=sys.stderr)
      #?? stdout instead of stderr
      print(p.stdout, file=sys.stderr)
      return 1

    print(p.stdout)

    outFile = open(outFileName, "r")
    spontiniOutput = outFile.read()
    outFile.close()

  except:
    print(traceback.format_exc(), file=sys.stderr)
    return 1

  try:
    spontiniOutput = spontiniOutput[2:(len(spontiniOutput)-2)]
  except:
    pass

  try:
    outFile = open(outFileName, "wb")
    outFile.write(spontiniOutput.encode('utf-8'))
    outFile.close()
  except:
    print(traceback.format_exc(), file=sys.stderr)
    return 1

  return 0

if __name__ == "__main__":
  # execute only if run as a script
  sys.exit(main())
