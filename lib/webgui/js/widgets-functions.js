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

var blockIdentifier = "__BLOCK__"
const blockRegex = /%{__BLOCK__\d+%}[\s\S]*?%{%}/g
const blockTknRegex = /__BLOCK__\d+/g
var executingToolInProgress = false
var defaultSymbolsBtnStyle = null
var defaultZoomBtnStyle = null
var defaultUndockScoreBtnStyle = null
var ptzbtnSelected = false
var undockscorebtnSelected = false
var pagenumtxt = document.getElementById('pagenumtxt')
var svgPanelWidthBeforeUndock = null
var svgPanelHeightBeforeUndock = null
var textScorePanelWidthBeforeUndock = null
var textScorePanelHeightBeforeUndock = null
var layoutBeforeUndock = 1
var editorMustClosePopup

function getBlockNum(text) {
  let m;
  var blockNum = null

  while ((m = blockTknRegex.exec(text)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === blockTknRegex.lastIndex) {
      blockTknRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        if (match.includes(blockIdentifier))
         blockNum = match.replace(blockIdentifier, "").trim()
      }
    });
  }

  return blockNum
}

function replaceBlockContent(blockNum, text) {

  let m;
  var blockContent = null

  while ((m = blockRegex.exec(getLyFileContent())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === blockRegex.lastIndex) {
      blockRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        if (match.includes(blockIdentifier+blockNum)+"%}") {
          var newBlock = "%{"+blockIdentifier+blockNum+"%}"+ text+"%{%}"
          setLyFileContent(getLyFileContent().replace(match, newBlock))
          var selectionCursor = txtEditor().getSearchCursor(newBlock,
                                                          CodeMirror.Pos(txtEditor().firstLine(), 0),
                                                          {caseFold: true, multiline: true})
          selectionCursor.findNext()
          var from = selectionCursor.from()
          var to = selectionCursor.to()
          txtEditor().setSelection(from, to)
          //FIXME: this raises a ff warning, sometime
          txtEditor().scrollIntoView({from: from, to: to });

          var posX = txtEditor().getScrollInfo().left
          var posY = txtEditor().getScrollInfo().top
          var adjustScroll = false

          if (txtEditor().cursorCoords(true, "page").left > (txtEditor().getScrollInfo().clientWidth*2/3)) {
            posX = txtEditor().getScrollInfo().left + txtEditor().getScrollInfo().clientWidth*1/3
            adjustScroll = true
          }

          if (txtEditor().cursorCoords(true, "page").left < (txtEditor().getScrollInfo().clientWidth*1/3)) {
            posX = txtEditor().getScrollInfo().left - txtEditor().getScrollInfo().clientWidth*1/3
            adjustScroll = true
          }

          if (txtEditor().cursorCoords(true, "page").top < (txtEditor().getScrollInfo().clientHeight*1/3)) {
            posY = txtEditor().getScrollInfo().top - txtEditor().getScrollInfo().clientHeight*1/3
            adjustScroll = true
          }

          if (txtEditor().cursorCoords(true, "page").top > (txtEditor().getScrollInfo().clientHeight*2/3)) {
            posY = txtEditor().getScrollInfo().top + txtEditor().getScrollInfo().clientHeight*1/3
            adjustScroll = true
          }
          if (adjustScroll) {
            txtEditor().scrollTo(posX, posY)
          }
        }
      }
    })
  }

}

