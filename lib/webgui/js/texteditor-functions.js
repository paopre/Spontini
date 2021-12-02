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

const maxJssvIdBlockregx = /maxjssvgid=[\w-]+/g;

function getMaxJSSVGId(lyContent = null) {
  let m;
  var idIdx = 1
  ret = 0
  if (lyContent == null)
    lyContent = getLyFileContent()

  while ((m = jsSVGRegex.exec(lyContent)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === jsSVGRegex.lastIndex) {
      jsSVGRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        currId = match.split('"')[1]
        if (Number(currId) && Number(currId) > ret)
          ret = Number(currId)
      }
    });
  }

  let m2;

  while ((m2 = maxJssvIdBlockregx.exec(lyContent)) !== null) {
    if (m2.index === maxJssvIdBlockregx.lastIndex) {
      maxJssvIdBlockregx.lastIndex++;
    }

    m2.forEach((match, groupIndex) => {
      var maxjssvgid = match.split("=")[1]
      if (maxjssvgid && Number(maxjssvgid)) {
        maxjssvgidNum = Number(maxjssvgid)
        if (maxjssvgidNum > ret)
          ret = maxjssvgidNum
      }
    })
  }

  return ret
}

function getNextFreeIdForJSObjsExpr(lyContent = null) {

  var ret = getMaxJSSVGId(lyContent)
  ret++
  return ret

}

function getNextGenericVar() {
  let m;
  var idIdx = 1
  var retId = 0
  var retVar = "error"

  while ((m = genericVarRegex.exec(getLyFileContent())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === genericVarRegex.lastIndex) {
      genericVarRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        currId = match.replace("$"+genericVarPrefix, "")
        if (Number(currId) && Number(currId) > retId)
          retId = Number(currId)
      }
    })
  }
  retId++
  return genericVarPrefix+retId
}

function getNextJSVar() {
  let m;
  var idIdx = 1
  var retId = 0
  var retVar = "error"

  while ((m = jsVarRegex.exec(getLyFileContent())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === jsVarRegex.lastIndex) {
      jsVarRegex.lastIndex++
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        currId = match
        currId = currId.substring(jsVarPrefix.length + 1, currId.length - 1)
        if (Number(currId) && Number(currId) > retId) {
          retId = Number(currId)
        }
      }
    })
  }
  retId++
  return jsVarPrefix+retId
}

function getLilySetProperty(propRegex, grobIdToken, propName) {
  // TODO: replace jsSVGRegex with that
  // var regexStr = "(?:" + regexStartTkn +
  // ") +\\{(?:[^\\{}]*|\\{(?:[^\\{}]*|\\{(?:" +
  // "[^\\{}]*|\\{[^\\{}]*\\})+\\})+\\})+\\}"

  let m;
  var idIdx = 1
  ret = null

  while ((m = jsSVGRegex.exec(getLyFileContent())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === jsSVGRegex.lastIndex) {
      jsSVGRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        if (match.includes('"' + grobIdToken + '"') && match.includes('"' + propName + '"')) {
          ret = match
          idIdx++
        }
      }
    });
  }

  return ret

}

function addJsTxtItem(startToken, objName, prop, pos) {

  id = getNextFreeIdForJSObjsExpr()
  str = startToken + '\\js'+ objName + ' "'+ id+'" "'+prop+'" #\'() '
  insertTextAtCursor(str)
  formatCurrPianoTableColumn()
  updatePointAndClickPositions(false)

}

function diffText(a, b) {

  isCut = false
  if (a.length > b.length) {
    temp = b
    b = a
    a = temp
    isCut = true
  }
  var i = 0
  var j = 0
  var idxL = 0
  var idxR = 0
  var result = []
  i = a.length - 1
  j = b.length - 1
  while (j > 0) {
    if(a[i] != b[j]) {
      break
    }

    j--
    i--
  }

  diffLength =  b.length - a.length

  if (isCut) {
    result[0] = j + 1
    result[1] = j + 1 - diffLength
  }
  else {
    result[0] = j + 1 - diffLength
    result[1] = j + 1
  }
  return result

}

//TODO?: update also when an element is removed?
function __updatePointAndClickPositions(oldText,newText) {

  diffTxt = diffText(oldText, newText)
  //newCursorVal = diffTxt[1]
  offset = diffTxt[1] - diffTxt[0]
  nodesWithTextPos = svgContainerCtx.document.querySelectorAll('[textpos]')
  for (var i = 0; i < nodesWithTextPos.length; i++) {
    prevPos = Number(nodesWithTextPos[i].getAttribute('textpos'))
    if (prevPos >= diffTxt[0]) {
      nodesWithTextPos[i].setAttribute('textpos', (prevPos+offset))
    }
  }

}

