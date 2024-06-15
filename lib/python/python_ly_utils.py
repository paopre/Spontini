#!/usr/bin/env python3
#
# Created (10/01/2022) by Paolo-Prete.
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

import ly.document
import ly.pitch
import ly.pitch.translate
import ly.words
import ly.lex.lilypond
import ly.pitch.transpose
import ly.indent
import ly.reformat
import re

def removeUnwantedSpacesInChord(text):

  if not text:
    return text

  doc = ly.document.Document("{"+text+"}")
  curs = ly.document.Cursor(doc)
  src = ly.document.Source(curs, True, tokens_with_position=True)
  posSet = set()
  for currTkn in src:
    if isinstance(currTkn, ly.lex.lilypond.ChordStart):
      chordPos = src.position(currTkn)-1
      if text[chordPos+1] == ' ':
        posSet.add(chordPos+1)
    if isinstance(currTkn, ly.lex.lilypond.ChordEnd):
      chordPos = src.position(currTkn)-1
      if text[chordPos-1] == ' ':
        posSet.add(chordPos-1)

  ret = ''.join(c for idx, c in enumerate(text) if idx not in posSet)
  return ret

def removeChordOnSingleNote(text, lang):
  ret = text

  if not ret:
    return ret

  doc = ly.document.Document("{"+text+"}")
  curs = ly.document.Cursor(doc)
  src = ly.document.Source(curs, True, tokens_with_position=True)
  iterat = ly.pitch.PitchIterator(src, language=lang)
  posSet = set()
  numNotes = 0
  for currTkn in iterat.pitches():
    if isinstance(currTkn, ly.pitch.Pitch):
      numNotes = numNotes + 1
    if isinstance(currTkn, ly.lex.lilypond.ChordStart):
      chordPos = src.position(currTkn)-1
      posSet.add(chordPos)
    if isinstance(currTkn, ly.lex.lilypond.ChordEnd):
      chordPos = src.position(currTkn)-1
      posSet.add(chordPos)

  if numNotes == 1:
    ret = ''.join(c for idx, c in enumerate(text) if idx not in posSet)

  return ret

def formatOrIndentOnlyScore(scoreToFormat, editorCurs, justIndent=False):

  def updateEditorCurs(i, editorCurs, editorCursOffs):
    editorCursInside = ""
    if i == editorCurs[0]:
      editorCursInside = [editorCursOffs, editorCurs[1]]
    editorCursOffs += 1
    return editorCursInside, editorCursOffs

  errorLine = -1
  if scoreToFormat.strip().startswith("% set autoformat off"):
    return [scoreToFormat, editorCurs, errorLine]

  lines = scoreToFormat.split('\n')

  blocks = []
  modScoreLines = []
  editorCursOffs = 0
  obscureKey = "% __oOo__DONOTTOUCH__oOo__ %"
  i = 0
  modBlocks = 0

  editorCursInside = ""

  while i < len(lines):
    line = lines[i]
    if re.match(r'^\s*\\easyCrossStaff', line) or\
       re.match(r'^\s*\% set autoformat off', line) or\
       re.match(r'^\s*\% set autoindent off', line):
      endReg = r'^\s*#\'\('
      if re.match(r'^\s*\% set autoformat off', line):
        endReg = r'^\s*\% set autoformat on'
      if re.match(r'^\s*\% set autoindent off', line):
        endReg = r'^\s*\% set autoindent on'
      iTemp = i
      endRegFound = False
      while i < len(lines):
        if re.match(endReg, lines[i]):
          endRegFound = True
        i += 1
      if not endRegFound:
        return [scoreToFormat, editorCurs, iTemp + 1]

      i = iTemp
      blockStart = i
      if i == editorCurs[0]:
        editorCursInside = [editorCursOffs, editorCurs[1]]
      editorCursOffs += 1
      # Trovare il blocco che termina con la riga che inizia con "#'("
      while i < len(lines) and not re.match(endReg, lines[i]):
        editorCursInside, editorCursOffs = updateEditorCurs(i, editorCurs, editorCursOffs)
        i += 1
      if i < len(lines):
        blockEnd = i
        editorCursInside, editorCursOffs = updateEditorCurs(i, editorCurs, editorCursOffs)
        blocks.append((blockStart, blockEnd, lines[blockStart:blockEnd + 1], obscureKey, editorCursInside))
        if editorCursInside:
          editorCursInside = ""
        modScoreLines.append([obscureKey, False])
        modBlocks += 1
    elif re.match(r'^\s*\\tabularTwoStavesPoly', line):
      blockStart = i
      editorCursInside, editorCursOffs = updateEditorCurs(i, editorCurs, editorCursOffs)
      i += 1
      while i < len(lines) and re.match(r'^\s*\{', lines[i]):
        editorCursInside, editorCursOffs = updateEditorCurs(i, editorCurs, editorCursOffs)
        i += 1
      i -= 1
      if i < len(lines):
        blockEnd = i
        blocks.append((blockStart, blockEnd, lines[blockStart:blockEnd + 1], obscureKey, editorCursInside))
        if editorCursInside:
          editorCursInside = ""
        modScoreLines.append([obscureKey, False])
        modBlocks += 1
    else:
        modScoreLines.append([line, False])
    i += 1

  modScore = '\n'.join([item[0] for item in modScoreLines])

  doc = ly.document.Document(modScore)
  curs = ly.document.Cursor(doc)
  indenter = ly.indent.Indenter()
  if justIndent:
    indenter.indent(curs)
  else:
    ly.reformat.reformat(curs, indenter)

  restoredLines = doc.plaintext().split('\n')

  blockCtr = 0
  for i in range(0, len(restoredLines)):
    if restoredLines[i].strip().startswith(obscureKey):

      if blocks[blockCtr][4][0:]:
        editorCurs = [blocks[blockCtr][4][0:][0] + i, editorCurs[1]]

      restoredLines[i] = '\n'.join(blocks[blockCtr][2][0:])
      blockCtr += 1

  formattedScore = '\n'.join(restoredLines)

  # guard
  if formattedScore.strip() == "" or obscureKey in formattedScore:
    formattedScore = scoreToFormat

  return [formattedScore, editorCurs, errorLine]