function execTool(tool, txtEditor) {

  if (executingToolInProgress)
    return

  var exectoolbtn = document.getElementById('exectoolbtn')
  var exectoolbtndefaultstyle = exectoolbtn.style
  exectoolbtn.style.background = waitButtonBackground
  exectoolbtn.style.color = waitButtonColor
  exectoolbtn.style.cursor = 'progress'

  executingToolInProgress = true

  var selTxt = txtEditor().getSelection()
  var needToSendMsg = false
  tool = unescape(tool)

  var nothingElseToDo = false

  if (tool == 'jstweak') {
    addJSTweak()
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  else if (tool == 'jsonceoverride') {
    addJSOnceOverride()
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  else if (tool == 'jspadder') {
    addJSPadder()
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  else if (tool == 'jsosopadder') {
    addJSOSOPadder()
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  else if (tool == 'markwithvariable') {
    replaceWithVarFunc()
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  else if (tool == 'jsblockmarker') {
    addBlock(jsBlockMarker)
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  else if (tool == 'genericvarsblockmarker') {
    addBlock(genericVarsBlockMarker)
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  else if (tool == 'setconfigparam') {
    param = prompt("Please insert the param to config")
    if (param && param != '') {
      val = prompt("Please insert the value")
      if (!val)
        val = ""
      var data = {
        cmd: 'SET_CONFIG_PARAM',
        param1: param,
        param2: val
      }
      sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
        executingToolInProgress = false
        exectoolbtn.style = exectoolbtndefaultstyle
        nothingElseToDo = true
      }, false)
    }
  }
  else if (tool == 'setwebmidisoundfont') {
    nothingElseToDo = true
    promptSoundFontURL(exectoolbtndefaultstyle)
  }
  else if (tool == 'togglesvgscrollbars') {
    svgContainerCtx.toggleSVGScrollbars()
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    nothingElseToDo = true
  }
  if (nothingElseToDo) {
    txtEditor().focus()
    return
  }
  pluginArr = tool.split(pluginsSepTkn2)
  toolToExecute = pluginArr[0]
  var pluginInput = pluginArr[1]
  var pluginOutput = pluginArr[2]
  var cmd = pluginArr[3]
  extensionForFileToSave = pluginArr[4]
  var inputParamsPrompt = pluginArr[5]
  var showResult = pluginArr[6]

  contentForFileToSave = "PLUGIN_INPUT"
  if (pluginInput == 'document')
    inputForPluginToExecute = getLyFileContent()
  else if (pluginInput == 'none')
    inputForPluginToExecute = pluginInput
  else
    inputForPluginToExecute = txtEditor().getSelection()

  if (inputForPluginToExecute == '') {
    if (pluginInput == 'selection')
      alert("Select some text and press execute")
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    txtEditor().focus()
    return
  }

  var inputParams = null

  if (inputParamsPrompt != 'false')
    inputParams = prompt(inputParamsPrompt)

  if (inputParamsPrompt != 'false' && !inputParams) {
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    txtEditor().focus()
    return
  }
  else if (!inputParams)
    inputParams = ''

  if (pluginOutput == 'file') {
    //TODO
    //toolsDialog.close()
    //showNameFileDialog()
  }
  else {

    var data = {
        cmd: 'EXEC_PLUGIN',
        param1: toolToExecute,
        param2: inputForPluginToExecute,
        param3: '',
        param4: inputParams,
        param5: getNotesNameLang()
    }
    needToSendMsg = true
    sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {

      var pluginExecutedOnServer = false

      if(statusTxt.startsWith("KO")) {
        logError(responseTxt)
        if(statusTxt.startsWith("KO_")) {
          var installationCmd = statusTxt.substring(3, statusTxt.length)
          var alertMsg = "The selected plugin requires to install additional resources: "
          alertMsg = alertMsg + "\n" + installationCmd + "\n" + "Proceed? "
          var proceed = confirm(alertMsg)

          if (!proceed) {
            executingToolInProgress = false
            exectoolbtn.style = exectoolbtndefaultstyle
            txtEditor().focus()
            return
          }
          var data2 = {
              cmd: 'EXEC_CMD',
              param1: installationCmd.trim()
          }

          sendMsgToSpontiniServer(data2, function(statusTxt2, responseTxt2) {
            if(statusTxt2.startsWith("KO")) {
              alert("Error during the insallation process\n" +
                    "Check details on the browser's console")
              logError(responseTxt2)
            }
            else {
              alert("The plugin has been installed!\nPlease execute it again")
              logSuccess(responseTxt2)
            }
            executingToolInProgress = false
            exectoolbtn.style = exectoolbtndefaultstyle
          })
        }
        else {
          alert("Error while executing selected plugin\n" +
                "Check details on the browser's console")
          executingToolInProgress = false
          exectoolbtn.style = exectoolbtndefaultstyle
        }
      }
      else {

        var pluginExecutedOnServer = true

        if (showResult == 'alert') {
          alert("Done!")
          logSuccess(responseTxt)
        }
        else if (showResult == 'log') {
          logSuccess(responseTxt)
        }

        if (pluginOutput == 'document') {
          setLyFileContent(responseTxt)
          updatePointAndClickPositions(true)
        }
        else if (pluginOutput == 'selection') {
          replaceCurrentSelection(responseTxt, "around")
          updatePointAndClickPositions(true)

        }
        else if (pluginOutput == 'after-selection') {
            var cursor = txtEditor().getCursor()
            replaceCurrentSelection("", "around")
            insertTextAtCursor(selTxt + "\n" + responseTxt)
            updatePointAndClickPositions(true)
        }
        else if (pluginOutput == 'block') {
            blockNum = getBlockNum(selTxt)
            if (blockNum != null) {
              replaceBlockContent(blockNum, responseTxt)
              updatePointAndClickPositions(true)
            }
        }
        toolToExecute = ''
        inputParamsPrompt = 'false'

      }

      if (pluginExecutedOnServer) {
          executingToolInProgress = false
          exectoolbtn.style = exectoolbtndefaultstyle
          txtEditor().focus()
      }

    })
  }

}

function sendMsgToSpontiniServer(data, onResponseReceived, showAlertOnError = true) {

  var request = new Request(serverProtocolAndHost+"/cgi", {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    origin: serverProtocolAndHost
  })
  fetch(request).then(response => response.json())
  .then(data => onResponseReceived(data.status, data.content))
  .catch(function(error) {
      if (showAlertOnError)
        alert("Error while connecting to SpontiniServer. \n" +
              "Check details on the web console")
    })
}

function deleteLyFile() {

  if ((fileNameWPath != null) && (fileNameWPath != "") && (fileNameWPath != "untitled") ) {
    var result = confirm("Are you sure?")
    if (result) {
      var data = {
        cmd: 'DELETE',
        param1: fileNameWPath
      }

      sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
        createNewLilypondDoc()
      })
    }
  }
}

function downloadFile(filetype) {

  if ((fileNameWPath != null) && (
    fileNameWPath != "") &&
    (fileNameWPath != "untitled") ) {
    filename = fileNameWPath.replace("ly", filetype)
  }
  else
    return

  var data = {
    cmd: 'FILE_EXISTS',
    param1: filename
  }

  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (responseTxt == "YES") {
      var src = serverProtocolAndHost+"/files?filename="+filename
      fetch(src)
        .then(resp => resp.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }).catch(() => alert("Can't find the requested file"))
    }
    else
      alert("Can't find the requested file")
  })
}

function createAndDownloadFile(filetype) {

  filename = ""

  if ((fileNameWPath != null) && (
    fileNameWPath != "") &&
    (fileNameWPath != "untitled") ) {
    filename = fileNameWPath
  }
  else
    return

  var data = {
    cmd: 'CREATE_'+filetype.toUpperCase(),
    param1: filename
  }

  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (statusTxt == "OK") {
      downloadFile(filetype)
    }
  })
}

function setFileNameWPathAndUpdateLabel(val) {
  fileNameWPath = val
  document.getElementById("lyfilename").innerHTML = val
  document.getElementById("lyfilename").title = val
}

function getNotesNameLang() {
  const regex = /\\language *"[^"]+"/g;
  ret = "nederlands"
  let m;
  while ((m = regex.exec(getLyFileContent())) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
          ret = match.replace("\\language", "").trim()
      })
  }
  ret = replaceAll(ret, "\"", "").trim()
  return ret
}

//TODO remove the last parameter and refactor function
function loadScorePage(scoreName, wantedPageNum, zoomOption) {

  var newFile = ''

  if (baseCtx.numPages == 0) {
    baseCtx.pagenumtxt.value = 1
    baseCtx.pagenumtxt.setAttribute("max", 1)
    setDefaultSVGImage()
    return
  }
  else if (baseCtx.numPages == 1)
    newFile = scoreName+".svg"
  else
    newFile = scoreName+"-"+wantedPageNum+".svg"

  var data = {
    cmd: 'SVG_CONTENT',
    param1: newFile
  }

  setSVGReadOnly(true)

  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
  if (statusTxt == "OK") {

      currFile = baseCtx.document.getElementById("lyfilename").innerHTML.replace(".ly", "")
      baseCtx.pagenumtxt.value = wantedPageNum

      var prevWidth = -1
      var prevHeight = -1
      var prevScrollLeft = 0
      var prevScrollTop = 0
      if (rootSVGNode()) {
        prevWidth = svgOrigWidth()
        prevHeight = svgOrigHeight()
        var graphscorepanel = document.getElementById("graphscorepanel")
        prevScrollLeft = graphscorepanel.scrollLeft
        prevScrollTop = graphscorepanel.scrollTop
      }

      var prevZoom = null
      var prevPan = null
      if (svgContainerCtx.panzoomInstance != null) {
        prevZoom = svgContainerCtx.panzoomInstance.getScale()
        prevPan = svgContainerCtx.panzoomInstance.getPan()
      }

      initSVGEditableStuff(responseTxt)

      setTimeout(() => {
        if (zoomOption == "FIT_TO_PANEL")
          fitSVGToPanel()
        else if (zoomOption == "SAME_DIMENSION_SAME_PAN") {
          setTimeout(() => { svgContainerCtx.panzoomInstance.zoom(prevZoom) })
          setTimeout(() => { svgContainerCtx.panzoomInstance.pan(prevPan.x, prevPan.y) })
          setTimeout(() => {
            svgContainerCtx.graphscorepanel.scrollLeft = prevScrollLeft
            svgContainerCtx.graphscorepanel.scrollTop = prevScrollTop
          })
        }
      })
    }
  })

  //window.location.href = url;

}

