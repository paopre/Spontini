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

function replaceWithVarFuncIMPL(from = null, to = null) {

    var cursor = txtEditor().getCursor()
    var currLineNum = txtEditor().getCursor().line
    selText = ""
    if (from == null && to == null) {
      selText = txtEditor().getSelection()
    }
    else {
      currLineNum = from.line
      selText = txtEditor().getRange(from, to)
    }
    var oldScroll = txtEditor().getScrollInfo()
    var prevTop = txtEditor().cursorCoords().top
    var newTop = -1

    if (selText.trim() == '')
      return

    if (selText.includes("\\jsTweak") || selText.includes("\\jsOnceOverride") ||
        selText.includes("\\jsOnceOffset") || selText.includes("\\jsShape")) {
        var jsVar = getNextJSVar()
        while ( currLineNum >= 0) {
          var lineContent = txtEditor().getLine(currLineNum)
          if (lineContent.includes("START " + jsBlockMarker)) {
            var functionMarkDef = "#(define-music-function (parser location sym mus) ((symbol-list? '()) ly:music?)"
            var defineVar = "\n\""+jsVar+"\" = "+functionMarkDef
            defineVar = defineVar + " #{\n"+selText+" $sym $mus \n#})\n"
            if (from == null && to == null)
              replaceCurrentSelection("\\\""+jsVar+"\"")
            else
              txtEditor().replaceRange("\\\""+jsVar+"\"", from, to)
            insertTextAtPosition(defineVar, {line: (currLineNum+2), ch: 0})
            newTop = txtEditor().cursorCoords().top
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
          newTop = txtEditor().cursorCoords().top
          formatCurrPianoTableColumn()
          break
        }
        currLineNum--
      }
    }

    var diff = newTop - prevTop
    txtEditor().scrollTo(txtEditor().getScrollInfo().left, txtEditor().getScrollInfo().top + diff)
    adjustScroll(true) //true means that the scroll is adjusted only for X axis

}

async function replaceAllWithVarsFuncsIMPL() {
  txtEditor().setValue(getLyFileContent())

  var jssvgBlockStartLine = -1
  var jssvgBlockEndLine = -1
  for (var i = 0; i < txtEditor().lastLine(); i++) {
    var lineContent = txtEditor().getLine(i)
    if (lineContent.includes("START " + jsBlockMarker))
      jssvgBlockStartLine = i
    else if (lineContent.includes("END " + jsBlockMarker))
      jssvgBlockEndLine = i

    if ((jssvgBlockStartLine != -1) && (jssvgBlockEndLine != -1))
      break
  }

  if ((jssvgBlockStartLine == -1) || (jssvgBlockEndLine == -1))
    return

  while ((m = jsSVGRegex.exec(getLyFileContent())) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === jsSVGRegex.lastIndex) {
          jsSVGRegex.lastIndex++;
      }

      m.forEach((match, groupIndex) => {
        if (match) {
          var searchCursor = txtEditor().getSearchCursor(match)
          if (searchCursor.findNext()) {
            if ((searchCursor.from().line < jssvgBlockStartLine) ||
                (searchCursor.from().line > jssvgBlockEndLine))
            {
              logInfo("Marking: "+match)
              replaceWithVarFunc(searchCursor.from(), searchCursor.to())
            }
          }
        }
      })
  }
  updatePointAndClickPositions(true)

}

function completeTableFunc(editor) {

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

function completeTemplateFunc(editor) {
  var cursor = editor.getCursor()
  var line = cursor.line
  var lineContent = editor.getLine(cursor.line).trim()
  lineContent = lineContent.substring(1, lineContent.length - 1)
  if (lineContent != "") {
    var data = {
      cmd: 'TEMPLATE_CONTENT',
      param1: lineContent
    }
    sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
      if (statusTxt == "OK") {
        editor.replaceRange("", { line, ch: 0 }, { line })
        if (responseTxt.includes(templateStartTkn))
          responseTxt = responseTxt.split(templateStartTkn)[1]
        if (responseTxt.includes(nextIdIdentifier)) {
          //console.log("sono qui")
          responseTxt = responseTxt.replace(nextIdIdentifier, getNextFreeIdForJSObjsExpr())
        }
        insertTextAtPosition(responseTxt, {line: cursor.line, ch: 0})
        updatePointAndClickPositions(true)
      }
    }, false)
  }
}

function completeTableOrTemplateFuncIMPL(editor) {
  var cursor = editor.getCursor()
  var lineContent = editor.getLine(cursor.line)
  if (lineContent.trim().startsWith("<") && lineContent.trim().endsWith(">"))
    completeTemplateFunc(editor)
  else
    completeTableFunc(editor)
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
  var found = false
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
          found = true
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
    })
  }

  if (!found)
    alert("Warning: could not find the expression associated to id="+grobIdToken+" in the ly file")

}