//TODO/FIXME  refactor API and eliminate __updatePointAndClickPositions()
function updatePointAndClickPositions(deepCheck) {

  lastMemTextLines = baseCtx.lastMemText.split('\n')
  newTextLines = getLyFileContent().split('\n')
  tempTextLines = lastMemTextLines.slice()

  // do this on PASTE-&-REPLACE on the same lines OR when the text is updated not by the user
  // otherwise the text edit will slow down
  if (deepCheck) {
    for (var i = 0; i < newTextLines.length; i++) {
      if (tempTextLines[i] != newTextLines[i]){
        tempTextLines[i] = newTextLines[i]
        __updatePointAndClickPositions(baseCtx.lastMemText, tempTextLines.join('\n'))
        baseCtx.lastMemText = tempTextLines.join('\n')
      }
    }
  }
  else {
    __updatePointAndClickPositions(baseCtx.lastMemText, getLyFileContent())
  }

  baseCtx.lastMemText  = getLyFileContent()

}

function addBlock(marker) {
  var str1 = '% START '+marker+' %'
  var str2 = '%'
  var str3 = '% END '+marker+'   %'
  for (var i = 0; i < str1.length - 2; i++)
      str2 += '-'
  str2 = str2 + "%"
  var str = str2 + '\n' + str1+ '\n' + str2 +
              '\n\n' +
              str2 + '\n' + str3+ '\n' + str2 + '\n'

  insertTextAtCursor(str)
}

function addTabularTwoStavesPoly() {
  var str = '\\tabularTwoStavesPoly %TMODE\n'
  insertTextAtCursor(str)
}

function addEasyCrossStaff() {
    var str = '\\easyCrossStaff %TMODE\n'
    insertTextAtCursor(str)
}

function addJSOSOPadder() {
    id = getNextFreeIdForJSObjsExpr()
    var str = '\\jsOSOPadder "'+id+'" "pads" #\'()'
    insertTextAtCursor(str)
}

function addJSPadder() {
    id = getNextFreeIdForJSObjsExpr()
    var str = '\\jsPadder "'+id+'" "pads" #\'()'
    insertTextAtCursor(str)
}

function addJSTweak() {
    id = getNextFreeIdForJSObjsExpr()
    var str = '\\jsTweak "'+id+'" " " #\'()'
    insertTextAtCursor(str)
}

function addJSOnceOverride() {
    id = getNextFreeIdForJSObjsExpr()
    var str = '\\jsOnceOverride "'+id+'" " " #\'()'
    insertTextAtCursor(str)
}

function initKeymapsForTxtEditor() {

  var keyMaps = []

  keyMaps.push({ [tabularTwoStavesPolyKey] : addTabularTwoStavesPoly })

  keyMaps.push({ [easyCrossStaffKey] : addEasyCrossStaff })

  keyMaps.push({ [completeTableOrTemplateKey] : completeTableOrTemplateFunc })

  keyMaps.push ({ [addGenericVarsBlockKey] : function() { addBlock(genericVarsBlockMarker) } })

  keyMaps.push({ [replaceWithVarKey] : replaceWithVarFunc })

  keyMaps.push({ [jsOSOPadderKey] : addJSOSOPadder })

  keyMaps.push({ [jsPadderKey] : addJSPadder })

  keyMaps.push ({ [addJSBlockKey] : function() { addBlock(jsBlockMarker) } })

  keyMaps.push( { [savekey] : function(cm) {
    execOperations("SAVE_LY_FILE")
  }})

  keyMaps.push({ [jsTweakKey] : addJSTweak })

  keyMaps.push({ [jsOnceOverrideKey] : addJSOnceOverride })

  for (var i = 0; i < keyMaps.length; i++)
    addKeyMapToTxtEditor(txtEditor(), keyMaps[i])

}

///////////////////
// API FOR WRAP
////////////////////

//TODO: this is only a very PARTIAL STUB. Must be completed!

function setLyFileContent(txt, force = false) {
  setLyFileContentIMPL(txt, force)
}

function insertTextAtCursor(txt, force = false) {
  insertTextAtCursorIMPL(txt, force)
}

function replaceCurrentSelection(text, option = "") {
  replaceCurrentSelectionIMPL(text, option)
}

function insertTextAtPosition(text, position1, position2 = null, force = false) {
  insertTextAtPositionIMPL(text, position1, position2, force)
}

function addKeyMapToTxtEditor(editor, item) {
  //codemirror impl
  addKeyMapToTxtEditorIMPL(editor, item)
}

function adjustScroll() {
  return adjustScrollIMPL()
}

function getLyFileContent() {
  return getLyFileContentIMPL()
}

function getLyFileContentFiltered() {
  return getLyFileContentFilteredIMPL()
}

function replaceExprInLyFile(grobIdToken, prop, expr) {
  replaceExprInLyFileIMPL(grobIdToken, prop, expr)
}

function createTxtEditor() {
  createTxtEditorIMPL()
}

function showPointAndClickPosition(textPos) {
  showPointAndClickPositionIMPL(textPos)
}

function completeTableOrTemplateFunc(txtEditor) {
  completeTableOrTemplateFuncIMPL(txtEditor)
}

function replaceWithVarFunc() {
  replaceWithVarFuncIMPL()
}

function setAutoSwitchToBlockSelection() {
  setAutoSwitchToBlockSelectionIMPL()
}

function setEventHandlersForTxtEditor() {
  setEventHandlersForTxtEditorIMPL()
}

function txtEditor() {
  return baseCtx.txtEditor_
}

function txtHiddenEditor() {
  return baseCtx.txtHiddenEditor_
}

////////////////////
// END API FOR WRAP
////////////////////