function goToPage(wantedPageNum) {

  if (fileNameWPath == "untitled" || fileNameWPath == modFileLabelToken + "untitled")
    return

  if (wantedPageNum == '')
    return

  scoreName = fileNameWPath.replace('.ly', '')
  pageNum = wantedPageNum
  svgContainerCtx.loadScorePage(scoreName, wantedPageNum, "SAME_DIMENSION_SAME_PAN")
}

function toggleSymbolsPanel() {

  if (symbolsbtn.getAttribute('toggle') == 'false') {
    symbolsbtn.setAttribute('toggle', 'true')
    resizeWidgets()
  }
  else {
    symbolsbtn.setAttribute('toggle', 'false')
    resizeWidgets()
  }

  txtEditor().focus()
}

function compileLyFile(btn) {

  defaultStyle = btn.style

  if ((fileNameWPath == null) || (fileNameWPath == "") || (fileNameWPath == "untitled")) {
    alert("Save the file before engraving")
    return
  }

  if (btn.getAttribute('locked') == 'false') {
    btn.setAttribute('locked', 'true')
    btn.style.background = waitButtonBackground
    btn.style.color = waitButtonColor
    btn.style.cursor = 'progress'

    fileName = fileNameWPath.split("/").pop()

    if (fileName.startsWith(modFileLabelToken))
      fileName = fileName.substring(modFileLabelToken.length)

    data = {
      cmd: 'COMPILE',
      param1: fileName,
      param2: getLyFileContent()
    }

    var startDate = new Date()
    var startSeconds = startDate.getTime()
    setSVGReadOnly(true)

    sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {

      if(statusTxt.startsWith("OK")) {
        numPages = Number(statusTxt.split('_')[1])
        //TODO move this and similars into loadScorePage()
        pagenumtxt.setAttribute("max", numPages)

        var svgDisplayOpt = "SAME_DIMENSION_SAME_PAN"
        var defaultimg = document.getElementById("defaultimg")
        if (defaultimg.style.display != "none")
          svgDisplayOpt = "FIT_TO_PANEL"

        svgContainerCtx.loadScorePage(fileName.replace('.ly',''), pageNum, svgDisplayOpt)

        prepareMidiPlayer(fileName.replace('.ly','.midi'))
        var endDate = new Date();
        var endSeconds = endDate.getTime()

        logSuccess(responseTxt)
        logInfo("Time required for compiling: " + (endSeconds - startSeconds)/1000 + " seconds." )
      }
      else {

        if (responseTxt.includes("lilypondnotfound")) {
          err = "Lilypond could not be executed!\n" +
                "Verify that it is correctly installed and check or configure\n" +
                "its installation on the SpontiniServer window"
          alert(err)
          logError(err)
        }
        else {
          alert("Error while compiling input file. \n" +
              "Check details on the browser's console")
          logError(responseTxt)
        }
      }
      btn.style = defaultStyle
      btn.setAttribute('locked', 'false')

      writtenLyfilename = document.getElementById("lyfilename").innerHTML
      if (writtenLyfilename.startsWith(modFileLabelToken))
        writtenLyfilename = writtenLyfilename.substring(modFileLabelToken.length)
      setFileNameWPathAndUpdateLabel(writtenLyfilename)
      docHasBeenModified = false
      txtEditor().markClean()
      txtEditor().focus()
    })
  }
}

function isNumber(evt) {
  evt = (evt) ? evt : window.event
  var charCode = (evt.which) ? evt.which : evt.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
  }
  return true
}

function setDragBarPos(pixels) {

  //TODO Define and use string constants, not numbers!!
  if (editorLayout == 2 || editorLayout == 4) {
    bodyHeight = document.getElementById("spontinibody").clientHeight
    spontiniheader = document.getElementById("spontiniheader")
    headerHeight = spontiniheader.clientHeight
    symbolscontainer = document.getElementById("symbolscontainer")

    upperElement = "textscorepanel"
    lowerElement = "graphscorepanel"

    if (editorLayout == 4) {
      upperElement = "graphscorepanel"
      lowerElement = "textscorepanel"
    }

    if (window.getComputedStyle(symbolscontainer).height.includes("px") && editorLayout == 2) {
      symbolscontainerComputedHeight = Number(window.getComputedStyle(symbolscontainer).height.replace("px", ""))
      headerComputedHeight = Number(window.getComputedStyle(spontiniheader).height.replace("px", ""))
      if (pixels <= (symbolscontainerComputedHeight+headerComputedHeight))
        pixels = (symbolscontainerComputedHeight+headerComputedHeight)
    }

    upperElementHeight = 100 * (pixels - headerHeight) / bodyHeight
    document.getElementById(upperElement).style.height = upperElementHeight + '%'
    lowerElementHeight =  100 - upperElementHeight
    document.getElementById(lowerElement).style.height = lowerElementHeight + '%'

  }
  else {

    leftElement = "textscorepanel"
    rightElement = "graphscorepanel"

    if (editorLayout == 3) {
      leftElement = "graphscorepanel"
      rightElement = "textscorepanel"
    }

    totalWidth = window.getComputedStyle(document.body).width.replace("px", "")
    leftElementWidth = 100 * pixels / totalWidth
    document.getElementById(leftElement).style.width = leftElementWidth + '%'
    rightElementWidth = 100 - leftElementWidth
    document.getElementById(rightElement).style.width = rightElementWidth + '%'
  }

  resizeWidgets()

}

function getDragBarPos() {

  textscorepanelWidth = document.getElementById('textscorepanel').style.width
  if (!textscorepanelWidth)
    return "default"
  else
    return textscorepanelWidth.replace('%', '')

}

