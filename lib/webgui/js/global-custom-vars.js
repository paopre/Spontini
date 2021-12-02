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

////////////////////////////
// GLOBAL VARS (USER def)
////////////////////////////

var menuItemHeight = "24px"
var interactiveBarWidth = 0.2
var interactiveBarHeight = 2
var showLineNumbers = true
var highlightActiveLine = true
var osopadderColor = "#6f9ab0"
var editableObjectsColor = "blue"
var forceBlockSelectionInsidePianoTable = true
var headerHeightPercentage = 4
var symbolsheightPercentage = 13
var specialMarkersOnTables = true
var tableSeparatorColor = "dodgerblue" //"#42c2f5"
var dummyTableCellColor = "lightgrey"
var dragbarThickness = "5px";
var pointAndClickBlinkRate = 130 //ms
var pointAndClickDuration = 1500 //ms
var svgPanelBackground = "grey"
var svgOverflow = 'scroll'
var svgScrollbarColor = "darkgrey rgb(230, 230, 230)"
// experimental: big values can cause disproportion with the cursor
var editorFontSize = "12px"
// experimental: set it to true if you experience issues when dragging jssvg texts
var renderSvgTextWithGeometricPrecision = true
var dblClickZoomFactor = 2
var panZoomKeyCodes = [112, 17] //--> F1, ctrl
var zoomOutKeyCodes = [113, 16] //--> F2, shift
var rulerThickness = 0.5
var rulerColor = "blue"
var axesThickness = 0.5
var axesColor = "rgba(0,0,255, 0.4)"

/***** Possible layouts *****

  1 == [TEXT][SVG] (default)

  2 == [TEXT]
       [SVG ]

  3 == [SVG][TEXT]

  4 == [SVG ]
       [TEXT]

  5 == [SVG UNDOCKED]

*****************************/
var editorLayout = 1

// Note: Increase this ONLY if you experience issues with scrolling on the text-editor!
// A warning (but without real issues) about scrolling can be reported by Firefox
// See: https://codemirror.net/doc/manual.html ---> viewportMargin
var viewportMarginCustom = 10

//Keymaps
var tabularTwoStavesPolyKey = "Ctrl-1"
var easyCrossStaffKey = "Ctrl-2"
var completeTableOrTemplateKey = "Ctrl-3"
var addGenericVarsBlockKey = "Ctrl-4"
var replaceWithVarKey = "Ctrl-5"
var jsOSOPadderKey = "Ctrl-6"
var jsPadderKey = "Ctrl-7"
var addJSBlockKey = "Ctrl-8"
var savekey = "Ctrl-S"
var jsTweakKey = "Ctrl-F1"
var jsOnceOverrideKey = "Ctrl-F2"
var toggleSVGScrollbarsKey = "Ctrl-b"