def orderPitchesInChord(text, lang):

  ret = text

  if not ret:
    return ret

  doc = ly.document.Document("{"+text+"}")
  curs = ly.document.Cursor(doc)
  src = ly.document.Source(curs, True, tokens_with_position=True)
  iterat = ly.pitch.PitchIterator(src, language=lang)
  pitchesList = []
  numNotes = 0
  chordStartPos = -1
  chordEndPos = -1
  for currTkn in iterat.pitches():
    if isinstance(currTkn, ly.pitch.Pitch):
      numNotes = numNotes + 1
      pitchVal = (currTkn.note + currTkn.alter + 7*currTkn.octave + 1)
      pitchesList.append({"pitch": currTkn, "value" : pitchVal})
    if isinstance(currTkn, ly.lex.lilypond.ChordStart):
      chordStartPos = src.position(currTkn) - 1
    if isinstance(currTkn, ly.lex.lilypond.ChordEnd):
      chordEndPos = src.position(currTkn) - 1

  #thanks to bjs@#python on libera, for this
  pitchesList = sorted(pitchesList, key=lambda d: d["value"])
  pitchesOrdered = ""
  if numNotes > 1 and chordStartPos != -1 and chordEndPos != -1:
    for item in pitchesList:
      pitchesOrdered += translatePitches(item["pitch"].output(), lang) + " "
    ret = text[:chordStartPos+1] + pitchesOrdered[:len(pitchesOrdered) -1] + text[chordEndPos:]

  return ret

def translatePitches(pitches, lang):
  doc = ly.document.Document("{"+pitches+"}")
  cursor = ly.document.Cursor(doc)
  ly.pitch.translate.translate(cursor, lang)
  ret = doc.plaintext().replace("{","").replace("}","")
  return ret

def mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, debug = False):

  ret = {'textFrom': '', 'textTo': '', 'error': ''}

  docFrom = ly.document.Document("{"+textFrom+"}")
  cursorFrom = ly.document.Cursor(docFrom)
  srcFrom = ly.document.Source(cursorFrom, True, tokens_with_position=True)
  iteratFrom = ly.pitch.PitchIterator(srcFrom, language=lang)

  fragSubstrEnd = -1
  fragSubstrStart = -1
  for currTkn in iteratFrom.pitches():
    if isinstance(currTkn, ly.pitch.Pitch):
      #print("pitch at: "+str(iteratFrom.position(currTkn)))
      translatedTkn = translatePitches(currTkn.output(), lang)
      if iteratFrom.position(currTkn) <= fragmentOffsetEnd + 1:
        fragSubstrEnd = iteratFrom.position(currTkn) + len(translatedTkn) - 2 #it includes {
        #print("end: "+str(fragSubstrEnd))
      if fragSubstrStart == -1 and (iteratFrom.position(currTkn) + len(translatedTkn) - 1) >= (fragmentOffsetStart + 1):
        fragSubstrStart = iteratFrom.position(currTkn) - 1
        #print("start: "+str(fragSubstrStart))

  textFromFragment = textFrom[fragSubstrStart:fragSubstrEnd + 1]
  docFragment = ly.document.Document("{"+textFromFragment+"}")
  cursorFragment = ly.document.Cursor(docFragment)
  srcFragment = ly.document.Source(cursorFragment, True, tokens_with_position=True)
  iteratFragment = ly.pitch.PitchIterator(srcFragment, language=lang)

  docTo = ly.document.Document("{"+textTo+"}")
  cursorTo = ly.document.Cursor(docTo)
  srcTo = ly.document.Source(cursorTo, True, tokens_with_position=True)
  iteratTo = ly.pitch.PitchIterator(srcTo, language=lang)

  textFromAttrs = { 'isA': None, 'notesNum': 0, 'replaceStartPos': -1, 'replaceEndPos': -1, 'startChordPos': -1, 'endChordPos': -1}
  textToAttrs = { 'isA': None, 'replaceStartPos': -1, 'replaceEndPos': -1, 'startChordPos': -1, 'endChordPos': -1}
  fragmentAttrs = { 'isA': None, 'copyStartPos': -1, 'copyEndPos': -1}

  notesNum = 0
  srcFrom = ly.document.Source(cursorFrom, True, tokens_with_position=True)
  iteratFrom = ly.pitch.PitchIterator(srcFrom, language=lang)
  for currTkn in iteratFrom.pitches():
    if isinstance(currTkn, ly.pitch.Pitch):
      textFromAttrs['isA'] = "NOTES"
      notesNum = notesNum + 1
      textFromAttrs['notesNum'] = notesNum
    elif isinstance(currTkn, ly.lex.lilypond.ChordStart):
      textFromAttrs['startChordPos'] = iteratFrom.position(currTkn)
    elif isinstance(currTkn, ly.lex.lilypond.ChordEnd):
      textFromAttrs['endChordPos'] = iteratFrom.position(currTkn) - 1
    elif isinstance(currTkn, ly.lex.lilypond.Spacer):
      ret['error'] = "Can't do anything because textFrom is a SPACER"
      return ret
    elif isinstance(currTkn, ly.lex.lilypond.Rest):
      ret['error'] = "Can't do anything because textFrom is a REST"
      return ret

  notesNum = 0
  for currTkn in iteratFragment.pitches():
    if isinstance(currTkn, ly.pitch.Pitch):
      fragmentAttrs['isA'] = "NOTES"
      notesNum = notesNum + 1
      fragmentAttrs['notesNum'] = notesNum
    elif isinstance(currTkn, ly.lex.lilypond.Spacer):
      ret['error'] = "Can't do anything because textFrom fragment is a SPACER"
      return ret
    elif isinstance(currTkn, ly.lex.lilypond.Rest):
      ret['error'] = "Can't do anything because textFrom fragment is a REST"
      return ret

  notesNum = 0
  for currTkn in iteratTo.pitches():
    #print(type(currTkn))
    if isinstance(currTkn, ly.pitch.Pitch):
      textToAttrs['isA'] = "NOTES"
      notesNum = notesNum + 1
      textToAttrs['notesNum'] = notesNum
    elif isinstance(currTkn, ly.lex.lilypond.ChordStart):
      textToAttrs['startChordPos'] = iteratTo.position(currTkn)
    elif isinstance(currTkn, ly.lex.lilypond.ChordEnd):
      textToAttrs['endChordPos'] = iteratTo.position(currTkn) - 1
    elif isinstance(currTkn, ly.lex.lilypond.Spacer):
      textToAttrs['isA'] = "SPACER"
    elif isinstance(currTkn, ly.lex.lilypond.Rest):
      textToAttrs['isA'] = "REST"

  if textFromAttrs['isA'] == None:
    ret['error'] = "Can't do anything because textFrom doesn't contain notes"
    return ret

  if fragmentAttrs['isA'] == None:
    ret['error'] = "Can't do anything because textFrom fragment doesn't contain notes"
    return ret

  if textToAttrs['isA'] == None:
    ret['error'] = "Can't do anything because textTo doesn't contain notes/spacers/rests"
    return ret

  srcTo = ly.document.Source(cursorTo, True, tokens_with_position=True)
  iteratTo = ly.pitch.PitchIterator(srcTo, language=lang)
  if textToAttrs['isA'] == "SPACER" or textToAttrs['isA'] == "REST":
    for currTkn in iteratTo.pitches():
      if textToAttrs['replaceStartPos'] == -1 and \
        (isinstance(currTkn, ly.lex.lilypond.Spacer) or isinstance(currTkn, ly.lex.lilypond.Rest)):
        textToAttrs['replaceStartPos'] = iteratTo.position(currTkn) - 1
        textToAttrs['replaceEndPos'] = iteratTo.position(currTkn) + len(currTkn) - 2

  srcTo = ly.document.Source(cursorTo, True, tokens_with_position=True)
  iteratTo = ly.pitch.PitchIterator(srcTo, language=lang)
  if textToAttrs['isA'] == "NOTES" and textToAttrs['notesNum'] == 1:
    for currTkn in iteratTo.pitches():
      if textToAttrs['replaceStartPos'] == -1 and \
        isinstance(currTkn, ly.pitch.Pitch):
        textToAttrs['replaceStartPos'] = iteratTo.position(currTkn) - 1
      if isinstance(currTkn, ly.pitch.Pitch):
        translatedTkn = translatePitches(currTkn.output(), lang)
        textToAttrs['replaceEndPos'] = iteratTo.position(currTkn) + len(translatedTkn) - 2

  srcTo = ly.document.Source(cursorTo, True, tokens_with_position=True)
  iteratTo = ly.pitch.PitchIterator(srcTo, language=lang)
  if textToAttrs['isA'] == "NOTES" and textToAttrs['notesNum'] > 1:
    for currTkn in iteratTo.pitches():
      if isinstance(currTkn, ly.lex.lilypond.ChordStart):
        textToAttrs['replaceStartPos'] = iteratTo.position(currTkn) - 1
      if isinstance(currTkn, ly.lex.lilypond.ChordEnd):
        textToAttrs['replaceEndPos'] = iteratTo.position(currTkn) - 1

  srcFragment = ly.document.Source(cursorFragment, True, tokens_with_position=True)
  iteratFragment = ly.pitch.PitchIterator(srcFragment, language=lang)
  for currTkn in iteratFragment.pitches():
    if fragmentAttrs['copyStartPos'] == -1 and \
       isinstance(currTkn, ly.pitch.Pitch):
      fragmentAttrs['copyStartPos'] = iteratFragment.position(currTkn) - 1
    if isinstance(currTkn, ly.pitch.Pitch):
      translatedTkn = translatePitches(currTkn.output(), lang)
      fragmentAttrs['copyEndPos'] = iteratFragment.position(currTkn) + len(translatedTkn) - 2

  if (fragmentAttrs['copyStartPos'] == -1) or (fragmentAttrs['copyEndPos'] == -1):
    ret['error'] = "Bug: copyStartPos or copyEndPos not found. Please report this"
    return ret

  textFromAttrs['replaceStartPos'] = fragmentAttrs['copyStartPos'] + fragSubstrStart
  textFromAttrs['replaceEndPos'] = fragmentAttrs['copyEndPos'] + fragSubstrStart

  #If from is note, replace it with spacer
  if textFromAttrs['isA'] == "NOTES" and textFromAttrs['notesNum'] == 1:
    ret['textFrom'] = textFrom[:textFromAttrs['replaceStartPos']] + "s" + textFrom[textFromAttrs['replaceEndPos']+1:]
  #In case of chord, cut the fragment notes if their number is lower than the chord's notes
  elif textFromAttrs['isA'] == "NOTES" and textFromAttrs['notesNum'] > 1 and textFromAttrs['notesNum'] > fragmentAttrs['notesNum']:
    ret['textFrom'] = textFrom[:textFromAttrs['replaceStartPos']] + textFrom[textFromAttrs['replaceEndPos']+1:]
  #If the number of notes of the fragment is the same of the notes in from, replace the notes with a spacer
  elif textFromAttrs['isA'] == "NOTES" and textFromAttrs['notesNum'] > 1 and textFromAttrs['notesNum'] == fragmentAttrs['notesNum']:
    ret['textFrom'] = textFrom[:textFromAttrs['startChordPos']-1] + "s" + textFrom[textFromAttrs['endChordPos']+1:]

  if fragmentAttrs['isA'] == "NOTES" and textToAttrs['isA'] == "NOTES":
    if textToAttrs['notesNum'] == 1: #note
      ret['textTo'] = textTo[:textToAttrs['replaceStartPos']] + "< "+ \
                      textTo[textToAttrs['replaceStartPos']:textToAttrs['replaceEndPos']+1] + " " + \
                      textFromFragment + " >" + textTo[textToAttrs['replaceEndPos']+1:]
    else: #chord
      ret['textTo'] = textTo[:textToAttrs['replaceEndPos']] + " " + textFromFragment + " >" + textTo[textToAttrs['replaceEndPos']+1:]

  if fragmentAttrs['isA'] == "NOTES" and ((textToAttrs['isA'] == "SPACER") or (textToAttrs['isA'] == "REST")):
    if fragmentAttrs['notesNum'] == 1: #note
      ret['textTo'] = textTo[:textToAttrs['replaceStartPos']] + textFromFragment + textTo[textToAttrs['replaceEndPos']+1:]
    else: #chord
      ret['textTo'] = textTo[:textToAttrs['replaceStartPos']] + "< "+textFromFragment + " >"+ textTo[textToAttrs['replaceEndPos']+1:]

  ret['textFrom'] = removeUnwantedSpacesInChord(ret['textFrom'])
  ret['textTo'] = removeUnwantedSpacesInChord(ret['textTo'])
  ret['textFrom'] = removeChordOnSingleNote(ret['textFrom'], lang)
  ret['textTo'] = removeChordOnSingleNote(ret['textTo'], lang)
  ret['textFrom'] = orderPitchesInChord(ret['textFrom'], lang)
  ret['textTo'] = orderPitchesInChord(ret['textTo'], lang)

  if debug:
    print("[A]  "+textFrom+"   ===>   "+textFromFragment)
    print("[B]  "+textTo)
    print("->   ")
    print("[A]  "+ret['textFrom'])
    print("[B]  "+ret['textTo'])

  return ret