function moveDragBar(e) {

  if (editorLayout == 2 || editorLayout == 4) {
    setDragBarPos(e.pageY + 2)
  }
  else
    setDragBarPos(e.pageX + 2)

}

//TODO make a better tuning
function resizeWidgets() {

  var docElem = document.documentElement
  var headerHeight = Math.trunc(headerHeightPercentage * 1080 / docElem.clientHeight)
  var spontinibodyHeight = 100 - headerHeight
  var header = document.getElementById("spontiniheader")
  var spontinibody = document.getElementById("spontinibody")
  var lilyinputfilecontainer = document.getElementById("lilyinputfilecontainer")
  var textscorepanel = document.getElementById("textscorepanel")
  textscorepanelComputedHeight = window.getComputedStyle(textscorepanel).height.replace("px", "")
  spontinibodyComputedHeight = window.getComputedStyle(spontinibody).height.replace("px", "")

  header.style.height = headerHeight + "%"
  spontinibody.style.height = spontinibodyHeight + "%"

  var symbolsheight = Math.trunc(3 * 1080 / docElem.clientHeight)

  var symbolsheight = 0
  var codemirrorheight = 100
  var symbolsContainerDisplay = 'block'

  if (symbolsbtn.getAttribute('toggle') == 'true') {
    defaultSymbolsBtnStyle = symbolsbtn.style
    symbolsbtn.setAttribute('toggle', 'true')
    symbolsbtn.style.background = toggleButtonSecondBackground
    symbolsheight = Math.trunc(12 * 1080 / textscorepanelComputedHeight)
    codemirrorheight = 100 - symbolsheight
  }
  else {
    symbolsbtn.style = defaultSymbolsBtnStyle
    symbolsheight = 0
    codemirrorheight = 100
    symbolsContainerDisplay = 'none'
  }

  var symbolscontainer = document.getElementById("symbolscontainer")
  lilyinputfilecontainer.style.height = codemirrorheight + "%"
  symbolscontainer.style.height = symbolsheight + "%"
  symbolscontainer.style.display = symbolsContainerDisplay

}

function setLayout(wantedLayout) {

  spontinibody = document.getElementById("spontinibody")
  dragbar = document.getElementById("dragbar")
  graphscorepanel = document.getElementById("graphscorepanel")
  textscorepanel = document.getElementById("textscorepanel")
  dialogs = document.getElementById("dialogs")

  // not yet set with js
  //TODO need shorter code
  if (textscorepanel.style.height.trim() == '' && textscorepanel.style.width.trim() == '') {
    if (wantedLayout == 1 || wantedLayout == 3) {
      graphscorepanel.style.width = "100%"
      graphscorepanel.style.height = "50%"
      textscorepanel.style.width = "100%"
      textscorepanel.style.height = "50%"
    }
    else {
      graphscorepanel.style.width = "50%"
      graphscorepanel.style.height = "100%"
      textscorepanel.style.width = "50%"
      textscorepanel.style.height = "100%"
    }
  }

  if (wantedLayout == 2 || wantedLayout == 4) {
    dragbar.style.height = dragbarThickness
    dragbar.style.width = "100%"
    dragbar.style.cursor = "row-resize"
    var prevWidth = graphscorepanel.style.width
    var prevHeight = graphscorepanel.style.height
    graphscorepanel.style.height = prevWidth
    graphscorepanel.style.width = prevHeight
    prevWidth = textscorepanel.style.width
    prevHeight = textscorepanel.style.height
    textscorepanel.style.height = prevWidth
    textscorepanel.style.width = prevHeight
  }
  else if (wantedLayout == 1 || wantedLayout == 3) {
    dragbar.style.width = dragbarThickness
    dragbar.style.height = "100%"
    dragbar.style.cursor = "col-resize"
    var prevWidth = graphscorepanel.style.width
    var prevHeight = graphscorepanel.style.height
    graphscorepanel.style.height = prevWidth
    graphscorepanel.style.width = prevHeight
    prevWidth = textscorepanel.style.width
    prevHeight = textscorepanel.style.height
    textscorepanel.style.height = prevWidth
    textscorepanel.style.width = prevHeight
  }
  else {

    undockScore()

    if (editorLayout == 1 || editorLayout == 3) {
      graphscorepanel.style.height = "100%"
      graphscorepanel.style.width = "0%"
    }
    else {
      graphscorepanel.style.height = "0%"
      graphscorepanel.style.width = "100%"
    }

    textscorepanel.style.height = "100%"
    textscorepanel.style.width = "100%"
  }

  if (wantedLayout == 1 || ((wantedLayout == 5) && (editorLayout == 1)))
    spontinibody.style.flexDirection = "row"
  else if (wantedLayout == 2 || ((wantedLayout == 5) && (editorLayout == 2)))
    spontinibody.style.flexDirection = "column"
  else if (wantedLayout == 3 || ((wantedLayout == 5) && (editorLayout == 3)))
    spontinibody.style.flexDirection = "row-reverse"
  else if (wantedLayout == 4 || ((wantedLayout == 5) && (editorLayout == 5)))
    spontinibody.style.flexDirection = "column-reverse"

  if (wantedLayout == 2 ||
      wantedLayout == 3 ||
     ((wantedLayout == 5) && (editorLayout == 2)) ||
     ((wantedLayout == 5) && (editorLayout == 3)))
    spontinibody.insertBefore(dialogs, textscorepanel)
  else if (wantedLayout == 1 ||
           wantedLayout == 4 ||
          ((wantedLayout == 5) && (editorLayout == 1)) ||
          ((wantedLayout == 5) && (editorLayout == 4)))
    spontinibody.insertBefore(dialogs, graphscorepanel.nextSibling)

  editorLayout = wantedLayout
  if (wantedLayout != 5) {
    resizeWidgets()
    fitSVGToPanel()
  }

  txtEditor().refresh()
}

function addSymbol(longsym, shortsym, afterOrBefore) {

  shortsym = replaceAll(shortsym, 'DQUOTES', '"')
  longsym = replaceAll(longsym, 'DQUOTES', '"')
  shortsym = replaceAll(shortsym, 'SQUOTE', '\'')
  longsym = replaceAll(longsym, 'SQUOTE', '\'')

  var shortHandChecked = document.getElementById('shorthand').checked
  var directionTkn = document.getElementById('symbolsdirection').value

  var symToWrite = longsym

  if (shortsym.trim() != '' && shortHandChecked)
    symToWrite = shortsym

  if (afterOrBefore == 'a') {
    symToWrite = directionTkn + symToWrite
    txtEditor().setCursor({line: emptyCharOfLastSelectedMusic[0], ch: emptyCharOfLastSelectedMusic[1]})
    insertTextAtCursor(symToWrite)
  }
  else if (afterOrBefore == 'm') {
    if (symToWrite.includes('afterGrace')) {
      var oldCursor = txtEditor().getCursor()
      txtEditor().setCursor({line: emptyCharOfLastSelectedMusic[0], ch: emptyCharOfLastSelectedMusic[1]})
      insertTextAtCursor('{}')
      txtEditor().setCursor(oldCursor)
      insertTextAtCursor(symToWrite)
    }
  }
  else {
    insertTextAtCursor(symToWrite)
  }
  txtEditor().focus()
}

