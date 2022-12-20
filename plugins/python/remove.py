#!/usr/bin/env python3
#
# Created (28/10/2020) by Paolo-Prete.
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

# The following script is based on quickremove.py from Frescobaldi together with python-ly
# https://pypi.org/project/python-ly/
# https://github.com/frescobaldi/frescobaldi/blob/master/frescobaldi_app/quickremove.py

import functools
import os
import sys
import subprocess
from sys import argv
import traceback
import ly.document
import ly.words
import ly.lex.lilypond

def tknIsOfType(tkn, tknType):

  if tknType == "ARTICULATIONS":
    return (isinstance(tkn, ly.lex.lilypond.Articulation) and tkn[1:] in ly.words.articulations) \
            or isinstance(tkn, ly.lex.lilypond.ScriptAbbreviation)
  elif tknType == "BEAMS":
    return isinstance(tkn, ly.lex.lilypond.Beam)
  elif tknType == "DYNAMICS":
    return isinstance(tkn, ly.lex.lilypond.Dynamic)
  elif tknType == "LIGATURES":
    return isinstance(tkn, ly.lex.lilypond.Ligature)
  elif tknType == "ORNAMENTS":
    return (isinstance(tkn, ly.lex.lilypond.Articulation) \
            and tkn[1:] in ly.words.ornaments)
  elif tknType == "SLURS":
    return isinstance(tkn, ly.lex.lilypond.Slur)
  else:
    return False

def findTokens(cursor, tknType):

  if tknType == 'TEXT_MARKUPS':
    src = ly.document.Source(cursor, True, tokens_with_position=True)
    for currTkn in src:
      if isinstance(currTkn, ly.lex.lilypond.Direction):
        start = currTkn.pos
        for currTkn in src:
          if currTkn == '\\markup':
            depth = src.state.depth()
            for currTkn in src:
              if src.state.depth() < depth:
                yield start, currTkn.end
                break
          elif currTkn == '"':
            for currTkn in src:
              if isinstance(currTkn, ly.lex.StringEnd):
                yield start, currTkn.end
                break
          elif currTkn.isalpha():
            yield start, currTkn.end
          elif isinstance(currTkn, ly.lex.Space):
            continue
          break
  else:
    src = ly.document.Source(cursor, None, ly.document.PARTIAL, True)
    for currTkn in src:
      if isinstance(currTkn, ly.lex.lilypond.Direction):
        start = currTkn.pos
        for currTkn in src.tokens:
          if isinstance(currTkn, ly.lex.Space):
            continue
          elif tknIsOfType(currTkn, tknType):
            yield start, currTkn.end
          break
      elif tknIsOfType(currTkn, tknType):
          yield currTkn.pos, currTkn.end

tknType = argv[1]
inFileName = argv[2]
outFileName = argv[3]

try:
  inFile = open(inFileName, "r")
  spontiniInput = "{ "+inFile.read()+" }"
  inFile.close()

  inFile = open(inFileName, "wb")
  inFile.write(spontiniInput.encode('utf-8'))
  inFile.close()

  doc = ly.document.Document.load(inFileName, None, None)
  cursor = ly.document.Cursor(doc)
  foundTkns = findTokens(cursor, tknType)

  for currTkn in reversed(list(foundTkns)):
    del doc[currTkn[0]:currTkn[1]]

  cursor = ly.document.Cursor(doc)
  src = ly.document.Source(cursor, None, ly.document.PARTIAL, True)

  outStr = doc.plaintext()

  try:
    outStr = outStr[2: (len(outStr) - 2)]
  except:
    pass

  outFile = open(outFileName, "wb")
  outFile.write(outStr.encode('utf-8'))
  outFile.close()

except:
  raise Exception(traceback.format_exc())
