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

//////////////////////////////////////////////////////////////////////////
// This is a wrap for texteditor-functions API, implemented for CodeMirror
//////////////////////////////////////////////////////////////////////////

var cursorDefaultBorderLeft = null
var cursorDefaultBlinkRate = null
var cursorCurrBlinkRate = null
var pointAndClickMark = null
var blockSelection = false
var overWriteToggled = false
var prevCursorLine = null
var prevCursorCh = null
var prevCSTCellNumber = null

function setLyFileContentIMPL(txt, force = false) {
  if(txtEditor().getOption("readOnly") && !force)
    return

  txtEditor().setValue(txt)
}

function insertTextAtCursorIMPL(text, force = false) {
  if(txtEditor().getOption("readOnly") && !force)
    return

  var cursor = txtEditor().getCursor()
  txtEditor().replaceRange(text, cursor)
}

function replaceCurrentSelectionIMPL(text, option = "") {

  if(txtEditor().getOption("readOnly"))
    return

  if (blockSelection) {
    txtEditor().replaceSelections(text.split("\n"))
    txtEditor().focus()
    formatCurrPianoTable()
  }
  else if (option == "")
    txtEditor().replaceSelection(text)
  else
    txtEditor().replaceSelection(text, option)
}

function insertTextAtPositionIMPL(text, position1, position2 = null, force = false) {
  if(txtEditor().getOption("readOnly") && !force)
    return
  if (position2 == null)
    txtEditor().replaceRange(text, position1)
  else
    txtEditor().replaceRange(text, position1, position2)
}

function addKeyMapToTxtEditorIMPL(editor, item) {
  //codemirror impl
  editor.addKeyMap(item)
}

function replaceWithVarFuncIMPL() {

    var cursor = txtEditor().getCursor()
    var currLineNum = txtEditor().getCursor().line
    var selText = txtEditor().getSelection()

    if (selText.trim() == '')
      return

    if (selText.includes("\\jsTweak") || selText.includes("\\jsOnceOverride") ||
        selText.includes("\\jsOnceOffset") || selText.includes("\\jsShape")) {
        var jsVar = getNextJSVar()
        while ( currLineNum >= 0) {
          var lineContent = txtEditor().getLine(currLineNum)
          if (lineContent.includes("START " + jsBlockMarker)) {
            var defineVar = "\n\""+jsVar+"\" = #(define-music-function (parser location mus) (ly:music?)"
            defineVar = defineVar + " #{\n"+selText+" $mus \n#})\n"
            replaceCurrentSelection("\\\""+jsVar+"\"")
            insertTextAtPosition(defineVar, {line: (currLineNum+2), ch: 0})
            formatCurrPianoTableColumn()
            break
          }
          currLineNum--
        }
    }
    else {
      var genericVar = getNextGenericVar()
      while ( currLineNum >= 0) {
        var lineContent = txtEditor().getLine(currLineNum)
        if (lineContent.includes("START " + genericVarsBlockMarker)) {
          var defineVar = "\n#(define "+genericVar+" #{\n"+selText+"\n#})\n"
          replaceCurrentSelection("$"+genericVar)
          insertTextAtPosition(defineVar, {line: (currLineNum+2), ch: 0})
          formatCurrPianoTableColumn()
          break
        }
        currLineNum--
      }
    }

}