function showSymbolsTab(evt) {

  var i, tabcontent, tablinks;

  tabcontent = document.getElementById("symbolscontent");
  var selContent = symbolserts.find(function (content) {
    return content.category == evt.currentTarget.id.replace("symbols","");
  })

  var innerContenStr = ""
  for (var i = 0; i < selContent.elements.length; i++) {
    if (selContent.elements[i][4].trim() == "")
      innerContenStr += "<span></span>"
    else
      innerContenStr += "<span title=\""+selContent.elements[i][0]+
      "\" class=\"symbolsspan\">"+
      "<img width='100%' height='100%' onclick=\"addSymbol('"+
      selContent.elements[i][1]+"','"+selContent.elements[i][2]+"','"+selContent.elements[i][3]+
      "')\" src='images/symbols/"+selContent.elements[i][4]+"' ></span>"
  }

  tabcontent.innerHTML = innerContenStr

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  //document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";

  txtEditor().focus()
}

function createNewLilypondDoc(skipMidi = false) {

  setLyFileContent("", true)
  svgContainerCtx.setDefaultSVGImage()
  docHasBeenModified = false
  txtEditor().markClean()
  setFileNameWPathAndUpdateLabel("untitled")
  pagenumtxt.value = 1
  pagenumtxt.setAttribute("max", 1)
  if (!skipMidi)
    prepareMidiPlayer('')
  txtEditor().clearHistory()
  txtEditor().focus()

  // Notification (no Zneed to check)
  var data = {
    cmd: 'NEW',
    param1: ''
  }
  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
  }, false)

  url = window.location.protocol + '//' + location.host + location.pathname
  window.history.pushState({}, '', url)

}

function generateRandomString(length) {

  chars ='ABCDEFGHIJKLMNOPQRSTUVWXYZ'+
          'abcdefghijklmnopqrstuvwxyz'+
          '0123456789'
  let res = ''
  for ( let i = 0; i < length; i++ ) {
    res += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return res

}

function saveLyFile(fork = false) {

  extensionForFileToSave = "ly"
  contentForFileToSave = "FULL_DOCUMENT"

  var fileName = ""

  if (fork) {
    fileName = "FORK_"+generateRandomString(5)+".ly"
  }
  else if (tmpFilenameToSave != "") {
    fileName = tmpFilenameToSave
    tmpFilenameToSave = ""
  }
  else
    fileName = fileNameWPath.split("/").pop()

  data = null

  if (fork)
    data = {
      cmd: 'FORK',
      param1: fileName,
      param2: getLyFileContent(),
      param3: fileNameWPath.split("/").pop()
    }
  else
    data = {
      cmd: 'SAVE',
      param1: fileName,
      param2: getLyFileContent()
    }

  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    setFileNameWPathAndUpdateLabel(fileName)
    url = window.location.protocol + '//' + location.host +
          location.pathname + "?doc="+fileName
    window.history.pushState({}, '', url)
    window.location.protocol + '//' + location.host + location.pathname

    prepareMidiPlayer(fileName.replace(".ly", ".midi"))
    //TODO remove "docHasBeenModified" everywhere and use only txtEditor().isClean()
    docHasBeenModified = false
    txtEditor().markClean()
    execOperations(op2ToExec)
    if (fork)
      alert("LINK TO DOCUMENT (select it with the mouse and copy with CTRL+C):\n"+
            window.location+"?doc="+fileName)
  })

}

function execOperations(op1, op2 = "", ignoreMods = false) {

  op1ToExec = op1
  op2ToExec = op2

  var checkModFile = !ignoreMods && !txtEditor().isClean()

  lyfilename = document.getElementById("lyfilename").innerHTML
  if (lyfilename.startsWith(modFileLabelToken))
    lyfilename = lyfilename.substring(modFileLabelToken.length)

  label = "The document \"" + lyfilename + "\" has been modified.<br />"+
          "Do you want to save your changes or discard them?"
  modfilelabel.innerHTML = label

  if (op1 == "OPEN_LY_FILE") {
    if (checkModFile) {
      openDialogAndSetReadonly(modfiledialog)
    }
    else {
      var data = {
        cmd: 'FILE_LIST',
        param1: ""
      }
      sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
      if (statusTxt == "OK") {
          var sepTkn = ";;::;;"

          if (responseTxt.trim() == '') {
            alert("There are not Lilypond files in the current workspace!")
            return
          }

          var fileList = responseTxt.split(sepTkn)
          var selectOptions = "<optgroup label=''><option hidden selected='selected' >SELECT LILYPOND FILE</option>"
          for (var i = 0; i < fileList.length; i++)
            selectOptions += "<option>"+fileList[i]+"</option>"
          selectOptions += "</optgroup><optgroup label=''></optgroup>"
          //if (fileList.length > 0)
          //  doopenbtn.setAttribute('value', fileList[0])

          lyfileselect.innerHTML = selectOptions
          openDialogAndSetReadonly(opendialog)
        }
      })
    }
  }
  if (op1 == "NEW_LY_FILE") {
    if (checkModFile) {
      openDialogAndSetReadonly(modfiledialog)
    }
    else {
      createNewLilypondDoc()
    }
  }
  else if (op1 == "FORK_LY_FILE") {
    var fork = true
    saveLyFile(fork)
  }
  else if (op1 == "SAVE_LY_FILE") {
    if ((lyfilename == "untitled" || lyfilename == "") && tmpFilenameToSave == "") {
      openDialogAndSetReadonly(namefiledialog)
    }
    else {
      saveLyFile()
    }
  }
  else if (op1 == "SAVE_LY_FILE_AS") {
    openDialogAndSetReadonly(namefiledialog)
  }
  else if (op1 == "DELETE_LY_FILE") {
    deleteLyFile()
  }
  else if (op1 == "DOWNLOAD_MIDI") {
    downloadFile("midi")
  }
  else if (op1 == "DOWNLOAD_PDF") {
    createAndDownloadFile("pdf")
  }
  else if (op1 == "DOWNLOAD_ZIP") {
    createAndDownloadFile("zip")
  }

}

