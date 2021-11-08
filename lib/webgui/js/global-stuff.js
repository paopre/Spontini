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

// TODO remove this and use codemirror's built-in regex support
const jsSVGRegex = /(?:\\jsShape|\\jsOnceOverride|\\jsOnceOffset|\\jsTweak|\\jsOSOPadder|\\jsPadder) +"[^"]+" +"[^"]+" +#'\((?:(?=([^()]*))\1|\((?:(?=([^()]*))\2|\((?:(?=([^()]*))\3|\((?=([^()]*))\4\))+\))+\))+\)/gm;
var blockIdentifier = "__BLOCK__"
var selectionIdentifier = "%__SELECTION__"
const blockRegex = /%{__BLOCK__[\w-]+%}[\s\S]*?%{%}/g
const blockTknRegex = /%{__BLOCK__[\w-]+%}/g
const blockTknRegex2 = /__BLOCK__[\w-]+/g
var genericVarPrefix = "v"
var jsVarPrefix = "j"
const genericVarRegex = /\$v\d+/gm;
const jsVarRegex = /"j\d+"/gm;
var rootSVGNode = null
//var lyFileContent = document.getElementById('lilyinputfile').textContent
var currGrob = null
var currZoom_ = 1
var lastMemText = ""
var lastCursorPos = 0
var numPages = 1
var pageNum = 1
var crossStaffTableToggle = false
var cstableSelectedTxt = ""
var cstableSelectionStart = 0
var cstableSelectionEnd = 0
var currCrossStaffTableCell = null
var cstSep = '\\CSC'
var additionalBlankLineForCrossStaffTable = ""
var mouseOverMenuObjs = false
var mouseOverSubMenuObjs = false
//TODO: can be removed. Extract them from jsobjs(sub)menu_rect
var lastMenuItemY = 0
var lastMenuItemX = 0
var lastMenuItemWidth = 0
var lastMenuItemHeight = 0
var prevDistsFromRefP = new Map
var subMenuPosition = "RIGHT"
var stavesY = []
var crossStaffTableModified = false
//FIXME? TODO? It seems overkill to compute it
//Will be used only by the staff-padding property!
var staffSymbolThickness = null
var txtEditor_ = null
var fileNameWPath = null
var ctrlStillPressed = false
var canShowMenu = false
var cursorInsidePianoTable = false
var currPressedLine = 0
var prevPianoTableRange = null
var emptyCharOfLastSelectedMusic = [0, 0]
var pointAndClickJustDone = false
var templatesSepTkn = ";;::;;"
var pluginsSepTkn1 = ";;;;;;"
var pluginsSepTkn2 = "-.-.-."
var extensionForFileToSave = "ly"
var contentForFileToSave = "FULL_DOCUMENT"
var inputForToolToExecute = ""
var inputParams = ''
var toolToExecute = ''
var docHasBeenModified = false
var scrollReadyToBeAdjustedIfNecessary = true
var modFileLabelToken = "[*] "
var genericVarsBlockMarker = "__VARS__"
var jsBlockMarker = "__JSSVG__"
var toggleButtonSecondBackground = '#b1d2f2'
var waitButtonBackground = 'yellow'
var waitButtonColor = 'black'
var currTransform = null
var svgWidth_ = 0
var svgHeight_ = 0
var svgViewBox_ = ""
var scorePopup = null
var baseCtx = this
var svgContainerCtx = this
var serverProtocolAndHost = window.location.protocol + "//" + window.location.host
var canConfigFromNonLocalhost = false
var mobileMode = false
var lilypondVersion = ""
var templates = []
var templateStartTkn = "%__TEMPLATESTART__\n"
var currCoordsInSVGUnits = {
  x: 0,
  y: 0
}

var currMouseCoordsOnSVG = {
  x: 0,
  y: 0
}

var isHTML = false

function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

function logError(txt) {
  console.error('%c[ ERROR ]%c '+txt, 'background: red; color: black', '')
}

function logSuccess(txt) {
  console.log('%c[ SUCCESS ]%c '+txt, 'background: #2dc446; color: black', '')
}

function logWarning(txt) {
  console.warn('%c[ WARNING ]%c '+txt, 'background: yellow; color: black', '')
}

function logInfo(txt) {
  console.log('%c[ INFO ]%c '+txt, 'background: cyan; color: black', '')
}

function detectLeftButton(evt) {

  evt = evt || window.event
  if ('buttons' in evt) {
    return evt.buttons == 1
  }
  var button = evt.which || evt.button
  return button == 1

}

function dimToPx(x) {
    var div = document.createElement('div')
    div.style.display = 'block'
    div.style.height = x
    document.body.appendChild(div)
    var px = parseFloat(window.getComputedStyle(div, null).height)
    div.parentNode.removeChild(div)
    return px
}