def convertPitchesToEnharmonic(text, startOffs, endOffs, lang, debug = False):
  if debug:
    print("A) "+text)
  text = "{"+text+"}"
  startOffs = startOffs + 1
  endOffs = endOffs + 1
  doc = ly.document.Document(text)
  curs = ly.document.Cursor(doc)
  src = ly.document.Source(curs, True, tokens_with_position=True)
  iterat = ly.pitch.PitchIterator(src, language=lang)
  indices = [0]
  enhamonicPitches = []
  pSharp = ly.pitch.Pitch(0, 0.5, 0)
  pFlat = ly.pitch.Pitch(1, -0.5, 0)
  transposerSharpToFlat = ly.pitch.transpose.Transposer(pSharp, pFlat)
  transposerFlatToSharp = ly.pitch.transpose.Transposer(pFlat, pSharp)
  for currTkn in iterat.pitches():
    if isinstance(currTkn, ly.pitch.Pitch):
      translatedTkn = translatePitches(currTkn.output(), lang)
      if currTkn.alter != 0 and (iterat.position(currTkn) + len(translatedTkn) -1) >= startOffs and iterat.position(currTkn) <= endOffs:
        currTknCpy = currTkn.copy()
        indices.append(iterat.position(currTkn))
        indices.append(iterat.position(currTkn) + len(translatedTkn))

        if currTkn.alter == 0.5: #sharp
          transposerSharpToFlat.transpose(currTknCpy)
        if currTkn.alter == -0.5: #flat
          transposerFlatToSharp.transpose(currTknCpy)

        enhamonicPitches.append(currTknCpy)

  parts = [text[i:j] for i,j in zip(indices, indices[1:]+[None])]

  q = 1
  for p in enhamonicPitches:
    #print(p.output())
    translatedP = translatePitches(p.output(), lang)
    parts[q] = translatedP
    q = q + 2

  ret = ''.join(parts)
  ret = ret[1:len(ret)-1]
  if debug:
    print("B) "+ret)

  return ret