function openDialogAndSetReadonly(dialog) {

  if (!typeof dialog.show === "function")
    return

  closeAllDialogsAndUnsetReadonly()
  txtEditor().setOption("readOnly", true)
  dialog.show()
}

function closeAllDialogsAndUnsetReadonly() {
  //FIXME?? Is it safe to close already closed dialogs?
  closeDialogAndUnsetReadonly(opendialog)
  closeDialogAndUnsetReadonly(namefiledialog)
  closeDialogAndUnsetReadonly(modfiledialog)
  closeDialogAndUnsetReadonly(toolsdialog)
}

function closeDialogAndUnsetReadonly(dialog) {
  txtEditor().setOption("readOnly", false)
  dialog.close()
}

function openLilypondDoc(val, dialog = null) {

  var data = {
    cmd: 'LY_CONTENT',
    param1: val
  }

  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (statusTxt == "OK") {

      setLyFileContent(responseTxt, true)
      setFileNameWPathAndUpdateLabel(val)
      txtEditor().clearHistory()
      docHasBeenModified = false
      txtEditor().markClean()
      var data2 = {
        cmd: 'NUM_SVG_PAGES',
        param1: val
      }

      sendMsgToSpontiniServer(data2, function(statusTxt2, responseTxt2) {
        if (statusTxt2 == "OK") {

          numPages = Number(responseTxt2)
          pagenumtxt.setAttribute("max", numPages)
          svgContainerCtx.loadScorePage(val.replace('.ly',''), 1, "FIT_TO_PANEL")
          prepareMidiPlayer(val.replace('.ly','.midi'))
          //setFileNameWPathAndUpdateLabel(val)
          txtEditor().focus()
          url = window.location.protocol + '//' + location.host +
                location.pathname + "?doc="+val
          window.history.pushState({}, '', url)
        }

      })

    }

    if (dialog != null)
      closeDialogAndUnsetReadonly(dialog)
  })
}

var op1ToExec = ""
var op2ToExec = ""
var tmpFilenameToSave = ""

