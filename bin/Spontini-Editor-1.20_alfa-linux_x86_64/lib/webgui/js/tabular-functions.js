/*
 * Created (28/10/2020) by Paolo-Prete.
 * This file is part of Spontini-Editor project.
 *
 * Spontini-Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Spontini-Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
 */

function getTableStartLineInfos(cursorLine) {
  var ret = [null, null, '', false, null, null]
  var found = false
  var tabularPolyLines = 0
  var currTableLine = 0
  for (var i = 1; i < 4; i++) {
    if (txtEditor().getLine(cursorLine - i) &&
        txtEditor().getLine(cursorLine - i).includes("\\easyCrossStaff") &&
        !txtEditor().getLine(cursorLine - i).includes("Poly") &&
        txtEditor().getLine(cursorLine - i).includes("%TMODE")) {
      ret[0] = cursorLine - i
      ret[1] = 0
      ret[2] = "easyCrossStaff"
      found = true
      currTableLine = i
      break
    }
  }

  if (!found)
  {
    for (var i = 1; i < 8; i++) {
      if (txtEditor().getLine(cursorLine - i) &&
         (
          txtEditor().getLine(cursorLine - i).includes("\\easyCrossStaff") ||
          txtEditor().getLine(cursorLine - i).includes("\\tabularTwoStaves")
         ) &&
         txtEditor().getLine(cursorLine - i).includes("%TMODE")) {
        ret[0] = cursorLine - i
        ret[1] = 0
        ret[2] = "easyCrossStaff"
        if (txtEditor().getLine(cursorLine - i).includes("\\tabularTwoStaves"))
          ret[2] = "tabularTwoStaves"

        if (txtEditor().getLine(cursorLine - i).includes("PolyI ")) {
          ret[1] = 1
          tabularPolyLines = 2
        }
        else if (txtEditor().getLine(cursorLine - i).includes("PolyII ")) {
          tabularPolyLines = 4
          ret[1] = 2
        }
        else if (txtEditor().getLine(cursorLine - i).includes("PolyIII ")) {
          tabularPolyLines = 6
          ret[1] = 3
        }
        else if (txtEditor().getLine(cursorLine - i).includes("PolyIV ")) {
          tabularPolyLines = 8
          ret[1] = 4
        }
        found = true
        currTableLine = i
        break
      }
    }
  }

  // This tells if the examined line is inside the table
  ret[3] = false

  if (found) {
    if (ret[2] == "easyCrossStaff" && ((currTableLine >= 1) && (currTableLine <= 3))) {
      ret[3] = true
    }
    else if (ret[2] == "tabularTwoStaves" &&
            ((currTableLine >= 1) && (currTableLine <= tabularPolyLines))) {
      ret[3] = true
    }
  }

  ret[4] = currTableLine
  ret[5] = tabularPolyLines
  if (ret[2] == "easyCrossStaff")
    ret[5] = 6

  return ret
}

function getCSTCellNumber(line, ch) {

  var pos = null
  var cstStartLine = getTableStartLineInfos(line)[0]
  if (cstStartLine == null)
    return pos

  var currLine = txtEditor().getLine(line)
  var pos = null
  if (((line - cstStartLine) >= 1) || ((line - cstStartLine) <= 3)) {
    let re = /\\CS/g
    while( x=re.exec(currLine) ) {
      if (pos == null)
        pos = 0
      if (x.index >= ch) {
        //console.log("Cursor at position: "+pos)
        return pos
      }
      pos++
    }
  }

  return pos
}

function getCSTCellStartCh(currLineNum, currentCellNumber) {
  var ret = null
  var str = null
  var currLine = txtEditor().getLine(currLineNum)
  let re = "\\CS"
  var lineArr = currLine.split(re)
  if (currLine && (lineArr.length >= currentCellNumber+1))
    str = lineArr[currentCellNumber]

  chsBefore = 0
  for (var i = 0; i < currentCellNumber; i++)
    chsBefore += lineArr[i].length + re.length

  return chsBefore

}

function getCSTCellContent(currLineNum, currentCellNumber, doTrim = false) {

  var ret = null
  var str = null
  var currLine = txtEditor().getLine(currLineNum)
  let re = "\\CS"
  if (currLine && (currLine.split(re).length >= currentCellNumber+1))
    str = currLine.split(re)[currentCellNumber]

  if (str != null) {
    ret = str
    if (doTrim) //right trim
      ret = str.replace(/\s+$/, '')
  }

  //if (str != null)
  //console.log("cella["+(line - cstStartLine)+"-"+currentCellNumber+"]: "+str.trim()+" lunghezza="+ret)
  //console.log("CELLCONTENT"+(line - cstStartLine)+"-"+currentCellNumber+": "+ret)

  return ret
}

function getCSTCellLength(cstStartLine, line, currentCellNumber, doTrim = false) {

  var ret = null
  var content = getCSTCellContent(cstStartLine + line, currentCellNumber, doTrim)

  if (content != null) {
    ret = content.length
    if (doTrim)
      ret = content.length + 1
  }

  return ret
}