def makeTitle(title):
  bigLine = "___________________________________"
  print("\n\n"+bigLine)
  print(title)
  print(bigLine)

def test():

  lang = "nederlands"
  makeTitle("1) NOTE --> NOTE --> NOTE")
  textFrom = "\\CS a''"
  fragmentOffsetStart = 4
  fragmentOffsetEnd = 6
  textTo = "\\tuplet 3/2 { e'\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("2) NOTE --> NOTE --> NOTES")
  textFrom = "\\CS a'"
  fragmentOffsetStart = 4
  fragmentOffsetEnd = 5
  textTo = "\\tuplet 3/2 { <e' f''>\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("3) NOTE --> NOTE --> SPACER/REST")
  textFrom = "\\CS a''"
  fragmentOffsetStart = 4
  fragmentOffsetEnd = 6
  textTo = "\\tuplet 3/2 { s\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("4) NOTES --> NOTE --> NOTE")
  textFrom = "\\CS <a' b''>"
  fragmentOffsetStart = 5
  fragmentOffsetEnd = 6
  textTo = "\\tuplet 3/2 { e'\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("5) NOTES --> NOTE --> NOTES")
  textFrom = "\\CS <a'' b'>"
  fragmentOffsetStart = 5
  fragmentOffsetEnd = 7
  textTo = "\\tuplet 3/2 { <e' f, g,>\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("6) NOTES --> NOTE --> SPACER/REST")
  textFrom = "\\CS <a'' b'>"
  fragmentOffsetStart = 9
  fragmentOffsetEnd = 10
  textTo = "\\tuplet 3/2 s\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("7) NOTES --> NOTES --> NOTE (a)")
  textFrom = "\\CS <b' a' c''>"
  fragmentOffsetStart = 5
  fragmentOffsetEnd = 9
  textTo = "\\tuplet 3/2 { e''\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("8) NOTES --> NOTES --> NOTE (b)")
  textFrom = "\\CS <a' b''>"
  fragmentOffsetStart = 5
  fragmentOffsetEnd = 10
  textTo = "\\tuplet 3/2 { e''\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("9) NOTES --> NOTES --> NOTES")
  textFrom = "\\CS <a'' b' c'>"
  fragmentOffsetStart = 5
  fragmentOffsetEnd = 12
  textTo = "\\tuplet 3/2 { <e' f, g,>\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("10) NOTES --> NOTES --> SPACER/REST")
  textFrom = "\\CS <a' c''>"
  fragmentOffsetStart = 5
  fragmentOffsetEnd = 10
  textTo = "\\tuplet 3/2 { s\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

  makeTitle("11) NOTE --> NOTE --> SPACER/REST")
  textFrom = "\\growingBeamVolatina 3 { <re' mi' fad'>8\sustainOn\ppp_\subito 0.5\<"
  fragmentOffsetStart = 30
  fragmentOffsetEnd = 32
  textTo = "\\growingBeamVolatina 3 { mi''8[                                     "
  ret = mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, "italiano", True)

  makeTitle("12) NOTES --> NOTES --> SPACER/REST")
  textFrom = "\\CS <do' re''>\p"
  fragmentOffsetStart = 5
  fragmentOffsetEnd = 10
  textTo = "\\tuplet 3/2 { s\mf"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, "italiano", True)

  makeTitle("13) NOTES --> NOTES --> NOTES")
  textFrom = "<d dis' a''>"
  fragmentOffsetStart = 6
  fragmentOffsetEnd = 9
  textTo = "<f g>"
  mergeTableCells(textFrom, fragmentOffsetStart, fragmentOffsetEnd, textTo, lang, True)

#test()
#convertPitchesToEnharmonic("do' reb' fad'\\f sol\\p \\CS sold''", 9, 9, "italiano", True)
#convertPitchesToEnharmonic(" do reb mi si do'", 6, 6, "italiano", True)