function completeTableFuncIMPL(editor) {

  var cursor = editor.getCursor()

  var lineBeforeCursor = editor.getLine(cursor.line - 1)

  if (!lineBeforeCursor)
    return

  if (lineBeforeCursor.includes("\\easyCrossStaff") || lineBeforeCursor.includes("\\tabularTwoStaves")) {
    var polyNum = 0

    if (lineBeforeCursor.includes("PolyI "))
      polyNum = 1
    else if (lineBeforeCursor.includes("PolyII "))
      polyNum = 2
    else if (lineBeforeCursor.includes("PolyIII "))
      polyNum = 3
    else if (lineBeforeCursor.includes("PolyIV "))
      polyNum = 4

    if (polyNum == 0 && lineBeforeCursor.includes("\\easyCrossStaff")) {
      if (editor.getLine(cursor.line).trim() != "") {
        insertTextAtCursor("s \\CS ")
        insertTextAtPosition("s \\CS ", { line: (cursor.line + 1), ch: cursor.ch })
        insertTextAtPosition('- \\CS ', { line: (cursor.line + 2), ch: cursor.ch })
      }
      else {
        var str = ""
        str += "  { \\CS s \\CS }\n"
        str += "  { \\CS s \\CS }\n"
        str += "#'( \\CS - \\CS )\n"
        if (lineBeforeCursor.includes("\\easyCrossStaffB")) {
          str += "  %% ADDITIONAL VOICES UP %%\n"
          str += "  {}{}{}{}\n"
          str += "  %% ADDITIONAL VOICES DOWN %%\n"
          str += "  {}{}{}{}\n"
        }
        insertTextAtCursor(str)
      }
    }
    else if (editor.getLine(cursor.line).trim() != "") {
      var q = 1
      var additionalChars = ""
      if (lineBeforeCursor.includes("\\easyCrossStaff"))
        additionalChars = "  "

      insertTextAtCursor(additionalChars + "\\CS ")
      for (var i = 0; i < polyNum - 1; i++) {
        insertTextAtPosition(additionalChars + "\\CS ", { line: (cursor.line + (i + 1)), ch: cursor.ch })
        q++
      }

      if (lineBeforeCursor.includes("\\easyCrossStaff")) {
        insertTextAtPosition("s \\CS ", { line: (cursor.line + q), ch: cursor.ch })
        q++
        insertTextAtPosition("s \\CS ", { line: (cursor.line + q), ch: cursor.ch })
        q++
      }
      var qCp = q
      for (var i = qCp; i < polyNum + qCp; i++) {
        insertTextAtPosition(additionalChars + "\\CS ", { line: (cursor.line + (i)), ch: cursor.ch })
        q++
      }
      if (lineBeforeCursor.includes("\\easyCrossStaff")) {
        insertTextAtPosition('- \\CS ', { line: (cursor.line + q), ch: cursor.ch })
      }
    }
    else {
      var str = ""
      var additionalChars = ""
      if (lineBeforeCursor.includes("\\easyCrossStaff"))
        additionalChars = "  "
      for (var i = 0; i < polyNum; i++) {
        str += "  { " + additionalChars + "\\CS }"
        if (!lineBeforeCursor.includes("\\easyCrossStaff") && i == polyNum - 1)
          str += "%_"
        str += "\n"
      }
      if (lineBeforeCursor.includes("\\easyCrossStaff")) {
        str += "  { \\CS s \\CS } %_\n"
        str += "  { \\CS s \\CS } % \n"
      }
      for (var i = 0; i < polyNum; i++) {
        str += "  { " + additionalChars + "\\CS }"
        if (!lineBeforeCursor.includes("\\easyCrossStaff") && i == 0)
          str += "%"
        str += "\n"
      }
      if (lineBeforeCursor.includes("\\easyCrossStaff")) {
        str += "#'( \\CS - \\CS )\n"
      }
      insertTextAtCursor(str)
    }
  }

}

function checkAndMarkDummyTableCell(line, ch, debug=false) {

  var cstStartLineInfo = getTableStartLineInfos(line)
  if (cstStartLineInfo[2] != "easyCrossStaff")
    return

  var prevMarks = txtEditor().findMarksAt({line: line, ch: ch})
  for (var i = 0; i < prevMarks.length; i++) {
    //TODO: implement a safer check
    if (prevMarks[i].css != null && prevMarks[i].css.includes("color: "+dummyTableCellColor)) {
      prevMarks[i].clear()
      break
    }
  }

  cellNum = getCSTCellNumber(line, ch)
  cellContent = getCSTCellContent(line, cellNum, true)

  if (!cellContent || !cellNum)
    return

  // If we are editing the same cell, unmark the content and return
  var cellOfCursor = getCSTCellNumber(txtEditor().getCursor().line, txtEditor().getCursor().ch)
  if ((line == txtEditor().getCursor().line) && (cellOfCursor == cellNum))
    return

  if ((cellContent.trim() == 's') || (cellContent.trim() == '-')){

    txtEditor().markText({line: line, ch: ch},
                        {line: line, ch: (ch + cellContent.length + 1)},
                        {css: "color: "+dummyTableCellColor})
  }
}

function checkAndMarkDummyTableCells(startLine, endLine) {

  for (var line = startLine; line <= endLine; line++) {

    var lineContent = txtEditor().getLine(line)
    if (!lineContent)
      continue

    let re = "\\CS"
    var tkns = lineContent.split(re)

    var ch = 0
    for (var i = 0; i < tkns.length; i++) {
      checkAndMarkDummyTableCell(line, ch, true)
      ch += tkns[i].length + re.length
    }

  }
}