function addEventListenersToWidgets() {

  var data = {
    cmd: 'GET_CONFIG_PARAM',
    param1: "fork-access-only"
  }
  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (responseTxt == "yes") {
      document.getElementById("openopt").style.display = "none"
      document.getElementById("deleteopt").style.display = "none"
    }
  }, false)

  data = {
    cmd: 'GET_CONFIG_PARAM',
    param1: "cairosvg-enabled"
  }
  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (responseTxt == "no") {
      document.getElementById("downloadpdf").style.display = "none"
    }
  }, false)

  data = {
    cmd: 'GET_CONFIG_PARAM',
    param1: "can-config-from-non-localhost"
  }
  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (responseTxt == "yes") {
      canConfigFromNonLocalhost = true
    }
  }, false)

  document.body.onresize = resizeWidgets

  //TODO Move all these to global (very easy)
  var filemenu = document.getElementById('filemenu')

  var symbolsbtn = document.getElementById('symbolsbtn')
  var toolsbtn = document.getElementById('toolsbtn')
  var compilebtn = document.getElementById('compilebtn')

  var opendialog = document.getElementById('opendialog')
  var cancelopenbtn = document.getElementById('cancelopenbtn');
  var lyfileselect = document.getElementById('lyfileselect')
  var doopenbtn = document.getElementById('doopenbtn')

  var namefiledialog = document.getElementById('namefiledialog')
  var donamefilebtn = document.getElementById('donamefilebtn')
  var cancelnamefilebtn = document.getElementById('cancelnamefilebtn')

  var modfiledialog = document.getElementById('modfiledialog')
  var modfilelabel = document.getElementById('modfilelabel')
  var cancelmodfilebtn = document.getElementById('cancelmodfilebtn')
  var discardmodfilebtn = document.getElementById('discardmodfilebtn')
  var savemodfilebtn = document.getElementById('savemodfilebtn')

  var toolsdialog = document.getElementById('toolsdialog')
  var toolselect = document.getElementById('toolselect')
  var exectoolbtn = document.getElementById('exectoolbtn')
  var canceltoolbtn = document.getElementById('canceltoolbtn')

  var symbolscommons = document.getElementById('symbolscommons')
  var symbolsbarlines = document.getElementById('symbolsbarlines')
  var symbolsother = document.getElementById('symbolsother')

  var prevpagebtn = document.getElementById('prevpagebtn')
  var nextpagebtn = document.getElementById('nextpagebtn')

  var rotatelbtn = document.getElementById('rotatelbtn')
  var rotaterbtn = document.getElementById('rotaterbtn')

  var ptzbtn = document.getElementById('ptzbtn')
  var onetoonebtn = document.getElementById('onetoonebtn')
  var fittopanelbtn = document.getElementById('fittopanelbtn')
  var undockscorebtn = document.getElementById('undockscorebtn')

  ////////////////////
  // FILE MENU
  ////////////////////

  filemenu.addEventListener('change', function () {
    var val = filemenu.value
    filemenu.value = filemenu.options[0].value
    execOperations(val)
  })
  filemenu.value = filemenu.options[0].value

  ////////////////////
  // SYMBOLS BTN
  ////////////////////

  symbolsbtn.addEventListener('click', function () { toggleSymbolsPanel() })

  ////////////////////
  // TOOLS BTN
  ////////////////////

  toolsbtn.addEventListener('click', function onOpen() {

    if (!typeof toolsdialog.show === "function")
      return

    // Builtin tools
    var selectOptions = "<optgroup label=''>"
    selectOptions += "<option hidden selected='selected' >SELECT A TOOL</option>"
    selectOptions += "<option value='genericvarsblockmarker'>Add "+genericVarsBlockMarker+" block</option>"
    selectOptions += "<option value='jsblockmarker'>Add "+jsBlockMarker+" block</option>"
    selectOptions += "<option value='markwithvariable'>Mark with variable/function</option>"
    /*
    if (canConfigFromNonLocalhost ||
        location.host.includes("localhost") ||
        location.host.includes("127.0.0.1"))
    selectOptions += "<option value='setconfigparam'>Set config param</option>"
    */
    selectOptions += "<option value='setwebmidisoundfont'>Set web-MIDI soundfont</option>"
    selectOptions += "<option value='togglesvgscrollbars'>Toggle SVG scrollbars</option>"
    selectOptions += "</optgroup>"
    selectOptions += "<optgroup label=''>"
    selectOptions += "</optgroup>"
    selectOptions += "<optgroup label='JSSVG'>"
    selectOptions += "<option value='jstweak'>\\jsTweak</option>"
    selectOptions += "<option value='jsonceoverride'>\\jsOnceOverride</option>"
    selectOptions += "<option value='jsosopadder'>\\jsOSOPadder</option>"
    selectOptions += "<option value='jspadder'>\\jsPadder</option>"
    selectOptions += "</optgroup>"
    toolselect.innerHTML  = ""
    toolselect.innerHTML = toolselect.innerHTML + selectOptions
    exectoolbtn.value = toolselect.options[0].value

    var data = {
      cmd: 'PLUGINS',
      param1: ""
    }
    sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (statusTxt == "OK") {

        selectOptions = ""
        var pluginsListEmpty = true

        if (responseTxt.trim() != '') {
          var pluginsList = responseTxt.trim().split(pluginsSepTkn1)
          for (var i = 0; i < pluginsList.length; i++) {
            var displayedName = pluginsList[i].split(pluginsSepTkn2)[0]
            var toolInput = pluginsList[i].split(pluginsSepTkn2)[1]
            var toolOutput = pluginsList[i].split(pluginsSepTkn2)[2]
            var cmd = escape(pluginsList[i].split(pluginsSepTkn2)[3])
            var outExt = pluginsList[i].split(pluginsSepTkn2)[4]
            var inputParamsPrompt = escape(pluginsList[i].split(pluginsSepTkn2)[5])
            var showResult = escape(pluginsList[i].split(pluginsSepTkn2)[6])
            var val = escape(displayedName) + pluginsSepTkn2 + toolInput + pluginsSepTkn2
            val = val + toolOutput + pluginsSepTkn2 + cmd + pluginsSepTkn2
            val = val + outExt + pluginsSepTkn2 + inputParamsPrompt + pluginsSepTkn2 + showResult

            var pip3Missing = false
            var venvMissing = false
            warnMsg = ""
            if (pluginsList.length >= 8) {
              for (var q = 7; q < pluginsList.length; q++) {
                if (pluginsList[i].split(pluginsSepTkn2)[q] == 'PIP3_MISSING') {
                  pip3Missing = true
                }
                if (pluginsList[i].split(pluginsSepTkn2)[q] == 'VENV_MISSING')
                  venvMissing = true
              }
            }

            if (pip3Missing)
              warnMsg += "Pip3 not found/installed. "
            if (venvMissing)
              warnMsg += "SpontiniServer could not find/create a virtualv env. "

            if (!pip3Missing && !venvMissing) {
              pluginsListEmpty = false
              selectOptions += "<option value=\""+val+"\">"+displayedName+"</option>"
            }
            if (pip3Missing || venvMissing) {
              warnMsg = "The '"+displayedName+"' tool has been disabled: " + warnMsg
              warnMsg = warnMsg + "\nCheck SpontiniServer's log for details and install required packaged/modules"
              logWarning(warnMsg)
            }
          }
        }

        if (!pluginsListEmpty) {
          toolselect.innerHTML = toolselect.innerHTML + "<optgroup label=''></optgroup>" +
                                 "<optgroup label='PLUGINS'>" + selectOptions + "</optgroup>" +
                                 "<optgroup label=''></optgroup>"
        }
      }
    })
    closeAllDialogsAndUnsetReadonly()
    toolsdialog.show()
  })

  ////////////////////
  // COMPILE BTN
  ////////////////////

  compilebtn.addEventListener('click', function () { compileLyFile(this) })

  ////////////////////
  // OPEN DIALOG
  ////////////////////

  lyfileselect.addEventListener('change', function onSelect(e) {
    doopenbtn.value = lyfileselect.value
  })

  cancelopenbtn.addEventListener('click', function (ev) {
    closeDialogAndUnsetReadonly(opendialog)
    txtEditor().focus()
  })

  doopenbtn.addEventListener('click', function (ev) {

    ev.preventDefault()
    var val = this.getAttribute("value")
    if (val != "") {
      openLilypondDoc(val, opendialog)
    }
  })

  ////////////////////
  // NAME FILE DIALOG
  ////////////////////

  cancelnamefilebtn.addEventListener('click',
  function (ev) {
    document.getElementById("filenametxtinput").value = ''
    closeDialogAndUnsetReadonly(namefiledialog)
    txtEditor().focus()
  })

  donamefilebtn.addEventListener('click', function (ev) {

    ev.preventDefault()
    var outfileName =  document.getElementById("filenametxtinput").value

    var goodFileName = true
    var msgForFilename = ''

    if (extensionForFileToSave != '_none_' && !outfileName.endsWith("." + extensionForFileToSave)) {
      goodFileName = false
      msgForFilename = "Please give \"." + extensionForFileToSave + "\" extension to the file name"
    }
    else if (outfileName.replace("." + extensionForFileToSave, "").trim() == "") {
      goodFileName = false
      msgForFilename = "Please give a file name"
    }

    if (!goodFileName) {
      alert(msgForFilename)
      return
    }

    var data0 = {
      cmd: 'FILE_EXISTS',
      param1: outfileName
    }

    sendMsgToSpontiniServer(data0, function(statusTxt0, responseTxt0) {

      if (responseTxt0 == "YES") {
        if (!confirm("File exists. Overwrite?"))
          return
      }
      tmpFilenameToSave = outfileName
      execOperations("SAVE_LY_FILE", op2ToExec)
      document.getElementById("filenametxtinput").value = ''
      closeDialogAndUnsetReadonly(namefiledialog)
    })
  })

  ////////////////////
  // MOD FILE DIALOG
  ////////////////////

  savemodfilebtn.addEventListener('click', function (ev) {

    closeDialogAndUnsetReadonly(modfiledialog)
    if ((fileNameWPath != null) && (fileNameWPath != "") && (fileNameWPath != "untitled") ) {
      execOperations("SAVE_LY_FILE", op1ToExec)
    }
    else
      execOperations("SAVE_LY_FILE_AS", op1ToExec)

  })

  cancelmodfilebtn.addEventListener('click', function (ev) {

    closeDialogAndUnsetReadonly(modfiledialog)
    txtEditor().focus()

  })

  discardmodfilebtn.addEventListener('click', function (ev) {

    writtenLyfilename = document.getElementById("lyfilename").innerHTML

    closeDialogAndUnsetReadonly(modfiledialog)
    txtEditor().setCursor({line: 0, ch: 0})
    execOperations(op1ToExec, op2ToExec, true)

  })

  ////////////////////
  // TOOLS DIALOG
  ////////////////////

  toolselect.addEventListener('change', function onSelect(e) {
    exectoolbtn.value = toolselect.value;
  })

  canceltoolbtn.addEventListener('click', function (ev) {
    toolsdialog.close()
    txtEditor().focus()
  })

  exectoolbtn.addEventListener('click', function (ev) {
    ev.preventDefault()
    execTool(this.getAttribute("value"), txtEditor)
  })

  ////////////////////
  // SYMS INS WIDGS
  ////////////////////

  symbolscommons.addEventListener('click', function (evt) { showSymbolsTab(evt) })
  symbolsbarlines.addEventListener('click', function (evt) { showSymbolsTab(evt) })
  symbolsother.addEventListener('click', function (evt) { showSymbolsTab(evt) })

  prevpagebtn.addEventListener('click', function () { pageArrowClicked("prev") } )

  nextpagebtn.addEventListener('click', function () { pageArrowClicked("next") } )

  setInputFilter( pagenumtxt , function(value) {

    if (value == '')
      return true

    var isNumber =  /^\d*\.?\d*$/.test(value)
    if (!isNumber)
      return false

    maxPages = Number(pagenumtxt.getAttribute("max"))

    if ((Number(value) == 0) || (Number(value) > maxPages))
      return false
    else
      return true

  })

  rotaterbtn.addEventListener('click', function (ev) {

    if (svgContainerCtx == scorePopup)
      return

    if (editorLayout == 4)
      setLayout(1)
    else {
      setLayout(editorLayout + 1)
    }
  })

  rotatelbtn.addEventListener('click', function (ev) {

    if (svgContainerCtx == scorePopup)
      return

    if (editorLayout == 1)
      setLayout(4)
    else {
      setLayout(editorLayout - 1)
    }
  })

  ptzbtn.addEventListener('click', function (ev) {
    var ptzimg = document.getElementById("ptzimg")
    var panZoomWasOn = panZoomOn()
    if (baseCtx.ptzbtnSelected) {
      ptzimg.style = defaultZoomBtnStyle
    }
    else {
      defaultZoomBtnStyle = ptzimg.style
      ptzimg.style.background = toggleButtonSecondBackground
    }

    baseCtx.ptzbtnSelected = !(baseCtx.ptzbtnSelected)
    if (svgContainerCtx.panzoomInstance == null)
      return

    if (!panZoomWasOn && baseCtx.ptzbtnSelected)
      svgContainerCtx.activatePanZoom()
    else if (!panZoomOn())
      svgContainerCtx.deactivatePanZoom()

  })

  onetoonebtn.addEventListener('click', function (ev) {
      svgContainerCtx.oneToOneZoom()
  })

  fittopanelbtn.addEventListener('click', function (ev) {
      svgContainerCtx.fitSVGToPanel()
  })

  undockscorebtn.addEventListener('click', function (ev) {

    if (!undockscorebtnSelected) {
      setLayout(5)
    }
    else {
      dockScore()
    }

  })

  document.addEventListener('mouseup', function(e) {
    document.removeEventListener('mousemove', moveDragBar)
  })

  document.getElementById('dragbar').addEventListener('mousedown', function(e) {
    e.preventDefault();
    document.addEventListener('mousemove', moveDragBar)
  })

  window.onbeforeunload = function(){
    if (scorePopup != null)
      scorePopup.close()
  }

}