function removeOrAddEndWhiteCharOfCell(cstStartLine, lineOffs, currentCellNumber, operation) {

  var currLine = txtEditor().getLine((cstStartLine + lineOffs))
  let re = /\\CS/g
  var pos = 0
  var sepIdx = null
  while( x=re.exec(currLine) ) {
    if (currentCellNumber == pos) {
      sepIdx = x.index
      break
    }
    pos++
  }

  oldCursor = txtEditor().getCursor()

  if (sepIdx != null) {
    //Add white space
    if (operation == " ")
      insertTextAtPosition(operation, {line: (cstStartLine + lineOffs), ch: sepIdx})
    //remove white space
    else
      insertTextAtPosition(operation, {line: (cstStartLine + lineOffs), ch: sepIdx-1}, {line: (cstStartLine + lineOffs), ch: sepIdx})
  }

  txtEditor().setCursor(oldCursor)
}

function  formatCurrPianoTableColumn() {

  if (disableTableFormat)
    return

  var cstStartLineInfo = getTableStartLineInfos(txtEditor().getCursor().line)
  if (cstStartLineInfo[3]) {

    cursorInsidePianoTable = true
    var currentCellNumber = getCSTCellNumber(txtEditor().getCursor().line,
                                             txtEditor().getCursor().ch)
    if (currentCellNumber != null) {
      var lengthOfContentOfCellToFormatOnCSTLine = []
      var numOfRows = 3 + Number(cstStartLineInfo[1])*2
      if (cstStartLineInfo[2] == "tabularTwoStaves")
        numOfRows -= 3

      for (var i = 0; i < numOfRows; i++) {
        lengthOfContentOfCellToFormatOnCSTLine[i] = getCSTCellLength(cstStartLineInfo[0],
                                                                            (i +1),
                                                                            currentCellNumber,
                                                                            true)
      }

      for (var i = 0; i < numOfRows; i++) {

      if (lengthOfContentOfCellToFormatOnCSTLine[i] == null)
        return
      }

      var maxContentLength = Math.max(...lengthOfContentOfCellToFormatOnCSTLine)

      for (var i = 0; i < numOfRows; i++) {
        lengthOfContentOfCellToFormatOnCSTLine[i] = getCSTCellLength(cstStartLineInfo[0], (i +1), currentCellNumber)

        while (lengthOfContentOfCellToFormatOnCSTLine[i] != maxContentLength) {
          if (lengthOfContentOfCellToFormatOnCSTLine[i] < maxContentLength) {
            removeOrAddEndWhiteCharOfCell(cstStartLineInfo[0], (i + 1), currentCellNumber, " ")
            lengthOfContentOfCellToFormatOnCSTLine[i] += 1
          }
          else {
            removeOrAddEndWhiteCharOfCell(cstStartLineInfo[0], (i + 1), currentCellNumber, "")
            lengthOfContentOfCellToFormatOnCSTLine[i] -= 1
          }
        }

      }
    }
  }

  cursorInsidePianoTable = false
}

function formatCurrPianoTable() {

  if (txtEditor().getCursor() == null)
    return

  lineNum = txtEditor().getCursor().line
  var cstStartLineInfo = getTableStartLineInfos(lineNum)
  // cstStartLineInfo[3] == true means that cursor is inside piano table
  if (cstStartLineInfo[3]) {
    var selectionCursor = txtEditor().getSearchCursor("\\CS", CodeMirror.Pos(lineNum-1, 0),
                                                      {caseFold: true, multiline: true})
    while (tkn = selectionCursor.findNext()) {
      var tknCol = selectionCursor.from().ch
      var tknLine = selectionCursor.from().line
      if (tknLine > lineNum)
        break
      txtEditor().setCursor({line: lineNum, ch: (tknCol + 1)})
      formatCurrPianoTableColumn()
    }

    selectionCursor = txtEditor().getSearchCursor("\\CS", CodeMirror.Pos(lineNum-1, 0),
                                                  {caseFold: true, multiline: true})

    markCSTSeparators(cstStartLineInfo[0], 0, cstStartLineInfo[0]+cstStartLineInfo[5]+1, 0)

    txtEditor().setCursor({line: lineNum, ch: 0})
  }

}

function insertColumnInTable(textUp, textDown) {

  var currLine = txtEditor().getCursor().line
  var currentCellNumber = getCSTCellNumber(currLine, txtEditor().getCursor().ch)

  var tableInfos = getTableStartLineInfos(currLine)
  tableStartLine = currLine - tableInfos[4]
  var cellStartCh = getCSTCellStartCh(currLine, currentCellNumber)
  var cellContent = getCSTCellContent(currLine, currentCellNumber)

  var textUpSpaces = ""
  var textDownSpaces = ""
  var thirdRowSpaces = ""
  if (textUp.length > textDown.length)
    for (var i = 0; i < (textUp.length - textDown.length); i ++)
      textDownSpaces += " "
  else
    for (var i = 0; i < (textDown.length - textUp.length); i ++)
      textUpSpaces += " "

  var maxLen = Math.max(textUp.length, textDown.length)
  for (var i = 0; i < maxLen - 1; i++)
    thirdRowSpaces += " "

  disableTableFormat = true
  var tmpArr = [textUp + textUpSpaces, textDown + textDownSpaces, "-" + thirdRowSpaces]
  for (var i = 0; i < 3; i++) {
    txtEditor().setCursor({line: tableStartLine + 1 + i, ch: cellStartCh + 1  })
    var cursor = txtEditor().getCursor()
    txtEditor().replaceRange(tmpArr[i]+" \\CS ", cursor)
  }

  //formatCurrPianoTableColumn()
  disableTableFormat = false

}