function getLyFileContentIMPL() {
  return txtEditor().getValue()
}

function replaceExprInLyFileIMPL(grobIdToken, prop, expr) {

  let m;
  //var grobIdToken = parseInt(grob.getAttribute('id').split('_')[1])
  var idIdx = 1
  while ((m = jsSVGRegex.exec(getLyFileContent())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === jsSVGRegex.lastIndex) {
      jsSVGRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        if (match.includes('"' + grobIdToken + '"') && match.includes('"' + prop + '"')) {
          //var newTkn = match.split('(')[0] + '( ' + expr + ' )'

          txtEditor().focus()
          var cursor = txtEditor().getSearchCursor(match)
          if (cursor.findNext()) {
            cursor.replace(expr)
            txtEditor().setCursor({line: cursor.from().line, ch: cursor.from().ch })
            adjustScroll()
            if (!mobileMode)
              txtEditor().setSelection(cursor.from(), cursor.to())
          }
        }
      }
    });
  }
}

// Scroll in a way that the point and clicked item is not shown at the edges of the panel
function adjustScrollIMPL() {

  // All this causes a scroll event if the cursor is
  // too near the top/bottom/right of the panel
  // Note that we have to proceed in this way because from the popup
  // we can't set the scrollbars' positions
  var offs = editorFontSize.replace("px", "")
  var prevCurs = txtEditor().getCursor()
  var cursCoords = txtEditor().cursorCoords(true, "local")
  cursRelativeTop = cursCoords.top
  scrollInfo = txtEditor().getScrollInfo()
  var textscorepanel = baseCtx.document.getElementById("textscorepanel")
  var panelW = textscorepanel.clientWidth
  var panelH = textscorepanel.clientHeight
  if (scrollInfo.top) {
    cursRelativeTop -= scrollInfo.top
  }
  cursRelativeLeft = cursCoords.left
  if (scrollInfo.left) {
    cursRelativeLeft -= scrollInfo.left
  }
  var maxShift = 0
  var factor = 3
  var guttersWidth = 0
  gutters = baseCtx.document.querySelector(".Codemirror-gutters")
  if (gutters) {
    guttersWidth = Number(window.getComputedStyle(gutters).width.replace("px", ""))
    panelW -= guttersWidth
  }

  if (cursRelativeTop <= offs*factor) {
    for (var q = factor; q > 0; q--) {
      if (prevCurs.line >= q) {
        maxShift = q
        break
      }
    }
    txtEditor().setCursor({line: prevCurs.line - maxShift, ch: 0})
    txtEditor().setCursor({line: prevCurs.line - maxShift, ch: 0})
  }
  else if (cursRelativeTop >= (panelH - offs*(factor + 1))) {
    for (var q = factor; q > 0; q--) {
      if (txtEditor().lastLine() >= (prevCurs.line + q)) {
        maxShift = q
        break
      }
    }
    txtEditor().setCursor({line: prevCurs.line + maxShift, ch: 0})
    txtEditor().setCursor({line: prevCurs.line + maxShift, ch: 0})
  }

  maxShift = 0
  lineLength = txtEditor().getLine(prevCurs.line).length
  if (cursRelativeLeft >= (panelW - offs*factor)) {
    for (var q = factor; q > 0; q--) {
      if (lineLength >= (prevCurs.ch + factor + 1)) {
        maxShift = q
        break
      }
    }
    txtEditor().setCursor({line: prevCurs.line, ch: prevCurs.ch + maxShift })
    txtEditor().setCursor({line: prevCurs.line, ch: prevCurs.ch  + maxShift})
  }

  // Then we set back the cursor to the previous position
  txtEditor().setCursor(prevCurs)
  txtEditor().setCursor(prevCurs)
}