function undockScore() {

  graphscorepanel = document.getElementById("graphscorepanel")
  textscorepanel = document.getElementById("textscorepanel")
  dragbar = document.getElementById("dragbar")
  dragbar.style.display = "none"
  svgPanelWidthBeforeUndock = graphscorepanel.style.width
  svgPanelHeightBeforeUndock = graphscorepanel.style.height
  textScorePanelWidthBeforeUndock = textscorepanel.style.width
  textScorePanelHeightBeforeUndock = textscorepanel.style.height
  undockimg = document.getElementById("undockimg")
  defaultUndockScoreBtnStyle = undockimg.style
  undockimg.style.background = toggleButtonSecondBackground
  popupW = window.getComputedStyle(graphscorepanel).width.replace("px", "")
  popupH = graphscorepanel.offsetHeight
  editorMustClosePopup = true

  var left = window.screenLeft
  var top = window.screenTop

  if (editorLayout == 2) {
    top += (window.innerHeight - popupH)
  }

  var offs = 40

  if (editorLayout == 1) {
    left += (window.outerWidth - popupW)
  }

  if (editorLayout == 1) {
    top -= offs
    left += offs
  }

  if (editorLayout == 2) {
    top += offs
    left -= offs
  }

  if (editorLayout == 3) {
    top -= offs
    left -= offs
  }

  if (editorLayout == 4) {
    top -= offs
    left -= offs
  }

  top = Math.max(0, top)
  left = Math.max(0, left)

  scorePopup = window.open(
    "score-popup.html",
    "DescriptiveWindowName",
    "resizable,scrollbars,width="+popupW+",innerHeight="+popupH+
    ",top="+top+",left="+left
  )
  scorePopup.focus()
  svgContainerCtx = scorePopup
  layoutBeforeUndock = editorLayout
  undockscorebtnSelected = true
}

function dockScore() {

  dragbar = document.getElementById("dragbar")
  dragbar.style.display = "block"
  undockimg = document.getElementById("undockimg")
  undockimg.style = defaultUndockScoreBtnStyle
  if(editorMustClosePopup)
    scorePopup.close()
  svgContainerCtx = this
  graphscorepanel = document.getElementById("graphscorepanel")
  textscorepanel = document.getElementById("textscorepanel")
  graphscorepanel.style.width = svgPanelWidthBeforeUndock
  graphscorepanel.style.height = svgPanelHeightBeforeUndock
  textscorepanel.style.width = textScorePanelWidthBeforeUndock
  textscorepanel.style.height = textScorePanelHeightBeforeUndock
  editorLayout = layoutBeforeUndock
  undockscorebtnSelected = false
  zoomAndCenter()
}

function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup",
   "mousedown", "mouseup", "select",
   "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
    });
  });
}

function pageArrowClicked(dir) {

  oldVal = 0
  if (pagenumtxt.value != '')
    oldVal = Number(pagenumtxt.value)

  maxPages = Number(pagenumtxt.getAttribute("max"))

  if (dir == "next")
    newPage = oldVal + 1
  else
    newPage = oldVal - 1

  if (newPage > maxPages || newPage < 1)
    return

  goToPage(newPage)
}
