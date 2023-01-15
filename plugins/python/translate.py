#!/usr/bin/env python3
#
# Created (10/01/2023) by Paolo-Prete.
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
import ly.document
import re

try:

  targetLanguage = argv[1]
  inFileName     = argv[2]
  outFileName    = argv[3]
  inFile = None
  outFile = None
  spontiniInput = ''
  spontiniOutput = ''

  inFile = open(inFileName, "r")
  musicExpr = inFile.read()
  inFile.close()

  doc = ly.document.Document("{" + musicExpr + "}")
  cursor = ly.document.Cursor(doc)
  ly.pitch.translate.translate(cursor, targetLanguage)
  ret = doc.plaintext().replace("{","").replace("}","")

  outFile = open(outFileName, "w")
  outFile.write(ret)
  outFile.close()

except:
  raise Exception(traceback.format_exc())