function showPointAndClickPositionIMPL(textPos) {

  var evt = event || window.event
  var button = evt.which || evt.button
  if (button != 1)
    return

  var currText = getLyFileContent()
  var lines = currText.split('\n')
  var i = 0
  var lineFound = false
  var charsCtr = 0
  var col = 0
  while ((charsCtr <= currText.length) && (charsCtr <= textPos) && (i < lines.length)) {
    col = textPos - charsCtr
    charsCtr += lines[i++].length + 1
  }
  i -= 1

  txtEditor().setCursor({line: i, ch: col})
  txtEditor().setCursor({line: i, ch: col})
  adjustScroll()

  var cursorLine = txtEditor().getLine(txtEditor().getCursor().line)
  var q = col
  var endOfToken = false

  while (q < cursorLine.length) {
    if (cursorLine[q].trim() == '')
      break
    q++
  }

  emptyCharOfLastSelectedMusic = [i, q]
  pointAndClickJustDone = true

  var el = document.querySelector('.CodeMirror-cursor')

  //doesn't seem to work for some chars, then it's currently disabled
  if(1 == 0 &&el) {
    cursorCurrBlinkRate = 130
    txtEditor().focus()
    el.style.borderLeft = "10px solid red"
    setTimeout(function(){
      el.style.borderLeft = cursorDefaultBorderLeft
      cursorCurrBlinkRate = cursorDefaultBlinkRate
      txtEditor().getInputField().blur()
      txtEditor().focus()
    }, 1500)
  }

  else {
    // Browsers don't allow to focus on window.opener, then we "fake" this behavior
    if (pointAndClickMark != null)
      return

    for (var q = 1; q <= (pointAndClickDuration / pointAndClickBlinkRate); q++) {
      toggle = true
      setTimeout(function() {
        if (toggle) {
          if (pointAndClickMark != null)
            pointAndClickMark.clear()
          pointAndClickMark = txtEditor().markText({line: i, ch: col},
                                                   {line: i, ch: (col+1)},
                                                   {className: "blinkingCursor"})
        }
        else {
          if (pointAndClickMark != null)
            pointAndClickMark.clear()
          pointAndClickMark = txtEditor().markText({line: i, ch: col},
                                                   {line: i, ch: (col+1)},
                                                   {className: "normalCursor"})
        }
        toggle = !toggle
      }, pointAndClickBlinkRate*q)
    }
    setTimeout(function() {
      if (pointAndClickMark != null) {
        pointAndClickMark.clear()
        pointAndClickMark = null
        txtEditor().getInputField().blur()
        txtEditor().focus()
      }
    }, pointAndClickDuration + pointAndClickBlinkRate)
  }

}

function createTxtEditorIMPL() {
  var txtArea = document.getElementById('lilyinputfile')
  txtEditor_ = CodeMirror(function(elt) {
    txtArea.parentNode.replaceChild(elt, txtArea);},
    {
      extraKeys: {"Ctrl-Space": "autocomplete"},
      value: txtArea.value,
      mode: {name: "stex", globalVars: true},
      styleActiveLine: highlightActiveLine,
      viewportMargin: viewportMarginCustom,
      smartIndent: false,
      //styleActiveSelected: true,
      matchBrackets: true,
      lineNumbers: showLineNumbers
    })

  cursorDefaultBlinkRate = txtEditor().getOption("cursorBlinkRate")
  cursorCurrBlinkRate = cursorDefaultBlinkRate
  txtEditor().getWrapperElement().style["font-size"] = editorFontSize;

}

function setAutoSwitchToBlockSelectionIMPL() {

  confMouseDefaultOpt = txtEditor().getOption("configureMouse")
  txtEditor().setOption("configureMouse", function() {

    var selectionInsidePianoTable = getTableStartLineInfos(currPressedLine)[3]

    if (forceBlockSelectionInsidePianoTable &&
        (selectionInsidePianoTable )) {
      blockSelection = true
      return {unit: "rectangle"}
    }
    else {
      blockSelection = false
      return {unit: confMouseDefaultOpt}
    }
  })

}

function markCSTSeparators(startLine, startCh, endLine, endCh) {

  var selectionCursor = txtEditor().getSearchCursor("\\CS", {line: startLine, ch: startCh},
                                                  {caseFold: true, multiline: true})

  while (tkn = selectionCursor.findNext()) {

    var from = selectionCursor.from()
    var to = selectionCursor.to()

    if (from.line > endLine)
      break

    var markerFound = false
    var prevMarks = txtEditor().findMarksAt({line: from.line, ch: from.ch})
    for (var i = 0; i < prevMarks.length; i++) {
      if (prevMarks[i].replacedWith != null &&
          prevMarks[i].replacedWith.className &&
          (prevMarks[i].replacedWith.className == 'cstSepMarker')) {
        markerFound = true
        break
      }
    }

    if (!markerFound) {
      var elm = document.createElement('span')
      elm.style.color = tableSeparatorColor
      elm.innerHTML = '|'
      elm.className = "cstSepMarker"
      txtEditor().markText(from, to, { replacedWith: elm, attributes: { from: from, to: to }})
    }
    //else console.log("marker found")
  }
}