// Scroll in a way that the point and clicked item is not shown at the edges of the panel
function adjustScrollIMPL(xOnly = false) {

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

  if (!xOnly) {
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

  var txtHiddenArea = document.getElementById('hiddeneditor')
  txtHiddenEditor_ = CodeMirror(function(elt) { txtHiddenArea.parentNode.replaceChild(elt, txtHiddenArea);})
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

function getSectionNum(chunk) {

  var tkn = sectionStartIdentifier
  if (chunk.includes(linkPageBreakIdentifier))
    tkn = linkPageBreakIdentifier
  return parseInt(chunk.replace("%{", "")
                       .replace("%}","")
                       .replace(tkn, "")
                       .trim())

}

function getLyFileContentFilteredIMPL() {

  if (getCurrentScoreFilter().trim() == '')
    return getLyFileContent()

  txtHiddenEditor().setValue(getLyFileContent())

  var filterPages = false
  var rangesOrig = getCurrentScoreFilter().split(';')
  // atomic ranges
  var ranges = []

  for (var i = 0; i < rangesOrig.length; i++) {

    if (rangesOrig[i].includes('p')) {
      rangesOrig[i]  = rangesOrig[i].replace('p', '')
      filterPages = true
    }

    if (rangesOrig[i].includes('-')) {
      var rangeL = parseInt(rangesOrig[i].split('-')[0])
      var rangeR = parseInt(rangesOrig[i].split('-')[1])
      if (!isNaN(rangeL) && !isNaN(rangeR)) {
        if (rangeL < rangeR)
          for (var q = rangeL; q <= rangeR; q++)
            ranges.push(q)
      }
    }
    else if (!isNaN(parseInt(rangesOrig[i])))
      ranges.push(parseInt(rangesOrig[i]))
  }

  ranges.sort(function(a, b) {
    return a - b;
  })

  var sections = new Map();
  var currSectionNum = null
  var currPageBreakNum = 1
  var pageBreakDummyCnt = 0

  var matchCursor1 = txtHiddenEditor().getSearchCursor(sectionRegex)
  while (matchCursor1.findNext()) {

    var assocTxt = txtHiddenEditor().getRange(matchCursor1.from(), matchCursor1.to())
    var isSectionStart = assocTxt.includes(sectionStartIdentifier)
    var isPageBreakStart = assocTxt.includes("\\pageBreak")
    var isLinkPageBreak = assocTxt.includes(linkPageBreakIdentifier)
    var isUnlinkPageBreak = assocTxt.includes(unlinkPageBreakIdentifier)

    if (isSectionStart || isPageBreakStart || isLinkPageBreak) {

      if (txtHiddenEditor().getLine(matchCursor1.from().line).includes("Dummy"))
        pageBreakDummyCnt++

      var assocTxt = txtHiddenEditor().getRange(matchCursor1.from(), matchCursor1.to())
      var currSectionNum = -1

      if (isSectionStart && filterPages)
        continue
      else if ((isPageBreakStart || isLinkPageBreak) && !filterPages)
        continue
      else if (isSectionStart || isLinkPageBreak)
        currSectionNum = getSectionNum(assocTxt)
      else if (isPageBreakStart) {
        currSectionNum = currPageBreakNum
        currPageBreakNum++
      }

      if (isNaN(currSectionNum))
        continue

      var included = ranges.includes(currSectionNum)
      var matchCursor2 = txtHiddenEditor().getSearchCursor(sectionRegex, matchCursor1.from())
      // skip the first match (it's the start section)
      matchCursor2.findNext()
      var isSectionEnd = false
      while (tkn2 = matchCursor2.findNext()) {
        var assocTxt2 = txtHiddenEditor().getRange(matchCursor2.from(), matchCursor2.to())
        //console.log(assocTxt2)
        if (!filterPages && assocTxt2.includes(sectionEndIdentifier))
          isSectionEnd = true
        else if (filterPages && assocTxt2.includes("\\pageBreak"))
          isSectionEnd = true
        else if (filterPages && assocTxt2.includes(unlinkPageBreakIdentifier))
          isSectionEnd = true

        if (isSectionEnd) {
          if (!included) {
            //assocTxt2 = '%}' + assocTxt2
            var txtBetween = txtHiddenEditor().getRange(matchCursor1.from(), matchCursor2.from())
            txtBetween = txtBetween.replace(/[^\t\n]/g, ' ')
            txtHiddenEditor().replaceRange(txtBetween, matchCursor1.from(), matchCursor2.from())
          }
          //console.log("END="+assocTxt2)
          break
        }
      }
    // inside a section
    }
  // looping sections
  }

  var modContent = txtHiddenEditor().getValue()
  return modContent

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