function setEventHandlersForTxtEditorIMPL() {

  txtEditor().on("focus", function () {
    txtEditor().setOption("cursorBlinkRate", cursorCurrBlinkRate)
  })

  txtEditor().on("cursorActivity", function(e, range) {

    var cstStartLineInfo = getTableStartLineInfos(txtEditor().getCursor().line)
    var isEasyCrossStaff = cstStartLineInfo[2] == "easyCrossStaff"

    if (cstStartLineInfo[3])
        cursorInsidePianoTable = true
    else
      cursorInsidePianoTable = false

    var currentCSTCellNumber = getCSTCellNumber(txtEditor().getCursor().line,
                                                txtEditor().getCursor().ch)

    scrollReadyToBeAdjustedIfNecessary = true

    if (pointAndClickJustDone)
      pointAndClickJustDone = false
    else
      emptyCharOfLastSelectedMusic = [txtEditor().getCursor().line, txtEditor().getCursor().ch]

    if (cursorInsidePianoTable && isEasyCrossStaff) {

      cellContent = getCSTCellContent(txtEditor().getCursor().line,
                                      currentCSTCellNumber,
                                      true)
      if (overWriteToggled) {
        txtEditor().toggleOverwrite(false)
        overWriteToggled = false
      }
      if (cellContent) {
        if ((cellContent.trim() == 's') || (cellContent.trim() == '-')) {

          var startCh = getCSTCellStartCh(txtEditor().getCursor().line, currentCSTCellNumber)

          // Move the cursor at the beginning of the CST cell, if it is empty
          if (currentCSTCellNumber != prevCSTCellNumber || prevCursorLine != txtEditor().getCursor().line) {

            checkAndMarkDummyTableCell(txtEditor().getCursor().line, startCh)

            if(txtEditor().getSelection() == '') {
              scroll = txtEditor().getScrollInfo()
              txtEditor().setCursor({line: txtEditor().getCursor().line, ch: (startCh + cellContent.length - 1)})
              txtEditor().scrollTo(scroll.left, scroll.top)
              guttersDiv = document.querySelector(".Codemirror-gutters")
              if (guttersDiv) {
                guttersWidth = Number(window.getComputedStyle(guttersDiv).width.replace("px", ""))
                cursorCoordLeft = txtEditor().cursorCoords(true).left
                var offsetGuardia = 20
                if (txtEditor().cursorCoords(true).left < guttersWidth + offsetGuardia) {
                  scroll = txtEditor().getScrollInfo()
                  txtEditor().scrollTo(Math.max(0, (scroll.left - (guttersWidth + offsetGuardia - cursorCoordLeft))),
                                       scroll.top)
                }
              }
              formatCurrPianoTableColumn()
            }
          }

          // Toggle to overwrite mode
          if (txtEditor().getCursor().ch <= startCh + cellContent.length)
            txtEditor().toggleOverwrite(true)
          overWriteToggled = true
        }
      }

    }

    if (prevCursorLine != null &&
        ((prevCSTCellNumber != currentCSTCellNumber) ||
         (prevCursorLine != txtEditor().getCursor().line)) &&
         (prevCSTCellNumber != null)) {

      prevCellContent = getCSTCellContent(prevCursorLine,
                                          prevCSTCellNumber,
                                          true)
      if (prevCellContent != null) {

          prevCellCh =  getCSTCellStartCh(prevCursorLine, prevCSTCellNumber)

          if (prevCellContent.trim() == '' && isEasyCrossStaff) {

            var cstStartLineInfo2 = getTableStartLineInfos(prevCursorLine)
            var varTableRowOffs = prevCursorLine - cstStartLineInfo2[0]

            var emptyCellTxt = ' s'
            if (varTableRowOffs == 3)
              emptyCellTxt = ' -'

            insertTextAtPosition(emptyCellTxt, {line: prevCursorLine, ch: prevCellCh})
            prevCellContent = emptyCellTxt
          }

          checkAndMarkDummyTableCell(prevCursorLine, prevCellCh)

      }
    }

    prevCSTCellNumber = currentCSTCellNumber
    prevCursorLine = txtEditor().getCursor().line
    prevCursorCh = txtEditor().getCursor().ch

  })

  txtEditor().on("beforeSelectionChange", function changeSelectionLimitsIfNecessary(e, range) {

    if (!forceBlockSelectionInsidePianoTable)
      return

    var isSelectionInsidePianoTable = getTableStartLineInfos(range.ranges[0].anchor.line)[3]

    if (!isSelectionInsidePianoTable)
      return

    var selRightLim = range.ranges[0].head.ch

    if(!txtEditor().getLine(currPressedLine))
      return

    var lineLength = txtEditor().getLine(currPressedLine).replace(/~+$/, '').length

    var minHeadCh = null
    var maxHeadCh = null
    for (var q = 0 ; q < range.ranges.length; q++) {
        //range.ranges[q].head.ch = 1
      var currHeadCh = range.ranges[q].head.ch
      if ((currHeadCh < minHeadCh) || (minHeadCh == null))
        minHeadCh = currHeadCh
      if ((currHeadCh > maxHeadCh) || (maxHeadCh == null))
        maxHeadCh = currHeadCh
      //console.log("["+q+"] prev range = "+ range.ranges[q].head.ch)
    }

    if (range.ranges[0].anchor.ch == minHeadCh)
      return

    for (var q = 0 ; q < range.ranges.length; q++) {
      range.ranges[q].head.ch = minHeadCh
    }

    if (lineLength >= 5 && (selRightLim > lineLength - 1)) {
      for (var q = 0 ; q < range.ranges.length; q++) {
        range.ranges[q].head.ch = range.ranges[q].head.ch - 1
      }
    }

    for (var q = 0 ; q < range.ranges.length; q++) {

      if (range.ranges[q].head.ch < range.ranges[q].anchor.ch) {
        if (range.ranges[q].head.ch <= 3)
          range.ranges[q].head.ch = 3
      }
      else {
        if (range.ranges[q].anchor.ch <= 3)
          range.ranges[q].anchor.ch = 3
      }

    }

  })

  txtEditor().on("change", function (cm, changeObj) {

    //TODO rebuild deepcheck for codemirror's events
    var deepCheck = false
    if (changeObj) {

      if (changeObj.origin == '+input') {
          if (specialMarkersOnTables) {
            markCSTSeparators(changeObj.from.line,
                                changeObj.from.ch - 3,
                                changeObj.from.line,
                                changeObj.from.ch + 1)
            checkAndMarkDummyTableCells(changeObj.from.line, changeObj.from.line)
          }
      }
      else {

          if (specialMarkersOnTables) {
            markCSTSeparators(changeObj.from.line,
                                changeObj.from.ch,
                                changeObj.from.line + changeObj.text.length,
                                changeObj.from.ch)
            checkAndMarkDummyTableCells(changeObj.from.line, changeObj.from.line + changeObj.text.length - 1)
          }
          if (changeObj.origin == 'undo' || changeObj.origin == 'paste')
            deepcheck = true
      }

    }

    lyfilename = document.getElementById("lyfilename").innerHTML
    setLyfilename = false
    if (!txtEditor().isClean() && !lyfilename.includes(modFileLabelToken)) {
      lyfilename = modFileLabelToken + lyfilename
      setLyfilename = true
    }
    else if (txtEditor().isClean() && lyfilename.includes(modFileLabelToken)) {
      lyfilename = lyfilename.substring(modFileLabelToken.length)
      setLyfilename = true
    }
    if (setLyfilename)
      document.getElementById("lyfilename").innerHTML = lyfilename

    updatePointAndClickPositions(deepCheck)

  })

  txtEditor().on("keyup",  function (cm, event) {
    var keycode = event.which
    if (keycode == 17)
      ctrlStillPressed = false
    // Alt = 18 Ctrl = 17
    if (!ctrlStillPressed && keycode != 18 && txtEditor().getSelection() == "") {
       formatCurrPianoTableColumn()
    }
  })

  txtEditor().on("mousedown",  function (cm, event) {
    currPressedLine = txtEditor().coordsChar({left: 0, top: event.clientY}).line
  })

  txtEditor().on("keydown",  function (cm, event) {
    var keycode = event.which
    // Ctrl = 17
    if (keycode == 17)
      ctrlStillPressed = true
  })

}
