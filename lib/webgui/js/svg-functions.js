/*
 * Created (28/10/2020) by Paolo-Prete.
 * This file is part of Spontini-Editor project.
 *
 * Spontini-Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later versio"un.
 * Spontini-Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
 */

var zoomFlag = false

//WARNING: use LOWER case!
var managedProps = ['cpts', 'extra-offset', 'extra-offset-y',
                    'outside-staff-padding', 'padding',
                    'pads','positions', 'shorten-pair', 'staff-padding',
                    'x-offset', 'y-offset']

var selectedMenuItem = null
var panzoomInstance = null
var svgOrigWidth_ = null
var svgOrigHeight_ = null
var canZoomOut = false
var zoomKeyPressed = false
var svgReadOnly = false
var rulerOn = false
var staffSpaceForRuler = 1
var svgWidthInOrigUnit = null
var svgHeightInOrigUnit = null
var origUnit = null
var axesPanzoomInstances = [null, null, null, null]

////////////////////////////
// [START] OSOPADDER DEFS
////////////////////////////

function setCommonAttrsForOSOPadderLine (line, parentNode, propName) {

  var gid = parentNode.getAttribute(propName+'-propid')
  line.setAttribute('gid', gid)
  line.setAttribute('editcommand', parentNode.getAttribute('editcommand'))
  line.setAttribute('editableclass', parentNode.getAttribute('editableclass'))
  line.setAttribute('associatedtoprops', propName)
  line.setAttribute('staffspace', parentNode.getAttribute('staffspace'))
  line.setAttribute('y-direction', parentNode.getAttribute('y-direction'))
  line.setAttribute('onmousedown', 'selectOSOPaddable(this)')
  line.setAttribute('onmouseover',
                    'this.setAttributeNS(null, "stroke", "cyan");'+
                    'this.style.cursor = "pointer"')
  line.setAttribute('onmouseout','this.setAttributeNS(null, "stroke", "'+osopadderColor+'")')

}

function initOSOPadder(n1, propName) {

  var gid = n1.getAttribute(propName+'-propid')
  var thickness = Number(n1.getAttribute('thickness'))
  var dir = n1.getAttribute('y-direction')
  var xs = []
  var ys = []
  var topPad = 0
  var bottomPad = 0
  var leftPad = 0
  var rightPad = 0
  var lilySetProp = getLilySetProperty(jsSVGRegex, gid, propName)

  if (lilySetProp && !lilySetProp.includes("#'()")) {

    topPad = +(Number(lilySetProp.split("#\'(")[1].split(" ")[0])).toFixed(3)
    rightPad = +(Number(lilySetProp.split("#\'(")[1].split(" ")[1])).toFixed(3)
    bottomPad = +(Number(lilySetProp.split("#\'(")[1].split(" ")[2])).toFixed(3)
    leftPad = +(Number(lilySetProp.split("#\'(")[1].split(" ")[3].replace(")",
                ""))).toFixed(3)

  }

  markerFound = false

  for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
    if (isOsPadder(n2)) {
      markerFound = true
      for (n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling)
      if (n3.nodeName == 'rect') {
        xs.push(Number(getTranslateCoordsDeprecated(n3)[0]) +
                Number(n3.getAttributeNS(null, "x")))
        ys.push(Number(getTranslateCoordsDeprecated(n3)[1]) +
                Number(n3.getAttributeNS(null, "y")) + thickness)
      }

      // try one level deeper (lilypond 2.22.0 compatibility)
      if (xs.length == 0) {
        for (n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling)
        for (n4 = n3.firstChild; n4 !== null; n4 = n4.nextSibling)
        if (n4.nodeName == 'rect') {
          xs.push(Number(getTranslateCoordsDeprecated(n3)[0]) +
                  Number(n4.getAttributeNS(null, "x")))
          ys.push(Number(getTranslateCoordsDeprecated(n3)[1]) +
                  Number(n4.getAttributeNS(null, "y")) + thickness)
        }
      }

    }
  }

  if (!markerFound)
    return

  xs.sort(sortNumber)
  ys.sort(sortNumber)

  var yBottom = ys[3] - thickness/2
  var yTop = ys[0] - thickness/2
  if (dir == "1")
    yBottom -= bottomPad
  else
    yTop += topPad

  var bottomLine = drawLine(xs[0], yBottom, (xs[3]+thickness), yBottom,
                            thickness, osopadderColor)
  bottomLine.setAttribute("paddir", "bottom")
  bottomLine.setAttribute("startcoord", yBottom)
  bottomLine.setAttribute("startpadding", bottomPad)
  bottomLine.setAttribute("currpadding", bottomPad)
  setCommonAttrsForOSOPadderLine(bottomLine, n1, propName)

  var topLine = drawLine(xs[0], yTop, (xs[3]+thickness), yTop, thickness,
                         osopadderColor)
  topLine.setAttribute("paddir", "top")
  topLine.setAttribute("startcoord", yTop)
  topLine.setAttribute("startpadding", topPad)
  topLine.setAttribute("currpadding", topPad)
  setCommonAttrsForOSOPadderLine(topLine, n1, propName)

  var leftLine = drawLine((xs[0]+thickness/2), yTop, (xs[0]+thickness/2),
                          yBottom, thickness, osopadderColor)
  leftLine.setAttribute("paddir", "left")
  leftLine.setAttribute("startcoord", (xs[0]+thickness/2))
  leftLine.setAttribute("startpadding", leftPad)
  leftLine.setAttribute("currpadding", leftPad)
  setCommonAttrsForOSOPadderLine(leftLine, n1, propName)

  var rightLine = drawLine((xs[3]+thickness/2), yTop, (xs[3]+thickness/2),
                           yBottom, thickness, osopadderColor)
  rightLine.setAttribute("paddir", "right")
  rightLine.setAttribute("startcoord", (xs[3]+thickness/2))
  rightLine.setAttribute("startpadding", rightPad)
  rightLine.setAttribute("currpadding", rightPad)
  setCommonAttrsForOSOPadderLine(rightLine, n1, propName)
}

function selectOSOPaddable (grob) {

  if (panZoomOn() || isSVGReadOnly())
    return

  //TODO: doesn't seem to be needed anymore
  if (!detectLeftButton(event)) {
    event.preventDefault()
    return
  }

  currGrob = grob

}

function manipulateOSOPadder() {

  var x = getSVGCoords().x
  var y = getSVGCoords().y

  var paddoffs = Number(currGrob.getAttribute("startpadding"))
  var padding = 0

  if ((currGrob.getAttribute("paddir") == "left") ||
(currGrob.getAttribute("paddir") == "right")) {
    if (currGrob.getAttribute("paddir") == "right")
      padding = x - Number(currGrob.getAttribute("startcoord")) + paddoffs
    else
      padding = Number(currGrob.getAttribute("startcoord")) - x + paddoffs
    if (padding >= 0)
    {
      currGrob.setAttributeNS(null, 'x1', x)
      currGrob.setAttributeNS(null, 'x2', x)
      currGrob.setAttribute("currpadding", padding)
    }
  }
  else {
    if (currGrob.getAttribute("y-direction") == "1")
      padding = Number(currGrob.getAttribute("startcoord")) - y + paddoffs
    else
      padding = y - Number(currGrob.getAttribute("startcoord")) + paddoffs
    if (padding >= 0)
    {
      currGrob.setAttributeNS(null, 'y1', y)
      currGrob.setAttributeNS(null, 'y2', y)
      currGrob.setAttribute("currpadding", padding)
    }
  }

}

function updateLilyFileForOSOPadder(currGrob) {

  var gid = currGrob.getAttribute('gid')
  var padSegments = document.querySelectorAll('[gid="'+gid+'"]')
  var topPad = 0
  var bottomPad = 0
  var leftPad = 0
  var rightPad = 0
  for (var i = 0; i < padSegments.length; i++) {
    if (padSegments[i].getAttribute("paddir") == "top")
      topPad = +(Number(padSegments[i].getAttribute("currpadding")).toFixed(3))
    else if (padSegments[i].getAttribute("paddir") == "bottom")
      bottomPad = +(Number(padSegments[i].getAttribute("currpadding")).toFixed(3))
    else if (padSegments[i].getAttribute("paddir") == "left")
      leftPad = +(Number(padSegments[i].getAttribute("currpadding")).toFixed(3))
    else
      rightPad = +(Number(padSegments[i].getAttribute("currpadding")).toFixed(3))
  }

  lilyExpr = '\\js'+currGrob.getAttribute("editableclass")+' "' + gid + '" "pads" #\'(' +
             topPad + ' ' + rightPad + ' ' +
             bottomPad + ' ' + leftPad + ')'

  replaceExprInLyFile(gid, "pads", lilyExpr)

}

////////////////////////////
// [END]  OSOPADDER DEFS
////////////////////////////

////////////////////////////
// [START] SHORTEN-PAIR DEFS
////////////////////////////

function initShortenPair(n1, propName) {

  leftX = null
  rightX = 0
  Y = 0
  strokeWidth = 0.5
  gid = n1.getAttribute(propName+'-propid')

  /* NOT SUPPORTED, JUST A STUB
  if (n1.getAttribute("editableclass") == 'PianoPedalBracket') {

    var editableNode = null

    for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling)
      if (n2.nodeName == 'line')
        editableNode = n2

    // 2.22.0 compatibility
    if (editableNode == null)
      for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling)
        for (n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling)
          if (n3.nodeName == 'line')
            editableNode = n3

    if (Number(editableNode.getAttribute('x1')) != Number(editableNode.getAttribute('x2'))) {
      leftX = Number(getTranslateCoordsDeprecated(editableNode)[0])
      rightX = leftX
      Y = Number(getTranslateCoordsDeprecated(editableNode)[1])
      leftX += Number(editableNode.getAttribute('x1'))
      rightX += Number(editableNode.getAttribute('x2'))
    }

    if (editableNode.getAttribute('stroke-width') && Number(editableNode.getAttribute('stroke-width')) != 0)
      strokeWidth = editableNode.getAttribute('stroke-width')

  }
  */

  if (n1.getAttribute("editableclass") == 'OttavaBracket') {
    var offsRightX = 0

    var editableNode = null

    for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling)
      if (n2.nodeName == 'line' || n2.nodeName == 'text') {
        editableNode = n2
        var arr = configOttavaBracketEditableNode(editableNode, leftX, rightX, Y, strokeWidth)
        leftX = arr[1]
        rightX = arr[2]
        Y = arr[3]
        strokeWidth = arr[5]
      }

    // 2.22.0 compatibility
    if (editableNode == null)
      for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling)
        for (n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling)
          if (n3.nodeName == 'line' || n3.nodeName == 'text') {
            editableNode = n3
            var arr = configOttavaBracketEditableNode(editableNode, leftX, rightX, Y, strokeWidth)
            leftX = arr[1]
            rightX = arr[2]
            Y = arr[3]
            strokeWidth = arr[5]
          }
  }

  //FIXME/IMPROVE: bad grob
  if (leftX == null)
      leftX = 0

  //Orig coords
  var origCoords = [leftX, rightX]
  lilySetProp = getLilySetProperty(jsSVGRegex, gid, propName)

  if (lilySetProp && !lilySetProp.includes("#'()")) {

    origCoords[0] = Number(origCoords[0]) -
      +(Number(lilySetProp.split("#\'(")[1].split(" ")[0])).toFixed(3)
    origCoords[1] = Number(origCoords[1]) +
      +(Number(lilySetProp.split(" . ")[1].split(")")[0])).toFixed(3)

  }

  var svgns = "http://www.w3.org/2000/svg"
  y2 = Y + 4

  var barLeft = createInteractiveRect(leftX-interactiveBarWidth, Y,
                                      interactiveBarWidth, interactiveBarHeight,
                                      editableObjectsColor)
  barLeft.setAttribute('origx', origCoords[0])
  barLeft.setAttribute('gid', gid)
  barLeft.setAttribute('editcommand', n1.getAttribute('editcommand'))
  barLeft.setAttribute('editableclass', n1.getAttribute('editableclass'))
  barLeft.setAttribute('associatedtoprops', propName)
  barLeft.setAttribute('staffspace', n1.getAttribute('staffspace'))
  barLeft.setAttribute('onmousedown', 'selectShortenPairable(this)')

  var barRight = createInteractiveRect(rightX, Y, interactiveBarWidth,
                                       interactiveBarHeight, editableObjectsColor)
  barRight.setAttribute('origx', origCoords[1])
  barRight.setAttribute('gid', gid)
  barRight.setAttribute('editcommand', n1.getAttribute('editcommand'))
  barRight.setAttribute('editableclass', n1.getAttribute('editableclass'))
  barRight.setAttribute('associatedtoprops', propName)
  barRight.setAttribute('staffspace', n1.getAttribute('staffspace'))
  barRight.setAttribute('onmousedown', 'selectShortenPairable(this)')

}

function configOttavaBracketEditableNode(editableNode, leftX, rightX, Y, strokeWidth) {

  var translCoordsNode =  editableNode
  if (getTranslateCoords(translCoordsNode) == null)
    translCoordsNode = editableNode.parentNode

  translCoords = getTranslateCoordsDeprecated(translCoordsNode)

  if (leftX == null || (Number(translCoords[0]) < leftX)) {
    leftX = Number(translCoords[0])
    Y = Number(translCoords[1])
  }

  if (editableNode.nodeName == 'line' && (Number(editableNode.getAttribute('x1')) !=
                                          Number(editableNode.getAttribute('x2')))) {
    x1Transl = Number(editableNode.getAttribute('x1')) +
               Number(translCoords[0])
    x2Transl = Number(editableNode.getAttribute('x2')) +
               Number(translCoords[0])
    rightX = Math.max(x1Transl, x2Transl)
  }

  if (editableNode.getAttribute('stroke-width') &&
      Number(editableNode.getAttribute('stroke-width')) != 0)
    strokeWidth = editableNode.getAttribute('stroke-width')

  return [editableNode, leftX, rightX, Y, strokeWidth]

}

function selectShortenPairable(grob) {

  if (panZoomOn() || isSVGReadOnly())
    return

  //TODO: doesn't seem to be needed anymore
  if (!detectLeftButton(event)) {
    event.preventDefault()
    return
  }

  currGrob = grob

}

function manipulateShortenPair() {

  x = getSVGCoords().x

  currGrob.setAttributeNS(null, 'x', x)
}

function updateLilyFileForShortenPair(currGrob) {

  gid = currGrob.getAttribute('gid')
  prop = currGrob.getAttribute('associatedtoprops')
  //must be two
  var bars = document.querySelectorAll('[gid="'+gid+'"]')
  newXLeft = Number(bars[0].getAttributeNS(null, "x")) + Number(bars[0].getAttributeNS(null, "width"))
  newXRight = Number(bars[1].getAttributeNS(null, "x"))
  origXLeft = Number(bars[0].getAttribute("origx"))
  origXRight = Number(bars[1].getAttribute("origx"))
  //TODO FIXME it seems ignored by Lilypond (at least for PianoPedalBracket). A possible bug?
  staffSpaceCorr = Number(currGrob.getAttribute('staffspace'))

  shXLeft = +(((newXLeft - origXLeft)).toFixed(3))
  shXRight = +(((origXRight - newXRight)).toFixed(3))
  lilyExpr = '\\js' + currGrob.getAttribute('editcommand') +
             ' "' + gid + '" "'+ prop +'" #\'(' + shXLeft + ' . ' + shXRight + ')'

  replaceExprInLyFile(gid, prop, lilyExpr)

}

////////////////////////////
// [END]  SHORTEN-PAIR DEFS
////////////////////////////

////////////////////////////
// [START] XY-PLACEMENT DEFS
////////////////////////////

function initXYPlacement(n1, propName) {

  var gid = n1.getAttribute(propName.toLowerCase()+'-propid')
  var dir = null
  var grobName =  n1.getAttribute('editableclass')
  var axis = null
  /*
  if (isAvoidCollisionYProp(propName) && !dir) {
    console.log("[WARNING]: could not init "+propName+
                " for grob: "+grobName+" (id="+gid+"). Direction is not set")
    return
  } */

  n1.setAttribute('color', editableObjectsColor)

  for (var n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {

    if (n2.nodeName == 'text' || n2.nodeName == 'g' || n2.nodeName == 'path' || n2.nodeName == 'line') {

      if (isMarker(n2) || isOsPadder(n2))
          continue

      if (n2.nodeName == 'g' && !hasTranslateCoords(n2))
        continue

      //Current coords
      var coords = getTranslateCoordsDeprecated(n2)

      n2.setAttribute('coords', coordsToStr(coords))
      n2.setAttribute('textpos', n1.getAttribute('textpos'))
      n2.setAttribute('gid', gid)
      if (isAvoidCollisionProp(propName)) {

        axis = getAxisOfProp(propName)

        if (axis == 'Y' && !n1.getAttribute('y-direction')) {
          dir = getCurrentLilyDirection(n1, propName)
          n1.setAttribute('y-direction', dir)
        }
        else if (axis == 'X' && !n1.getAttribute('x-direction')) {
          dir = getCurrentLilyDirection(n1, propName)
          n1.setAttribute('x-direction', dir)
        }
        else if (axis == 'Y' && n1.getAttribute('y-direction'))
          dir = n1.getAttribute('y-direction', dir)
        else if (axis == 'X' && n1.getAttribute('x-direction'))
          dir = n1.getAttribute('x-direction', dir)

      }
      var staffSpaceCorr = Number(n1.getAttribute('staffspace'))
      //FIXME: is this a lilypond bug? Note that the same error
      // happens for shorten-pair: staffspace is ignored
      if (n1.getAttribute('editableclass') == "NoteColumn")
        staffSpaceCorr = 1

      //Orig coords
      var origCoords = coords.slice()

      var lilySetProp = getLilySetProperty(jsSVGRegex, gid, propName)

      if (lilySetProp) {

        //TODO: fix repetitive code
        if (lilySetProp.includes("#'()")) {

          if (isAvoidCollisionProp(propName)) {
            var coordIdx = 0
            if (axis == 'Y')
              coordIdx = 1

            var grobRefYCoord = refCoordinateOfGrobForGivenProp(n1, propName)
            var yRefCoord = getRef(n1, propName)
            var offs = (grobRefYCoord - yRefCoord).toFixed(3)

            n1.setAttribute("offs", offs)

            var actualDistFromRefPoint = distanceOfGrobFromRefPoint(n1, propName).toFixed(3)
            var val = actualDistFromRefPoint

            if (dir && dir == "-1")
              val = 0 - Number(val) + Number(offs)
            else
              val = Number(val) + Number(offs)

            if (isAbsValProp(propName))
              val = Math.abs(val)
            lilyExpr = '\\js' + n1.getAttribute('editcommand') +
                       ' "' + gid + '" "'+ propName +'" #\'()'
            lastMemText = getLyFileContent()
            replaceExprInLyFile(gid, propName, lilyExpr)
            updatePointAndClickPositions(false)
            lilySetProp = getLilySetProperty(jsSVGRegex, gid, propName)
            var origDistFromRefPoint = +(Number(lilySetProp.split("#\'(")[1].replace(")","").trim())).toFixed(3)

            if (isAbsValProp(propName) && dir == '-1')
              origDistFromRefPoint = 0 - origDistFromRefPoint

            origCoords[coordIdx] = distanceOfNodeFromRefPoint(n2, propName) - origDistFromRefPoint

            if (isAbsValProp(propName) && dir == '-1')
              origCoords[coordIdx] = 0 - origCoords[coordIdx]

            //useful for debug
            //if (axis == 'Y')
            //createInteractiveRect(coords[0], coords[1], 0.1, actualDistFromRefPoint+5, 'green')
            //if (axis == 'X')
            //createInteractiveRect(coords[0], coords[1], actualDistFromRefPoint, 0.1, 'green')
        }

        }
        else if (isAvoidCollisionProp(propName)) {

          var coordIdx = 0
          var axis = getAxisOfProp(propName)
          if (axis == 'Y')
            coordIdx = 1
          var actualDistFromRefPoint = distanceOfGrobFromRefPoint(n1, propName, true)
            //origCoords[0] = 0

          var origDistFromRefPoint = +(Number(lilySetProp.split("#\'(")[1].replace(")","").trim()))
          origDistFromRefPoint = Math.abs(origDistFromRefPoint)

          //console.log("ORIG="+origDistFromRefPoint+"  ACTUAL="+actualDistFromRefPoint)
          //origDistFromRefPointLessPrecise = Math.floor(origDistFromRefPoint * 10)/10
          var offs = (actualDistFromRefPoint - origDistFromRefPoint).toFixed(3)
          n1.setAttribute("offs", offs)

          if(!isAbsValProp(propName) && (actualDistFromRefPoint != origDistFromRefPoint)) {
            var val = actualDistFromRefPoint
            if (dir && dir == "-1")
              val = 0 - val
            //if (isAbsValProp(propName))
            //  val = Math.abs(val)
            lilyExpr = '\\js' + n1.getAttribute('editcommand') +
                       ' "' + gid + '" "'+ propName +'" #\'(' + val + ')'
            lastMemText = getLyFileContent()
            replaceExprInLyFile(gid, propName, lilyExpr)
            updatePointAndClickPositions(false)
            lilySetProp = getLilySetProperty(jsSVGRegex, gid, propName)
            var origVal = origDistFromRefPoint
            if (dir && dir == "-1")
                origVal = 0 - origVal
            logWarning("Could not set '"+propName+"' to "+origVal+
                        " for grob: "+grobName+" (id="+gid+"); reset to "+val)

            origDistFromRefPoint = actualDistFromRefPoint
          }

          origCoords[coordIdx] = distanceOfNodeFromRefPoint(n2, propName) - origDistFromRefPoint

          if (isAbsValProp(propName) && dir == '-1')
            origCoords[coordIdx] = 0 - origCoords[coordIdx]

          //if (axis == 'Y')
          //createInteractiveRect(coords[0], coords[1], 0.1, Number(actualDistFromRefPoint), 'red')
          //if (axis == 'X')
          //  createInteractiveRect(coords[0], coords[1], actualDistFromRefPoint, 0.1, 'green')

          //createInteractiveRect(coords[0], coords[1], 0.1, origDistFromYRefPoint, 'green')

        }
        else if (propName == 'extra-offset-x') {
          origCoords[0] = Number(origCoords[0]) -
                          +(Number(lilySetProp.split("#\'(")[1].replace(")","").trim())*staffSpaceCorr).toFixed(3)
          //Dummy number. Will not be used
          origCoords[1] = 0
        }
        else if (propName == 'extra-offset-y') {
          //Dummy number. Will not be used
          origCoords[0] = 0
          origCoords[1] = Number(origCoords[1]) +
                          +(Number(lilySetProp.split("#\'(")[1].replace(")","").trim())*staffSpaceCorr).toFixed(3)
        }
        else  {
          origCoords[0] = Number(origCoords[0]) -
            +(Number(lilySetProp.split("#\'(")[1].split(" ")[0])*staffSpaceCorr).toFixed(3)
          origCoords[1] = Number(origCoords[1]) +
            +(Number(lilySetProp.split(" . ")[1].split(")")[0])*staffSpaceCorr).toFixed(3)
        }
      }

      //console.log("CURRPTS")
      //logPointsCoords(coords)
      //console.log("ORIGPTS")
      //logPointsCoords(origCoords)

      n2.setAttribute('origcoords', coordsToStr(origCoords))
      n2.setAttribute('editcommand', n1.getAttribute('editcommand'))
      n2.setAttribute('editableclass', n1.getAttribute('editableclass'))
      var props = n2.getAttribute('associatedtoprops')
      var propsids = n2.getAttribute('associatedprops-ids')
      if (!props)
        props = ""
      if (!propsids)
        propsids = ""
      n2.setAttribute('associatedtoprops', props + propName + ';')
      n2.setAttribute('associatedprops-ids', propsids + propName + '='+gid+';')
      n2.setAttribute('staffspace', n1.getAttribute('staffspace'))
      n2.setAttribute('onmousedown', 'selectMovableGrob(this)')
      n2.setAttribute('onmouseover', 'mouseOverModifiableElm(this)')
      n2.setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"))')
      n2.setAttribute('onmouseout', 'mouseOutModifiableElm(this)')
    }
  }

}

function selectMovableGrob(grob) {

  if (panZoomOn() || isSVGReadOnly())
    return

  if (!detectLeftButton(event) && grob.getAttribute("textpos")) {
      //showJsObjsMenu(grob.getAttribute("textpos"))
    return
  }

  currGrob = grob

}

function manipulateXYPlacement() {

  var oldCoords = getTranslateCoordsDeprecated(currGrob).slice()

  var coords = []
  coords[0] = getSVGCoords().x
  coords[1] = getSVGCoords().y
  var props = currGrob.getAttribute('associatedtoprops')

  if (props.endsWith(';'))
    props = props.substring(0, props.length-1)

  var propsArr = props.split(';')

  if (getAxisOfProps(props) == 'X') {
    coords[1] = Number(getTranslateCoordsDeprecated(currGrob)[1])
  }
  if (getAxisOfProps(props) == 'Y') {
    coords[0] = Number(getTranslateCoordsDeprecated(currGrob)[0])
  }

  //setTranslateCoords(currGrob, coords)

  atLeastOneAvoidCollisionYProp = false
  avoidCollisionYProp = null
  for (var q = 0; q < propsArr.length; q++) {
    if (isAvoidCollisionProp(propsArr[q]) && (getAxisOfProp(propsArr[q]) == 'Y')) {
      atLeastOneAvoidCollisionYProp = true
      avoidCollisionYProp = propsArr[q]
      break
    }
  }

  var corr = 0

  if (atLeastOneAvoidCollisionYProp) {

    //var refCoord = refCoordinateOfGrobForGivenProp(currGrob.parentNode, avoidCollisionYProp)
    //var dist = distanceOfGrobFromRefPoint(currGrob.parentNode, avoidCollisionYProp)
    var edgeY = getRef(currGrob.parentNode, avoidCollisionYProp)
    dir = currGrob.parentNode.getAttribute("y-direction")

    if (dir && dir == "1") {
      if (edgeY < coords[1]) {
        //FIXME:? not the proper method?
        coords[1] = edgeY - 0.01
      }
    }
    if (dir && dir == "-1") {
      if (edgeY > coords[1]) {
        //FIXME:? not the proper method?
        coords[1] = edgeY + 0.01
      }
    }
  }

  gid = currGrob.getAttribute('gid')

  //TODO move to global state var
  var gobjs = document.querySelectorAll('[gid="'+gid+'"]')

  for (var i = 0; i < gobjs.length; i++) {
    if (/*(gobjs[i] != currGrob) && */
      gobjs[i].getAttribute('associatedtoprops') &&
      gobjs[i].getAttribute('associatedtoprops') == currGrob.getAttribute('associatedtoprops')) {
      var shX = Number(getTranslateCoordsDeprecated(gobjs[i])[0]) - Number(oldCoords[0])
      var shY = Number(getTranslateCoordsDeprecated(gobjs[i])[1]) - Number(oldCoords[1])
      var coords2 = []

      coords2[0] = coords[0] + shX
      coords2[1] = coords[1] + shY

      //gobjs[i].setAttribute('coords', coordsToStr(coords2))
      setTranslateCoords(gobjs[i], coords2)
    }
  }

  currGrob.setAttribute('coords', coordsToStr(coords))

}

function updateLilyFileForXYPlacement(currGrob) {

  var newX = Number(currGrob.getAttribute('coords').split(' ')[0])
  var origX = Number(currGrob.getAttribute('origcoords').split(' ')[0])
  var newY = Number(currGrob.getAttribute('coords').split(' ')[1])
  var staffSpaceCorr = Number(currGrob.getAttribute('staffspace'))
  var props = currGrob.getAttribute('associatedtoprops')
  if (props.endsWith(';'))
    props = props.substring(0, props.length - 1)
  var propsArr = props.split(';')
  var origY = Number(currGrob.getAttribute('origcoords').split(' ')[1])
  var assocPropsIds = currGrob.getAttribute('associatedprops-ids')
  var assocPropsIdsArr = assocPropsIds.split(';')

  for (var i = 0; i < propsArr.length; i++) {

    var prop = propsArr[i]
    var propId = null

    for (var q = 0; q < assocPropsIdsArr.length; q++) {
      evalProp = assocPropsIdsArr[q].split('=')[0]
      if (evalProp == prop) {
        propId = assocPropsIdsArr[q].split('=')[1]
        break
      }
    }

    //FIXME: is this a lilypond bug? Note that the same error
    // happens for shorten-pair: staffspace is ignored
    if (currGrob.getAttribute('editableclass') == "NoteColumn")
        staffSpaceCorr = 1

    shX = +(((newX - origX)/staffSpaceCorr).toFixed(3))

    shY = +(((origY - newY)/staffSpaceCorr).toFixed(3))

    lilyExpr = '\\js' + currGrob.getAttribute('editcommand') +
              ' "' + propId + '" "'+ prop + '" #\'(' + shX + ' . ' + shY + ')'

    if (prop == 'extra-offset-x') {
      lilyExpr = '\\js' + currGrob.getAttribute('editcommand') +
                ' "' + propId + '" "'+ prop +'" #\'(' + shX + ')'
    }
    else if (prop == 'extra-offset-y') {
      lilyExpr = '\\js' + currGrob.getAttribute('editcommand') +
                ' "' + propId + '" "'+ prop +'" #\'(' + shY + ')'
    }
    else if (isAvoidCollisionProp(prop)) {

      val = distanceOfGrobFromRefPoint(currGrob.parentNode, prop).toFixed(3)

      var axis = getAxisOfProp(prop)
      var dir = null

      if (isAbsValProp(prop) && (axis == 'Y') && currGrob.parentNode.getAttribute('y-direction'))
        dir = currGrob.parentNode.getAttribute('y-direction')
      else if (isAbsValProp(prop) && (axis == 'X') && currGrob.parentNode.getAttribute('x-direction'))
        dir = currGrob.parentNode.getAttribute('x-direction')
      else
        dir = getCurrentLilyDirection(currGrob.parentNode, prop)

      if (dir && dir == "-1")
        val = 0 - val
      if (isAbsValProp(prop))
        val = Math.abs(val)

      if ((axis == 'Y') && isAbsValProp(prop))
      {

        val -= Number(currGrob.parentNode.getAttribute("offs"))
        val = val.toFixed(3)

        //TODO FIXME this is a workaround because the mouse can't stop moving
        //the grob above/below ref point when the selected node doesn't have
        //the refCoordinateOfGrob.
        var grobY = refCoordinateOfGrobForGivenProp(currGrob.parentNode, prop)
        var refY = getRef(currGrob.parentNode, prop)
        var needToResetVal = ((grobY > refY) && dir == "1") ||
                             ((grobY < refY) && dir == "-1")
        if (needToResetVal)
            val = 0
      }

      lilyExpr = '\\js' + currGrob.getAttribute('editcommand') +
                ' "' + propId + '" "'+ prop +'" #\'(' + val + ')'
    }

    replaceExprInLyFile(propId, prop, lilyExpr)

  }
}

////////////////////////////
// [END]  XY-PLACEMENT DEFS
////////////////////////////

////////////////////////////
// [START] STENCIL DEFS
////////////////////////////

function setCpsOnPath(path, cps) {

  path.setAttribute('d', 'M ' + cps[0] + ',' + cps[1] + ' ' +
                    'C ' + cps[2] + ',' + cps[3] + ' ' +
                    cps[4] + ',' + cps[5] + ' ' +
                    cps[6] + ',' + cps[7])

}

function initShape(node, propName) {

  cpsCount = 0
  lineCounter = 1
  gid = node.getAttribute(propName+'-propid')
  //Current points
  cps = []
  var circles = []
  var lines = []
  var paths = []

  for (var n1 = node.firstChild; n1 !== null; n1 = n1.nextSibling) {

    if (n1.nodeName == 'path')
      paths.push(n1)

    if (n1.nodeName == 'g') {
      for (var n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
        if (n2.nodeName == 'circle')
          circles.push(n2)
        if (n2.nodeName == 'line')
          lines.push(n2)
         if (n2.nodeName == 'path')
          paths.push(n2)
      }
      // 2.22.0 compatibility
      for (var n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling)
        for (var n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling) {
          if (n3.nodeName == 'circle')
            circles.push(n3)
          if (n3.nodeName == 'line')
            lines.push(n3)
          if (n3.nodeName == 'path')
            paths.push(n3)
        }
    }
  }

  for (var q = 0; q < circles.length; q++) {
    transf = circles[q].getAttribute('transform')

    if (transf == null)
      transf = circles[q].parentNode.getAttribute('transform')

    cps[cpsCount * 2] = transf.replace('translate(', '').split(',')[0]
    cps[cpsCount * 2 + 1] = transf.split(',')[1].trim().replace(')', '')

    node.setAttribute('cp' + cpsCount + 'x', cps[cpsCount * 2])
    node.setAttribute('cp' + cpsCount + 'y', cps[cpsCount * 2 + 1])
    //TODO: add prefix to these ids
    circles[q].setAttribute('id', gid + '_cp_' + cpsCount)
    //TODO fix repetitive code below for all grobs
    circles[q].setAttribute('textpos', node.getAttribute('textpos'))
    circles[q].setAttribute('onmousedown', 'selectCp(this)')
    circles[q].setAttribute('staffspace', node.getAttribute('staffspace'))
    circles[q].setAttribute('editcommand', node.getAttribute('editcommand'))
    circles[q].setAttribute('editableclass', node.getAttribute('editableclass'))
    circles[q].setAttribute('associatedtoprops', propName)
    circles[q].setAttribute('onmouseover', 'mouseOverModifiableElm(this)')
    circles[q].setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"))')
    //TODO use the right red nuance
    circles[q].setAttribute('onmouseout', 'this.setAttribute("color", "rgb(207, 119, 112)")')
    cpsCount = cpsCount + 1
  }

  for (var q = 0; q < lines.length; q++) {
    lines[q].setAttribute('id', gid + '_line_' + lineCounter)
    lineCounter++
  }

  node.setAttribute('cps', cps.join(' '))

  for (var q = 0; q < paths.length; q++) {
    if (paths[q].hasAttribute('transform'))
      paths[q].removeAttribute('transform')

    if (paths[q].parentNode.hasAttribute('transform'))
      paths[q].parentNode.removeAttribute('transform')

    setCpsOnPath(paths[q], cps)

    paths[q].setAttribute('id', gid + '_path')
    paths[q].setAttribute('fill', 'none')
  }

  origcpsShifts = [0, 0, 0, 0, 0, 0, 0, 0]
  lilySetProp = getLilySetProperty(jsSVGRegex, gid, propName)
  if (lilySetProp) {
    //TODO use a better parse
    lilySetProp = lilySetProp.replace(/ \. /g, ' ').split("#\'(")[1]
    lilySetProp = lilySetProp.substring(0, lilySetProp.length - 1)
    lilySetProp = lilySetProp.replace(/\(/g, ' ').replace(/\)/g, ' ')
    exprSplit = lilySetProp.split(' ')
    var q = 0
    for (var i = 0; i < exprSplit.length - 1; i++)
      if (exprSplit[i] != "")
        origcpsShifts[q++] = exprSplit[i]
  }

  origcps = cps.slice()
  shiftPoints(origcps, origcpsShifts)
  node.setAttribute('origcps', origcps.join(' '))

  // 2.23.x compatibility
  if (lilypondVersion.startsWith("2.23")) {
    origcpsCorr = cps.slice()
    origcpsShiftsCorr = origcpsShifts.slice()
    var staffSpaceCorr = 1
    if (node.getAttribute("staffspace") != null)
      staffSpaceCorr = Number(node.getAttribute("staffspace"))
    for (var i = 0; i < 4; i++)
      origcpsShiftsCorr[i*2 + 1] = Number(origcpsShiftsCorr[i*2 + 1])*staffSpaceCorr
    shiftPoints(origcpsCorr, origcpsShiftsCorr)
    node.setAttribute('origcpscorr', origcpsCorr.join(' '))
  }
  //console.log("NEW")
  //logPointsCoords(cps)
  //console.log("ORIG")
  //logPointsCoords(origcps)
  //console.log("SHIFTS")
  //logPointsCoords(origcpsShifts)

}

function selectCp(cp) {

  if (panZoomOn() || isSVGReadOnly())
    return

  //TODO: doesn't seem to be needed anymore
  if (!detectLeftButton(event)) {
    event.preventDefault()
    return
  }

  currGrob = cp

}

function manipulateShape() {

  assocCurveId = currGrob.getAttribute('id').split('_')[0]
  propName = currGrob.getAttribute('associatedtoprops')
  var checkOneLevelUpper = false
  assocCurve = currGrob.parentNode.parentNode
  // 2.22.0 compatibility
  if (assocCurve.getAttribute('cps') == null) {
    checkOneLevelUpper = true
    assocCurve = currGrob.parentNode.parentNode.parentNode
  }

  cpIdx = currGrob.getAttribute('id').split('_')[2]
  cps = assocCurve.getAttribute('cps').split(' ')
  cps[cpIdx * 2] = (getSVGCoords()).x
  cps[cpIdx * 2 + 1] = (getSVGCoords()).y
  assocCurve.setAttribute('cps', cps.join(' '))

  //update circle corresponding to curr cp
  translateCoordsStr = cps[cpIdx * 2] + ',' + cps[cpIdx * 2 + 1]

  // 2.22.0 compatibility
  if (checkOneLevelUpper)
    currGrob.parentNode.setAttribute('transform', 'translate(' + translateCoordsStr + ')')
  else
    currGrob.setAttribute('transform', 'translate(' + translateCoordsStr + ')')

  //Set new CPS on the 3 lines
  for (var i = 0; i < 3; i++) {
    currLine = document.getElementById(assocCurveId + '_line_' + (i + 1))
    // 2.22.0 compatibility
    if (checkOneLevelUpper)
      currLine.parentNode.setAttribute('transform', 'translate(' + cps[i * 2] +
                                       ',' + cps[i * 2 + 1] + ')')
    else
      currLine.setAttribute('transform', 'translate(' + cps[i * 2] +
                                       ',' + cps[i * 2 + 1] + ')')

    currLine.setAttribute('x2', cps[i * 2 + 2] - cps[i * 2])
    currLine.setAttribute('y2', cps[i * 2 + 3] - cps[i * 2 + 1])
  }

  //Update path (curve) with new cps
  path = document.getElementById(assocCurveId + '_path')
  setCpsOnPath(path, cps)

}

function updateLilyFileForShape(currGrob) {

  idTkn = currGrob.getAttribute('id').split('_')[0]
  prop = currGrob.getAttribute('associatedtoprops')
  lilyExpr = '\\js' + currGrob.getAttribute("editcommand") +
             ' "' + idTkn + '" "'+ prop +'" #\'('
  assocCurve = currGrob.parentNode.parentNode
  // 2.22.0 compatibility
  if (assocCurve.getAttribute('cps') == null)
    assocCurve = currGrob.parentNode.parentNode.parentNode

  // 2.23.x compatibility
  var staffSpaceCorr = 1
  if (assocCurve.getAttribute("staffspace") != null)
    staffSpaceCorr = Number(assocCurve.getAttribute("staffspace"))
  var cpIdx = currGrob.getAttribute('id').split('_')[2]

  cpsOrig = assocCurve.getAttribute('origcps').split(' ')
  cpsNew = assocCurve.getAttribute('cps').split(' ')

  for (q = 0; q < 4; q++) {
    newCp = document.getElementById(assocCurveId + '_cp_' + (q + 1))

    xOrig = cpsOrig[q * 2]
    yOrig = cpsOrig[q * 2 + 1]

    xNew = cpsNew[q * 2]
    yNew = cpsNew[q * 2 + 1]

    diffX = (+Number(xNew - xOrig)).toFixed(3)
    diffY = (+Number(yOrig - yNew)).toFixed(3)

    // 2.23.x compatibility
    if (lilypondVersion.startsWith("2.23") && (q == cpIdx)) {
      cpsOrigCorr = assocCurve.getAttribute('origcpscorr').split(' ')
      yOrig = cpsOrigCorr[cpIdx * 2 + 1]
      diffY = (+Number(yOrig - yNew)/staffSpaceCorr).toFixed(3)
    }

    lilyExpr += '(' + (+diffX) + ' . ' + (+diffY) + ') '
  }

  lilyExpr = lilyExpr.substring(0, lilyExpr.length - 1) + ')'
  replaceExprInLyFile(idTkn, prop, lilyExpr)

}

////////////////////////////
// [END] STENCIL DEFS
////////////////////////////

////////////////////////////
// [START] POSITIONS DEFS
////////////////////////////

function initPositions(n1, propName) {

  n1.setAttribute('color', editableObjectsColor)
  gid = n1.getAttribute(propName+'-propid')
  var subbeamsnum = 1
  var editableNodes = []
  for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
    if (n2.nodeName == 'polygon') {
      editableNodes.push(n2)
    }
  }

  //2.22.0 compatibility
  if (editableNodes.length == 0) {
    for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling)
      for (n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling) {
        if (n3.nodeName == 'polygon') {
          editableNodes.push(n3)
        }
      }
  }

  for (var q = 0; q < editableNodes.length; q++) {
    //Current points
    points = getShapePoints(editableNodes[q])

    setAbsCoords(editableNodes[q], points)
    editableNodes[q].setAttribute('points', pointsArrToStr(points))
    staffSpaceCorr = n1.getAttribute('staffspace')

    //Orig points
    var origcps = points.slice()
    lilySetProp = getLilySetProperty(jsSVGRegex, gid, propName)
    //TODO try if the expr contains more spaces --> ( x    .      y )
    if (lilySetProp && !lilySetProp.includes("#'()")) {
      for (var i = 0; i < 2; i++)
        shiftPoint(origcps, i, 0,
                   +(Number(lilySetProp.split(" . ")[1].split(")")[0])*staffSpaceCorr).toFixed(3))

      for (var i = 2; i < 4; i++)
        shiftPoint(origcps, i, 0,
                  +(Number(lilySetProp.split("#\'(")[1].split(" ")[0])*staffSpaceCorr).toFixed(3))
    }

    //console.log("CURRPTS")
    //	logPointsCoords(points)
    //console.log("ORIGPTS")
    //	logPointsCoords(origcps)

    editableNodes[q].setAttribute('origcps', pointsArrToStr(origcps))
    //IMPORTANT!  (and TODO: make automatic)

    editableNodes[q].setAttribute('editcommand', n1.getAttribute('editcommand'))
    editableNodes[q].setAttribute('editableclass', n1.getAttribute('editableclass'))
    editableNodes[q].setAttribute('associatedtoprops', propName)
    editableNodes[q].setAttribute('staffspace', n1.getAttribute('staffspace'))
    //IMPORTANT! (and TODO: make automatic)
    editableNodes[q].setAttribute('id', 'lilypolygon_' + gid + '_' + subbeamsnum++)

    //editableNodes[q].setAttribute('textpos', n1.getAttribute('textpos'))
    editableNodes[q].setAttribute('onmousedown', 'selectBeam(this)')
    editableNodes[q].setAttribute('onmouseover', 'mouseOverModifiableElm(this)')
    //editableNodes[q].setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"))')
    editableNodes[q].setAttribute('onmouseout', 'this.setAttribute("color", "'+editableObjectsColor+'")')
    editableNodes[q].removeAttribute('transform')
    editableNodes[q].setAttribute('anchor', '')
    if (n1.getAttribute('textpos')) {
      editableNodes[q].setAttribute('textpos', n1.getAttribute('textpos'))
      editableNodes[q].setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"))')
    }

    //updateLilyFileForPositions(n2)
  }

  n1.setAttribute('subbeamsnum', subbeamsnum - 1)

}

function selectBeam(grob) {

  if (panZoomOn() || isSVGReadOnly())
    return

  if (!detectLeftButton(event) && grob.getAttribute("textpos")) {
    //showJsObjsMenu(grob.getAttribute("textpos"))
    return
  }

  parentIdNum = grob.getAttribute('id').split('_')[1]
  parentNode = grob.parentNode
  subbeamsnum = parentNode.getAttribute('subbeamsnum')

  //2.22.0 compatibility
  if (subbeamsnum == null)
    subbeamsnum = parentNode.parentNode.getAttribute('subbeamsnum')

  for (var q = 1; q <= subbeamsnum; q++) {
    subBeam = document.getElementById('lilypolygon_' + parentIdNum + "_" + q)
    points = subBeam.getAttribute('points').split(' ')
    leftX = Number(points[4])
    rightX = Number(points[0])
    distanceFromRightSide = Math.abs((getSVGCoords()).x - rightX)
    distanceFromLeftSide = Math.abs((getSVGCoords()).x - leftX)
    distanceFromCenter = Math.abs((getSVGCoords()).x - (leftX + (rightX - leftX) / 2))

    minDistance = Math.min(distanceFromLeftSide, distanceFromCenter, distanceFromRightSide)

    switch (minDistance) {
      case distanceFromRightSide:
        subBeam.setAttribute('anchor', 'right')
        break;
      case distanceFromLeftSide:
        subBeam.setAttribute('anchor', 'left')
        break;
      case distanceFromCenter:
        subBeam.setAttribute('anchor', 'center')
        break;
    }

    subBeam.setAttribute('yscreenprev', (getSVGCoords()).y)
    currGrob = subBeam
  }

}

function manipulatePositions() {

  parentIdNum = currGrob.getAttribute('id').split('_')[1]
  parentNode = currGrob.parentNode
  subbeamsnum = parentNode.getAttribute('subbeamsnum')

  //2.22.0 compatibility
  if (subbeamsnum == null) {
    parentNode = currGrob.parentNode.parentNode
    subbeamsnum = parentNode.getAttribute('subbeamsnum')
  }

  idx1 = 1
  idx2 = 8

  if (currGrob.getAttribute('anchor') == 'left') {
    idx1 = 5
  } else if (currGrob.getAttribute('anchor') == 'right') {
    idx2 = 5
  }

  for (var q = 1; q <= subbeamsnum; q++) {
    subBeam = document.getElementById('lilypolygon_' + parentIdNum + "_" + q)
    points = subBeam.getAttribute('points').split(' ')
    origcps = subBeam.getAttribute('origcps').split(' ')

    for (var i = idx1; i < idx2; i = i + 2) {
      points[i] = Number(points[i]) +
        (getSVGCoords()).y -
        Number(subBeam.getAttribute('yscreenprev'))
    }

    subBeam.setAttribute('yscreenprev', (getSVGCoords()).y)
    subBeam.setAttribute('points', pointsArrToStr(points))
  }

}

function updateLilyFileForPositions(currGrob) {

  staffSpaceCorr = Number(currGrob.getAttribute('staffspace'))
  idTkn = currGrob.getAttribute('id').split('_')[1]

  angleLeft = +(((currGrob.getAttribute('origcps').split(' ')[7] -
    currGrob.getAttribute('points').split(' ')[7])/staffSpaceCorr).toFixed(3))

  angleRight = +(((currGrob.getAttribute('origcps').split(' ')[3] -
    currGrob.getAttribute('points').split(' ')[3])/staffSpaceCorr).toFixed(3))

  prop = currGrob.getAttribute('associatedtoprops')
  lilyExpr = '\\js'+currGrob.getAttribute('editcommand')+' "' + idTkn + '" "'+
             prop +'" #\'(' + angleLeft + ' . ' + angleRight + ')'

  replaceExprInLyFile(idTkn, prop, lilyExpr)

}

////////////////////////////
// [END] POSITIONS DEFS
////////////////////////////

function isAvoidCollisionProp(propName) {

  return (!propName.startsWith("extra-offset"))

}

function setSVGReadOnly(val) {
  svgReadOnly = val
}

function isSVGReadOnly() {
  return svgReadOnly
}

function refCoordinateOfGrobForGivenPropSpec(groupNode, propName) {

  var groupCoord = null
  var axis = getAxisOfProp(propName)

  if (((groupNode.getAttribute('editableclass') == "OttavaBracket") ||
       (groupNode.getAttribute('editableclass') == "DynamicLineSpanner") ||
       (groupNode.getAttribute('editableclass') == "SustainPedalLineSpanner") ||
       (groupNode.getAttribute('editableclass') == "SostenutoPedalLineSpanner") ||
       (groupNode.getAttribute('editableclass') == "UnaCordaPedalLineSpanner") ||
       (groupNode.getAttribute('editableclass') == "TupletBracket")) &&
      (axis == 'Y') &&
      ((propName == 'outside-staff-padding') ||
       (propName == 'padding') ||
       (propName == 'staff-padding'))) {

    var minY = null
    var maxY = null
    var bracketSegment = null
    var coordsArr = []

    for (var child = groupNode.firstChild; child !== null; child = child.nextSibling) {
      if (child.nodeName == 'line') {

        if (isMarker(child) || isOsPadder(child))
        continue

        coordsArr.push(Number(getTranslateCoordsDeprecated(child)[1]) + Number(child.getAttributeNS(null, 'y1')))
        coordsArr.push(Number(getTranslateCoordsDeprecated(child)[1]) + Number(child.getAttributeNS(null, 'y2')))

      }
    }

    // 2.22.0 compatibility
    if (coordsArr.length == 0)
    for (var n1 = groupNode.firstChild; n1 !== null; n1 = n1.nextSibling)
    for (var n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
      if (n2.nodeName == 'line') {

        if (isMarker(n2) || isOsPadder(n2))
        continue

        coordsArr.push(Number(getTranslateCoordsDeprecated(n2.parentNode)[1]) + Number(n2.getAttributeNS(null, 'y1')))
        coordsArr.push(Number(getTranslateCoordsDeprecated(n2.parentNode)[1]) + Number(n2.getAttributeNS(null, 'y2')))

      }
    }

    coordsArr.sort(sortNumber)

    if (groupNode.getAttribute('y-direction') == '1') {
      groupCoord = coordsArr[coordsArr.length - 1]
    }
    else {
      groupCoord = coordsArr[0]
    }

    groupCoord += 0.09

    if ((groupNode.getAttribute('editableclass') == "DynamicLineSpanner") ||
        (groupNode.getAttribute('editableclass') == "SostenutoPedalLineSpanner") ||
        (groupNode.getAttribute('editableclass') == "UnaCordaPedalLineSpanner") ||
        (groupNode.getAttribute('editableclass') == "SustainPedalLineSpanner"))
      groupCoord -= 0.09*3

  }

  return groupCoord
}

function getAxisOfProp(propName) {
  var ret = ""

  if (propName.toLowerCase() == "y-offset")
    ret = "Y"
  else if (propName.toLowerCase() == "extra-offset-y")
    ret = "Y"
  else if (propName.toLowerCase() == "x-offset")
    ret = "X"
  else if (propName.toLowerCase() == "extra-offset-x")
    ret = "X"
  else if (propName.toLowerCase() == "extra-offset")
    ret = "XY"
  else if (propName.toLowerCase() == "padding")
    ret = "Y"
  else if (propName.toLowerCase() == "staff-padding")
    ret = "Y"
  else if (propName.toLowerCase() == "outside-staff-padding")
    ret = "Y"
  else {
    a = null
    logError("[BUG/MISSING] getAxisOfProp error. Please report this\n"+a[1])

    ret = ""
  }
  return ret
}

function isAbsValProp(propName) {

    return ((propName == "padding") ||
            (propName == "staff-padding") ||
            (propName == "outside-staff-padding"))
}

const initPropFuncs = {
  positions: function func(grob) {
    initPositions(grob, "positions")
  },
  cpts: function func(grob) {
    initShape(grob, "cpts")
  },
  "extra-offset": function func(grob) {
    initXYPlacement(grob, "extra-offset")
  },
  "extra-offset-x": function func(grob) {
    initXYPlacement(grob, "extra-offset-x")
  },
  "extra-offset-y": function func(grob) {
    initXYPlacement(grob, "extra-offset-y")
  },
  "x-offset": function func(grob) {
    initXYPlacement(grob, "X-offset")
  },
  "y-offset": function func(grob) {
    initXYPlacement(grob, "Y-offset")
  },
  "shorten-pair": function func(grob) {
    initShortenPair(grob, "shorten-pair")
  },
  "pads": function func(grob) {
    initOSOPadder(grob, "pads")
  },
  "padding": function func(grob) {
    initXYPlacement(grob, "padding")
  },
  "staff-padding": function func(grob) {
    initXYPlacement(grob, "staff-padding")
  },
  "outside-staff-padding": function func(grob) {
    initXYPlacement(grob, "outside-staff-padding")
  }
}

const manipulatePropFuncs = {
  positions: function func() {
    manipulatePositions()
  },
  cpts: function func() {
    manipulateShape()
  },
  "extra-offset": function func() {
    manipulateXYPlacement()
  },
  "extra-offset-x": function func() {
    manipulateXYPlacement()
  },
  "extra-offset-y": function func() {
    manipulateXYPlacement()
  },
  "x-offset": function func() {
    manipulateXYPlacement()
  },
  "y-offset": function func() {
    manipulateXYPlacement()
  },
  "pads": function func() {
    manipulateOSOPadder()
  },
  "shorten-pair": function func() {
    manipulateShortenPair()
  },
  "padding": function func() {
    manipulateXYPlacement()
  },
  "staff-padding": function func() {
    manipulateXYPlacement()
  },
  "outside-staff-padding": function func() {
    manipulateXYPlacement()
  }
}

const updateLilyFileFuncs = {
  positions: function func(grob) {
    updateLilyFileForPositions(grob)
  },
  cpts: function func(grob) {
    updateLilyFileForShape(grob)
  },
  "extra-offset": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  },
  "extra-offset-x": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  },
  "extra-offset-y": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  },
  "x-offset": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  },
  "y-offset": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  },
  "pads": function func(grob) {
    updateLilyFileForOSOPadder(grob)
  },
  "shorten-pair": function func(grob) {
    updateLilyFileForShortenPair(grob)
  },
  "padding": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  },
  "staff-padding": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  },
  "outside-staff-padding": function func(grob) {
    updateLilyFileForXYPlacement(grob)
  }
}

function mouseOverModifiableElm(elm) {

    elm.setAttribute("color", "cyan")
    elm.style.cursor = "pointer"

}

function pointsArrToStr(points) {

  pointsStr = ''
  for (var i = 0; i < points.length; i++) {
    pointsStr += points[i] + ' '
  }
  return pointsStr.substring(0, pointsStr.length - 1)

}

function coordsToStr(coords) {

  return coords[0] + ' ' + coords[1]

}

function setCoords(pointsArr, index, x, y) {

  pointsArr[index] = x
  pointsArr[index + 1] = y

}

function setX(pointsArr, index, x) {

  pointsArr[index] = x

}

function setY(pointsArr, index, y) {

  pointsArr[index + 1] = y

}

function getShapePoints(node) {

  //TODO: make generic
  //TODO: get control points of path from lily's expr
  arr = []
  if (node.getAttribute('points'))
    arr = node.getAttribute('points').split(' ')

  for (var i = 0; i < arr.length; i++)
    arr[i] = +(Number(arr[i])).toFixed(3)

  return arr

}

function hasTranslateCoords(node) {

  var ret = false
  if (node.getAttribute('transform'))
    ret = true

  return ret
}

//TODO: this is unsafe, because it doesn't return null when "transform" is not set
function getTranslateCoordsDeprecated(node) {

  var arr = ['0', '0']
  if (node.getAttribute('transform')) {
    var transf = node.getAttribute('transform')
    // TODO: check backspaces?
    // TODO: check if it doesn't have transform attr?
    arr[0] = transf.replace('translate(', '').split(',')[0]
    arr[1] = transf.split(',')[1].trim().replace(')', '').split(' ')[0]
  }

  return arr

}

function getTranslateCoords(node) {

  if (node.getAttribute('transform')) {
    var arr = ['0', '0']
    var transf = node.getAttribute('transform')
    arr[0] = transf.replace('translate(', '').split(',')[0]
    arr[1] = transf.split(',')[1].trim().replace(')', '').split(' ')[0]
    return arr
  }
  else
    return null
}

function setTranslateCoords(node, coords) {

  token1 = 'translate(' + coords[0] + ',' + coords[1] + ')'
  //TODO: use a SAFER parse
  token2 = node.getAttributeNS(null, 'transform').split(')')[1]
  if (token2)
    token2 += ')'
  node.setAttributeNS(null, 'transform', token1 + token2)

}

function logPointsCoords(arr) {

  outStr = ''
  q = 1
  for (var i = 0; i < arr.length - 1; i = i + 2) {
    outStr += "pt" + (q++) + " (x=[" + (+(Number(arr[i]))).toFixed(3) + "], y=[" +
              (+(Number(arr[i + 1]))).toFixed(3) + "]) "
  }

  logInfo(outStr)

}

function getAxisOfProps(props) {

    var xAxis = ""
    var yAxis = ""
    if (props.endsWith(';'))
      props = props.substring(0, props.length -1)
    var propsArr = props.split(';')
    for (var i = 0; i < propsArr.length; i++) {
      if (getAxisOfProp(propsArr[i]) == "X")
        xAxis = "X"
      else if (getAxisOfProp(propsArr[i]) == "Y")
        yAxis = "Y"
      else if (getAxisOfProp(propsArr[i]) == "XY") {
        xAxis = "X"
        yAxis = "Y"
      }
    }

    return xAxis+yAxis
}

function shiftPoint(points, index, shX, shY) {

  points[index * 2] = Number(points[index * 2]) + Number(shX)
  points[index * 2 + 1] = Number(points[index * 2 + 1]) + Number(shY)

}

function shiftPoints(points, shX, shY) {

  for (var i = 0; i < points.length - 1; i = i + 2)
    shiftPoint(points, i, shX, shY)

}

function shiftPoints(points, shifts) {

  for (var i = 0; i < points.length - 1; i = i + 2) {
    points[i] = Number(points[i]) - Number(shifts[i])
    points[i + 1] = Number(points[i + 1]) + Number(shifts[i + 1])
  }

}

function setAbsCoords(node, pointList) {

  //TODO Ugly parsering, replace with a proper and safer one
  transf = node.getAttribute('transform')

  if (transf == null) {
    transf = node.parentNode.getAttribute('transform')
    node.parentNode.removeAttribute('transform')
  }

  // TODO: check backspaces?
  // TODO: check if it doesn't have transform attr?
  translateX = transf.replace('translate(', '').split(',')[0]
  translateY = transf.split(',')[1].trim().replace(')', '')

  for (var i = 0; i < pointList.length - 1; i = i + 2) {
    pointList[i] = Number(pointList[i]) + Number(translateX)
    pointList[i + 1] = Number(pointList[i + 1]) + Number(translateY)
  }

}

function manipulateProperty() {

  if(txtEditor())
    if(txtEditor().getOption("readOnly"))
      return

  checkAndRemoveMenus(true)
  if (!currGrob)
    return
  //txtEditor().blur()
  var props = currGrob.getAttribute('associatedtoprops').split(';')
  manipulatePropFuncs[props[0].toLowerCase()]()
  jssvgMouseActionTriggered = true

}

function unselectProperty() {

  if (!currGrob)
    return
  var props = currGrob.getAttribute('associatedtoprops').split(';')
  updateLilyFileFuncs[props[0].toLowerCase()](currGrob)

  updatePointAndClickPositions(false)

  currGrob = null

}

function drawLine(x1, y1, x2, y2, strokeWidth, color, insertBefore = false) {

  var svgns = "http://www.w3.org/2000/svg"
  var line = document.createElementNS(svgns, 'line')
  line.setAttributeNS(null, 'x1', x1)
  line.setAttributeNS(null, 'y1', y1)
  line.setAttributeNS(null, 'x2', x2)
  line.setAttributeNS(null, 'y2', y2)
  line.setAttributeNS(null, 'stroke', color)
  line.setAttributeNS(null, 'stroke-width', strokeWidth)
  if (insertBefore)
    rootSVGNode().insertBefore(line, rootSVGNode().firstChild)
  else
    rootSVGNode().appendChild(line)
  return line

}

function createInteractiveRect(x, y, w, h, color) {

  var svgns = "http://www.w3.org/2000/svg"
  var rect = document.createElementNS(svgns, 'rect')
  rect.setAttributeNS(null, 'x', x)
  rect.setAttributeNS(null, 'y', y)
  rect.setAttributeNS(null, 'width', w)
  rect.setAttributeNS(null, 'height', h)
  rect.setAttributeNS(null, 'fill', color)
  rect.setAttribute('onmouseover',
                    'this.setAttributeNS(null, "fill", "cyan");'+
                    'this.style.cursor = "pointer"')
  rect.setAttribute('onmouseout',
                    'this.setAttributeNS(null, "fill", "'+color+'")')
  rootSVGNode().appendChild(rect)
  return rect

}

function getScale() {

  var ret = {
    x: 0,
    y: 0
  }
  var scaleX = svgViewBox().split(' ')[2] / svgWidth()
  var scaleY = svgViewBox().split(' ')[3] / svgHeight()
  ret.x = scaleX
  ret.y = scaleY
  return ret

}

function getSVGCoords() {
  return currCoordsInSVGUnits
}

function getMouseCoordsOnSVG() {
  return currMouseCoordsOnSVG
}

function coordsCorrection(aobj) {

  var currOffset = {
    x: 0,
    y: 0
  }
  var newOffset = {
    x: 0,
    y: 0
  }

  if (aobj !== null) {

    if (aobj.scrollLeft != 0) {
      currOffset.x = aobj.scrollLeft
    }

    if (aobj.scrollTop) {
      currOffset.y = aobj.scrollTop
    }

    if (aobj.offsetLeft) {
      currOffset.x -= aobj.offsetLeft
    }

    if (aobj.offsetTop) {
      currOffset.y -= aobj.offsetTop
    }

    //if (aobj.parentNode !== undefined) {
    //  newOffset = coordsCorrection(aobj.parentNode)
    //}

    currOffset.x = currOffset.x + newOffset.x
    currOffset.y = currOffset.y + newOffset.y
  }

  //console.log(currOffset)
  return currOffset

}

function mouseOutModifiableElm(node) {

  node.setAttribute("color", editableObjectsColor)
  //document.getElementById("lilyinputfile").blur()

}

//TODO: clean noisy code
function checkAndRemoveMenus (doCheck) {

  mouseOverMenu = false
  menu = document.getElementById("jsobjsmenu")
  if (menu) {
    menuRect = document.getElementById("jsobjsmenu_rect")
    menuRectX1 = Number(menuRect.getAttributeNS(null, "x"))
    menuRectY1 = Number(menuRect.getAttributeNS(null, "y"))
    menuRectX2 = menuRectX1 + Number(menuRect.getAttributeNS(null, "width"))
    menuRectY2 = menuRectY1 + Number(menuRect.getAttributeNS(null, "height"))
    // ad an extra margin
    menuRectX1 = menuRectX1 - menuRectX1/(10*currZoom())
    menuRectX2 = menuRectX2 + menuRectX2/(10*currZoom())
    menuRectY1 = menuRectY1 - menuRectY1/(10*currZoom())
    menuRectY2 = menuRectY2 + menuRectY2/(10*currZoom())

    if ((getSVGCoords().x >= menuRectX1) && (getSVGCoords().x <= menuRectX2) &&
        (getSVGCoords().y >= menuRectY1) && (getSVGCoords().y <= menuRectY2))
      mouseOverMenu = true
  }

  mouseOverSubMenu = false
  submenu = document.getElementById("jsobjssubmenu")
  if (submenu) {
    subMenuRect = document.getElementById("jsobjssubmenu_rect")
    subMenuRectX1 = Number(subMenuRect.getAttributeNS(null, "x"))
    subMenuRectY1 = Number(subMenuRect.getAttributeNS(null, "y"))
    subMenuRectW = Number(subMenuRect.getAttributeNS(null, "width"))
    subMenuRectX2 = subMenuRectX1 + subMenuRectW
    subMenuRectY2 = subMenuRectY1 + Number(subMenuRect.getAttributeNS(null, "height"))
    if ((getSVGCoords().x >= subMenuRectX1) && (getSVGCoords().x <= subMenuRectX2) &&
        (getSVGCoords().y >= subMenuRectY1) && (getSVGCoords().y <= subMenuRectY2))
        mouseOverSubMenu = true
  }

  if (!doCheck || !(mouseOverMenu || mouseOverSubMenu)) {
    if (menu)
      rootSVGNode().removeChild(menu)
    if (submenu)
      rootSVGNode().removeChild(submenu)
  }

}

function addMouseListenersToSVGMenu() {

  svgsubmenus = document.querySelectorAll(".svgsubmenu")
  for (var i = 0; i < svgsubmenus.length; i++) {
    svgsubmenus[i].addEventListener("click", function () {
      li = event.target
      addJsTxtItem('', selectedMenuItem.innerHTML, li.innerHTML, -1)
      document.getElementById("svgmenucontainer").style.display = "none"
    })
  }

  document.getElementById("svgmenu").addEventListener("mouseout", function () {
    container = document.getElementById("svgmenucontainer")
    svgsubmenus = document.querySelectorAll(".svgsubmenu")
    svgsubmenu = null
    for (var i = 0; i < svgsubmenus.length; i++) {
      if (window.getComputedStyle(svgsubmenus[i]).display != "none") {
        svgsubmenu = svgsubmenus[i]
        break
      }
    }

    svgmenu = document.getElementById("svgmenu")

    if (svgsubmenu == null && window.getComputedStyle(svgmenu).display == "none") {
      container.style.display = "none"
      return
    }

    if ((window.getComputedStyle(svgmenu).display == "none" &&
        window.getComputedStyle(svgsubmenu).display == "none")) {
      container.style.display = "none"
    }

  })

  svgmenuitems = document.querySelectorAll("#svgmenu li")
  for (var i = 0; i < svgmenuitems.length; i++) {
    svgmenuitems[i].addEventListener("mouseenter", function( event ) {
      if(event.target.querySelector("div")) {
        selectedMenuItem = event.target.querySelector("div")
        adjustSubMenuPositions()
      }
    })
  }

  //document.getElementById("svgmenu").addEventListener("mouseover", adjustSubMenuPositions() })

}

function adjustSubMenuPositions() {

    svgmenu = document.getElementById("svgmenu")
    svgsubmenus = document.querySelectorAll(".svgsubmenu")
    svgsubmenu = null

    submenuidx = 0
    for (var i = 0; i < svgsubmenus.length; i++) {
      if (window.getComputedStyle(svgsubmenus[i]).display != "none") {
        svgsubmenu = svgsubmenus[i]
        break
      }
      submenuidx++
    }

    if (svgsubmenu == null)
      return

    svgsubmenuNumOfElems = svgsubmenu.querySelectorAll("li").length

    var y = getMouseCoordsOnSVG().y
    var yRel = y

    var bottomY = graphscorepanel.clientHeight
    svgsubmenu.style.top = "-1px"

    //TODO FIXME: all this is a ugly static check (I don't have time to implement
    // a generic procedure)
    var style = getComputedStyle(document.body)
    var menuItemHeight = style.getPropertyValue('--svgmenuitemheight').replace("px", "")
    var submenuHeight = menuItemHeight
    if (submenuidx == 0 || submenuidx == 2)
      submenuHeight = menuItemHeight * 8
    if (bottomY - yRel < submenuHeight) {
      shUp = 0
      if (submenuidx == 0)
        shUp = 0 - (svgsubmenuNumOfElems - 6) *menuItemHeight - 1
      if (submenuidx == 2)
        shUp = 0 - (svgsubmenuNumOfElems - 4) *menuItemHeight - 1
      svgsubmenu.style.top = shUp + "px"
    }
}

function showJsObjsMenu(textPos) {

  if (panZoomOn() || isSVGReadOnly())
    return

  graphscorepanel = document.getElementById("graphscorepanel")
  svgmenucontainer = document.getElementById("svgmenucontainer")
  svgmenu = document.getElementById("svgmenu")

  var x = getMouseCoordsOnSVG().x
  var y = getMouseCoordsOnSVG().y
  var xRel = x
  var yRel = y

  svgmenucontainer.style.display = "block"
  svgmenu.style.top = "0px"
  svgmenu.style.left = "0px"

  var style = getComputedStyle(document.body)
  var menuItemHeight = style.getPropertyValue('--svgmenuitemheight')
  //document.querySelector("#svgmenu > li").style.height = menuItemHeight
  //svgmenucontainer.style.lineHeight = menuItemHeight

  var menuItemHeightNum = Number(menuItemHeight.replace("px", ""))
  var menuItemsCount = 6
  var menuHeight = menuItemHeightNum * menuItemsCount
  var menuWidth = Number(window.getComputedStyle(svgmenu).width.replace("px", ""))
  var submenuWidth = menuWidth
  document.querySelector("#svgmenucontainer > li").style.height = menuHeight
  var bottomY = graphscorepanel.clientHeight
  var rightX = graphscorepanel.clientWidth

  var totShift = 0

  if (rightX - xRel < menuWidth) {
    overFlowX = xRel + menuWidth - rightX
    shiftX = Math.min(Math.min(xRel, menuWidth), overFlowX)
    //console.log("")
    //console.log("Il menu deborda (overflow="+overFlowX+
    //"), lo sposto a sinistra (shift="+shiftX+")")
    totShift = shiftX
  }

  if (bottomY - yRel < menuHeight) {
    // 5 ---> makes sure the border of the menu doesn't touch the
    // scrollbar
    y -= menuHeight - bottomY + yRel + 5
  }

  svgsubmenus = document.querySelectorAll(".svgsubmenu")
  for (var i = 0; i < svgsubmenus.length; i++) {
    svgsubmenus[i].style.height = menuItemHeight
    svgsubmenus[i].style.right = "calc(0px - var(--svgmenuwidth))"
  }
  var subMenuAtLeft = false

  if (rightX - xRel < (menuWidth + submenuWidth)) {

    //console.log("")
    //console.log("I due menu debordano")
    expectedOverflowXWithSubmenuAtRight = xRel + menuWidth + submenuWidth - rightX
    //console.log("Overflow con submenu alla destra="+expectedOverflowXWithSubmenuAtRight)
    shiftXWithSubMenuAtRight =  Math.min(xRel, menuWidth, expectedOverflowXWithSubmenuAtRight)
    expectedOverflowXWithShiftAndSubmenuAtRight = expectedOverflowXWithSubmenuAtRight - shiftXWithSubMenuAtRight
    //console.log("Overflow con shift e submenu alla destra="+
    //expectedOverflowXWithShiftAndSubmenuAtRight+" (shift="+shiftXWithSubMenuAtRight+")")

    var maybeSubmenuAtLeft = false
    expectedOverflowXWithSubmenuAtLeft = xRel + menuWidth - rightX
    //if (expectedOverflowXWithSubmenuAtLeft > 0)
    //  console.log("Overflow con submenu alla sinistra="+expectedOverflowXWithSubmenuAtLeft)
    //else
    //  console.log("Con submenu a sinistra non c'è overflow a destra")
    shiftXWithSubMenuAtLeft =  Math.min(xRel, menuWidth, expectedOverflowXWithSubmenuAtLeft)

    if (xRel - submenuWidth - shiftXWithSubMenuAtLeft > 0)
      maybeSubmenuAtLeft = true
    //else
    //  console.log("Submenu a sinistra causa overflow a sinistra")

    totShift = shiftXWithSubMenuAtRight

    if (maybeSubmenuAtLeft) {
      expectedOverflowXWithShiftAndSubmenuAtLeft = expectedOverflowXWithSubmenuAtLeft - shiftXWithSubMenuAtLeft
      //console.log("Overflow con shift e submenu alla sinistra="+
      //expectedOverflowXWithShiftAndSubmenuAtLeft+" (shift="+shiftXWithSubMenuAtLeft+")")
      if (expectedOverflowXWithShiftAndSubmenuAtLeft < expectedOverflowXWithShiftAndSubmenuAtRight) {
        totShift = shiftXWithSubMenuAtLeft
        for (var i = 0; i < svgsubmenus.length; i++)
          svgsubmenus[i].style.right = "calc(-2px + var(--svgmenuwidth))"
      }
    }
  }

  svgmenucontainer.style.left = x - totShift - 10  + graphscorepanel.scrollLeft
  svgmenucontainer.style.top = y - 10  + graphscorepanel.scrollTop

}

function setInitTextPositionForGrob(n1) {
  for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
    if (n2.nodeName == 'a' && n2.getAttribute('xlink:href')) {
       //TODO make safer ?
      if (n2.getAttribute('xlink:href').includes('.ly:')) {
        rowColTkns = n2.getAttribute('xlink:href').split('.ly:')[1].split(':')
        row = Number(rowColTkns[0])
        col = Number(rowColTkns[1])
        txtRows = getLyFileContent().split('\n')
        pos = 0
        for (var i = 0; i < row - 1; i++) {
          //This check prevents when Lilypond gives erroneous value to the point and click
          if (txtRows[i] != null)
            pos += txtRows[i].length + 1
        }
        pos += col
        //console.log(pos)
        n2.setAttribute('textpos', pos)
        n2.removeAttribute('xlink:href')

        //n2.setAttribute('onmousedown', 'showJsObjsMenu(this.getAttribute("textpos"))')
        n2.setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"));')
        //FIXME: doesn't work properly on Firefox. If I set it, the text scrolls at each cursor move,
        // which is not good. Then it's currently disabled.

        n2.setAttribute('onmouseover', 'this.style.cursor = "pointer"')
        //n2.setAttribute('onmouseout', 'document.getElementById("lilyinputfile").blur()')
      }
    }
  }
}

function removeLinksAndSetTextPos(n1) {
  for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
    if (n2.nodeName == 'a') {
      n1.setAttribute('textpos', n2.getAttribute('textpos'))
      n2.replaceWith(...n2.childNodes)
    }
  }
}

function getRef(groupNode, propName) {

  var ref = null
  var coordIdx = 0
  var axis = getAxisOfProp(propName)
  if (axis.toLowerCase() == 'y')
    coordIdx = 1

  if (isAbsValProp(propName)) {
    var markersY = getSortedMarkersYs(groupNode)
    if (groupNode.getAttribute('y-direction') == '-1')
      ref = markersY[0]
    else
      ref = markersY[markersY.length - 1]

    //console.log(markersY)
  }
  else {
    var gid = groupNode.getAttribute(propName.toLowerCase()+'-propid')

    var refPointMarker = document.querySelectorAll('svg ['+axis.toLowerCase()+'-ref-of-'+gid+'^="true"]')[0]

    for (var child = refPointMarker.firstChild; child !== null; child = child.nextSibling) {

      if (child.nodeName == 'line') {
        ref = Number(getTranslateCoordsDeprecated(child)[coordIdx])
      }

      if (child.nodeName == 'g') {
        if (getTranslateCoords(child) != null) {
          ref = getTranslateCoords(child)[coordIdx]
        }
        else {
          for (var child2 = child.firstChild; child2 !== null; child2 = child2.nextSibling) {
            if (child2.nodeName == 'line') {
              ref = Number(getTranslateCoordsDeprecated(child2)[coordIdx])
            }
          }
        }
      }

    }
  }

  if (ref == null)
    logError("[BUG/MISSING] getRef: ref not found. Please report this")

  return ref

}

function distanceOfNodeFromRefPoint(node, propName) {

  var distance = null
  var coordIdx = 0
  var axis = getAxisOfProp(propName)
  if (axis.toLowerCase() == 'y')
    coordIdx = 1
  var refPointCoord = null

  if (isAbsValProp(propName)) {
    var markersY = getSortedMarkersYs(node.parentNode)
    if (node.parentNode.getAttribute('y-direction') == '-1')
      refPointCoord = markersY[0]
    else
      refPointCoord = markersY[markersY.length - 1]
  }
  else
    refPointCoord = getRef(node.parentNode, propName)

  distance = Math.abs(refPointCoord - Number(getTranslateCoordsDeprecated(node)[coordIdx]))

  if (distance == null)
    logError("[BUG/MISSING] distanceOfNodeFromRefPoint: distance not found. Please report this")

  return distance

}

function yPaddingOfTupletBracket(groupNode) {

  var maxY = null
  var y = null
  var pts = []
  var transY = null

  for (var child = groupNode.firstChild; child !== null; child = child.nextSibling) {

    if (child.nodeName == 'line') {
      y = Number(getTranslateCoordsDeprecated(child)[1])
      transY = y
      var x1 = Number(child.getAttributeNS(null, 'x1'))
      var y1 = Number(child.getAttributeNS(null, 'y1'))
      var x2 = Number(child.getAttributeNS(null, 'x2'))
      var y2 = Number(child.getAttributeNS(null, 'y2'))

      pts.push([x1, y1])
      pts.push([x2, y2])

      if (maxY == null || y1 > maxY)
        maxY = y1
      if (maxY == null || y2 > maxY)
        maxY = y2
    }
  }

  y = maxY + y

  var ptLeft = null
  var ptRight = null

  for (var i = 0; i < pts.length; i++) {
    if (!ptLeft || pts[i][0] < ptLeft[0])
      ptLeft = pts[i]
    if (!ptRight || pts[i][0] > ptLeft[0])
      ptRight = pts[i]

  }

  var hasAngle = ptLeft[1] != ptRight[1]

  //check if the bracket has an angle:
  if (hasAngle) {
    logError("[ERROR]???")
    return y
  }
  else {
    return y + 0.08
  }

}

function sortNumber(a, b) {
  return a - b;
}

function getSortedMarkersYs(groupNode) {

  var markersYs = []
  for (var n1 = groupNode.firstChild; n1 !== null; n1 = n1.nextSibling) {
    if (isMarker(n1)) {
      for (var n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
        if (n2.nodeName == 'g') {
          //TODO? USE SCALE?? (I used Math.abs(), instead)
          for (var n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling) {
            if (n3.nodeName == 'line' &&
                //TODO create "isHorizontalLine()" or similar function
                (n3.getAttributeNS(null, 'x1') != (n3.getAttributeNS(null, 'x2')))) {
              var markerY = Number(getTranslateCoordsDeprecated(n3)[1])
              markersYs.push(Math.abs(markerY))
            }
          }

          // 2.22.0 compatibility
          for (var n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling)
          for (var n4 = n3.firstChild; n4 !== null; n4 = n4.nextSibling) {
            if (n4.nodeName == 'line' &&
                //TODO create "isHorizontalLine()" or similar function
                (n4.getAttributeNS(null, 'x1') != (n4.getAttributeNS(null, 'x2')))) {
              var translCoords = getTranslateCoords(n4)

              //2.22.0 compatibility
              if (getTranslateCoords(n4) == null)
                translCoords = getTranslateCoords(n4.parentNode)
              var markerY = Number(translCoords[1])
              markersYs.push(Math.abs(markerY))
            }
          }
        }
      }
    }
  }
  markersYs = markersYs.sort(sortNumber)
  return markersYs
}

function isMarker(node) {

  return (node.nodeName == 'g' &&
          node.getAttributeNS(null, 'color') &&
          ((node.getAttributeNS(null, 'color') == "rgb(12.3000%, 45.6000%, 78.9000%)") ||
          (node.getAttributeNS(null, 'color') == "rgb(98.7000%, 12.3000%, 45.6000%)")))

}

function isOsPadder(node) {

  return (node.nodeName == 'g' &&
          node.getAttributeNS(null, 'color') &&
          ((node.getAttributeNS(null, 'color') == "rgb(91.2000%, 93.4000%, 95.6000%)")))

}

function refCoordinateOfGrobForGivenProp(groupNode, propName) {

  var axis = getAxisOfProp(propName)
  var minX = null
  var minY = null

  //CHECK if the grob has a procedure for calculating that, otherwise fall in default
  var groupCoord = refCoordinateOfGrobForGivenPropSpec(groupNode, propName)

  if (groupCoord == null) {

    //DEFAULT: return the minimum X/Y of all the nodes inside the groupnode
    for (var child = groupNode.firstChild; child !== null; child = child.nextSibling) {
      if (child.nodeName == 'text' || child.nodeName == 'g' || child.nodeName == 'path' || child.nodeName == 'line') {

        if (isMarker(child) || isOsPadder(child))
          continue

        coords = getTranslateCoordsDeprecated(child)
        coords[0] = +Number(coords[0])
        coords[1] = +Number(coords[1])

        if (minX == null || coords[0] < minY)
          minX = coords[0]

        if (minY == null || coords[1] < minY)
          minY = coords[1]

      }
    }

    if (axis == 'Y')
      groupCoord = minY
    else
      groupCoord = minX

  }

  return groupCoord

}

function distanceOfGrobFromRefPoint(groupNode, propName, needPrecision = true) {

    var refPointCoord = null
    var distance = null
    var groupCoord = null

    groupCoord = refCoordinateOfGrobForGivenProp(groupNode, propName)
    refPointCoord = getRef(groupNode, propName)
    /*
    if (!needPrecision) {
        groupCoord = Math.floor(groupCoord * 100)/100
        refPointCoord = Math.floor(refPointCoord * 100)/100
    }*/

    //drawLine(0, groupCoord, 30, groupCoord, 0.1, "green")
    distance = Math.abs(refPointCoord - groupCoord)

    if (isAbsValProp(propName) && groupNode.getAttribute('y-direction') == '1') {
      distance = Number(distance)// - Number(0.09)
    }
    else if (isAbsValProp(propName) && groupNode.getAttribute('y-direction') == '-1') {
      distance = Number(distance)// - Number(0.09)
    }

    //TODO FIXME: rounded too much! (But it seems necessary because Lilypond rounds too (?))
    distance = Math.ceil(distance.toFixed(2)*10)/10
    //console.log("DISTCEIL === "+distance)

    if (groupCoord == null)
      logError("[BUG/MISSING] distanceOfGrobFromRefPoint: groupCoord not found. Please report this")

    if (distance == null)
      logError("[BUG/MISSING] distanceOfGrobFromRefPoint: distance not found. Please report this")

    return distance
}

function getCurrentLilyDirection(groupNode, propName) {

  var ret = null
  var maxX = null
  var minX = null
  var maxY = null
  var minY = null
  var axis = getAxisOfProp(propName)

  for (var child = groupNode.firstChild; child !== null; child = child.nextSibling) {

    if (child.nodeName == 'text' || child.nodeName == 'g' || child.nodeName == 'path' || child.nodeName == 'line') {

      coords = getTranslateCoordsDeprecated(child)
      coords[0] = +Number(coords[0]).toFixed(3)
      coords[1] = +Number(coords[1]).toFixed(3)

      if (maxX == null || coords[0] > maxY)
        maxX = coords[0]

      if (minX == null || coords[0] < minY)
        minX = coords[0]

      if (maxY == null || coords[1] > maxY)
        maxY = coords[1]

      if (minY == null || coords[1] < minY)
        minY = coords[1]

    }
  }

  var minCoord = minX
  var maxCoord = maxX
  if (axis == "Y") {
      minCoord = minY
      maxCoord = maxY
  }

  var coordRef = null
  var coordIdx = 0
  var axis = getAxisOfProp(propName)
  if (axis.toLowerCase() == 'y')
    coordIdx = 1

  var gid = groupNode.getAttribute(propName.toLowerCase()+'-propid')

  var refPointMarker = document.querySelectorAll('svg ['+axis.toLowerCase()+'-ref-of-'+gid+'^="true"]')[0]

  for (var child = refPointMarker.firstChild; child !== null; child = child.nextSibling) {
    if (child.nodeName == 'line') {
      coordRef = Number(getTranslateCoordsDeprecated(child)[coordIdx])
    }

    if (child.nodeName == 'g') {
      if (child.getAttribute("transform") != null)
        coordRef = Number(getTranslateCoordsDeprecated(child)[coordIdx])
      else {
        for (var child2 = child.firstChild; child2 !== null; child2 = child2.nextSibling)
          if (child2.nodeName == 'line') {
            coordRef = Number(getTranslateCoordsDeprecated(child2)[coordIdx])
          }
      }
    }
  }

  //TODO FIXME not good that 'padding' is into a generic func
  if (propName == 'padding') {
      minCoord = yPaddingOfTupletBracket(groupNode)
      maxCoord = minCoord
  }

  if (axis == "Y") {
    if (coordRef < minCoord)
      ret = "-1"
    else if (coordRef > maxCoord)
      ret = "1"
  }
  else {
    if (coordRef < minCoord)
      ret = "1"
    else if (coordRef > maxCoord)
      ret = "-1"
  }

  if ((coordRef > minCoord) && (coordRef < maxCoord))
    logError("[BUG/MISSING] getCurrentLilyDirection: uknown direction. Please report this")

  return ret
}

function createMenuItem(x, y, w, h, color, str, id, onmouseoverFunc, onclickFunc, type) {

  var svgns = "http://www.w3.org/2000/svg"
  var g = document.createElementNS(svgns, 'g')
  g.setAttributeNS(null, 'id', id)
  g.setAttributeNS(null, 'onclick', onclickFunc)
  g.setAttribute('locked', 'false')
  var rect = document.createElementNS(svgns, 'rect')
  rect.setAttributeNS(null, 'x', x)
  rect.setAttributeNS(null, 'y', y)
  rect.setAttributeNS(null, 'height', h)
  rect.setAttributeNS(null, 'width', w)
  rect.setAttributeNS(null, 'fill', color)
  rect.setAttributeNS(null, 'stroke', 'black')
  rect.setAttribute('style', 'cursor: pointer')
  rect.setAttributeNS(null, 'stroke-width', 0.1)
  rect.setAttribute('id', id + '_rect')
  g.appendChild(rect)
  var txt = document.createElementNS(svgns, 'text')
  txt.setAttributeNS(null, 'x', x + w / 2)
  txt.setAttributeNS(null, 'y', y + h / 2)
  txt.setAttributeNS(null, 'font-weight', 'bold')
  txt.setAttributeNS(null, 'font-size', (45 * h / 100))
  txt.setAttributeNS(null, 'dominant-baseline', 'middle')
  txt.setAttributeNS(null, 'text-anchor', 'middle')
  moverAttr = 'document.getElementById("'+id+'_rect").setAttributeNS(null, "fill", "cyan");'+onmouseoverFunc
  if (type == 'menu') {
    moverAttr = moverAttr + ';lastMenuItemY = '+y+';lastMenuItemHeight = '+h+
                ';lastMenuItemX = '+x+';lastMenuItemWidth = '+w
  }

  moutAttr = 'document.getElementById("'+id+'_rect").setAttributeNS(null, "fill", "'+color+'")'

  txt.setAttributeNS(null, 'onmouseover', moverAttr)
  txt.setAttributeNS(null, 'onmouseout', moutAttr)
  txt.setAttribute('style', 'cursor: pointer')
  txt.innerHTML = str
  txt.setAttribute('id', id + '_text')
  g.appendChild(txt)
  return g

}

function rootSVGNode() {
  return document.querySelector('svg')
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

function setDefaultSVGImage() {

  defaultimg = document.getElementById("defaultimg")
  svgcontainer = document.getElementById("svgcontainer")
  graphscorepanel = document.getElementById('graphscorepanel')
  svgcontainer.style.display = "none"
  defaultimg.style.display = "flex"
  graphscorepanel.style.display = "flex"
  graphscorepanel.style.background = 'white'
  setSVGOrigWidth(null)
  setSVGOrigHeight(null)
  setSVGOverflow('hidden')

}

function copySVGNode(svgElemOrigin, svgElemCopy) {

  svgContent = svgElemOrigin.innerHTML
  svgElemCopy.innerHTML = svgContent
  svgElemCopy.setAttribute("width", svgElemOrigin.getAttribute("width"))
  svgElemCopy.setAttribute("height", svgElemOrigin.getAttribute("height"))
  svgElemCopy.setAttribute("viewBox", svgElemOrigin.getAttribute("viewBox"))

}

function isThereAJSSVGFunctInLyFileForProp(id, prop) {

  let m;
  ret = false
  //var grobIdToken = parseInt(grob.getAttribute('id').split('_')[1])
  while ((m = jsSVGRegex.exec(getLyFileContent())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === jsSVGRegex.lastIndex) {
      jsSVGRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        if (match.includes('"' + id + '"') &&
            match.toUpperCase().includes('"' + prop.toUpperCase() + '"')) {
          ret = true
        }
      }
    })
  }
  return ret

}

function setDimsInOrigUnits() {

  if (svgWidth().endsWith("mm")) {
    origUnit = "mm"
    svgWidthInOrigUnit = svgWidth().replace("mm","")
    svgHeightInOrigUnit = svgHeight().replace("mm","")
  }
  else if (svgWidth().endsWith("cm")) {
    origUnit = "cm"
    svgWidthInOrigUnit = svgWidth().replace("cm","")
    svgHeightInOrigUnit = svgHeight().replace("cm","")
  }
  else if (svgWidth().endsWith("in")) {
    origUnit = "in"
    svgWidthInOrigUnit = svgWidth().replace("in","")
    svgHeightInOrigUnit = svgHeight().replace("in","")
  }
  //else
  //  alert("setDimsInOrigUnits() error, please report this")

}

//This functions converts the dimension unit in the SVG file (mm, cm or in) to staff spaces
function origUnitsToStaffSpaces(val) {
  return svgWidth()*getScale().x*val/svgWidthInOrigUnit
}

function staffSpacesToOrigUnits(val) {
  return val*svgWidthInOrigUnit/(svgWidth()*getScale().x)
}

function initSVGEditableStuff(content) {

  var svgdraw = document.getElementById("svgdraw")
  var svgcontainer = document.getElementById("svgcontainer")
  var graphscorepanel = document.getElementById('graphscorepanel')
  defaultimg = document.getElementById("defaultimg")
  defaultimg.style.display = "none"
  svgcontainer.style.display = "block"
  graphscorepanel.style.display = "block"
  var prevWidth = svgWidth()
  var prevHeight = svgHeight()
  copySVGNode(htmlToElement(content), svgdraw)
  document.querySelectorAll('*').forEach(function(node) {
    setInitTextPositionForGrob(node)
  })
  staves = document.querySelectorAll('svg [isstaff^="true"]')
  for (var i = 0; i < staves.length; i++) {

      if (staves[i].getAttribute("lilypondversion")!= null) {
        lilypondVersion = staves[i].getAttribute("lilypondversion")
      }

      if (staves[i].getAttribute("lilypondversion")!= null) {
        staffSpaceForRuler = Number(staves[i].getAttribute("staffspace"))
      }

      staffY = null
      for (n2 = staves[i].firstChild; n2 !== null; n2 = n2.nextSibling) {
        if (n2.nodeName == 'line') {
          lineY = Number(getTranslateCoordsDeprecated(n2)[1])
          if (!staffY || lineY < staffY)
            staffY = lineY
          staffSymbolThickness = Number(n2.getAttributeNS(null, "stroke-width"))
        }
      }

      stavesY.push(staffY)
  }

  var makeGrid = document.querySelectorAll('svg [gridify^="true"]')
  if (makeGrid.length > 0) {

    var gridColor = "lightgrey"
    var gridstep = 4
    if (makeGrid[0].getAttribute("gridstep"))
      gridstep = Number(makeGrid[0].getAttribute("gridstep"))

    if (makeGrid[0].getAttribute("gridcolor")) {
      gridColor = makeGrid[0].getAttribute("gridcolor")
    }

    var bottomY = Number(rootSVGNode().getAttribute('viewBox').split(' ')[3])
    var rightX = Number(rootSVGNode().getAttribute('viewBox').split(' ')[2])
    var i = 0
    while (true) {
      if (gridstep*i > bottomY)
        break
      drawLine(0, gridstep*i, rightX, gridstep*i, 0.1, gridColor, true )
      i++
    }
    i = 0
    while (true) {
      if (gridstep*i > rightX)
        break
      drawLine(gridstep*i, 0, gridstep*i, bottomY, 0.1, gridColor, true )
      i++
    }

  }

  grobs = document.querySelectorAll('svg [spontinieditable^="true"]')
  for (var i = 0; i < grobs.length; i++) {
    removeLinksAndSetTextPos(grobs[i])
    propsToInit = [...grobs[i].attributes].filter(x=>x.name.includes('-propid'))

    for (var q = 0; q < propsToInit.length; q++) {
      propName = propsToInit[q].name.replace('-propid','')
      propValue = propsToInit[q].value
      if (isThereAJSSVGFunctInLyFileForProp(propValue, propName) &&
          managedProps.includes(propName))
        initPropFuncs[propName](grobs[i])
    }

  }

  markers = document.querySelectorAll('svg [spontinimarker^="true"]')
  for (var i = 0; i < markers.length; i++) {
    markers[i].setAttributeNS(null, "color", "red")
    //markers[i].setAttributeNS(null, "visibility", "hidden")
  }

  svgNode = document.querySelector('svg')
  if (svgNode) {

    setDimsInOrigUnits()

    const svgContent = svgNode.innerHTML
    var bgRectStr = "<rect width='100%' height='100%' id='bgrect' vector-effect='non-scaling-stroke'"+
             "style='fill: white; stroke: black; '/>"
    const newSvgContent = `${bgRectStr}${svgContent}`
    svgNode.innerHTML = newSvgContent

    var svg = document.querySelector("svg")
    var mustInitPanZoom = ((svgOrigWidth() != dimToPx(svgWidth())) &&
                           (svgOrigHeight() != dimToPx(svgHeight())))

    if (mustInitPanZoom) {
      setSVGOrigWidth(dimToPx(svgWidth()))
      setSVGOrigHeight(dimToPx(svgHeight()))
      svg.removeAttribute("width")
      svg.removeAttribute("height")
      graphscorepanel.style.background = svgPanelBackground
      var panelW = graphscorepanel.clientWidth
      var panelH = graphscorepanel.clientHeight
      setSVGWidth(panelW)
      setSVGHeight(panelH)
      var bgrect = document.getElementById('bgrect')
      var paneledSVGW = Math.round(bgrect.getBoundingClientRect().width)
      var paneledSVGH = Math.round(bgrect.getBoundingClientRect().height)
      setSVGWidth(paneledSVGW)
      setSVGHeight(paneledSVGH)
      var borderWidth = 2*paneledSVGH/svgOrigHeight()
      bgrect.style.strokeWidth = borderWidth+"px"
      initPanZoom(panZoomOn())
    }
    else {
      setSVGWidth(prevWidth)
      setSVGHeight(prevHeight)
    }

    initRuler()
    initAxes()
    linkSVGElementsToSVGMenu()
    setSVGReadOnly(false)

  }
}

function initAxes() {

  var axes = []
  for (var i = 0; i < 4; i++)
    axes.push(document.getElementById("axes"+i))

  if (axes[0] == null) {
    axes[0] = drawLine(0, 0, svgWidth(), 0, axesThickness, axesColor)
    axes[0].setAttribute("id", "axes0")
    axes[1] = drawLine(0, 0, 0, svgHeight(), axesThickness, axesColor)
    axes[1].setAttribute("id", "axes1")
    axes[2] = drawLine(0, 0, svgWidth(), 0, axesThickness, axesColor)
    axes[2].setAttribute("id", "axes2")
    axes[3] = drawLine(0, 0, 0, svgHeight(), axesThickness, axesColor)
    axes[3].setAttribute("id", "axes3")
    for (var i = 0; i < 4; i++)
      axes[i].setAttribute("visibility", "hidden")
  }

  var startFactor = 10
  var startPans = [startFactor, startFactor, startFactor, startFactor]
  for (var i = 0; i < 4; i++)
    if (axesPanzoomInstances[i] != null) {
      if (i == 0 || i == 2)
        startPans[i] = axesPanzoomInstances[i].getPan().y
      else
        startPans[i] = axesPanzoomInstances[i].getPan().x
      axesPanzoomInstances[i].destroy()
    }

  axesPanzoomInstances[0] = Panzoom(axes[0], {
    //contain: "inside", <--- buggy. See work-around inside "mousemove" of the svgcontainer
    disableXAxis: true,
    startY: startPans[0],
    setTransform: (svgcontainer, { x, y, scale }) => {
      // Adjust the panning according to the parent's scale
      const parentScale = panzoomInstance.getScale()
      axesPanzoomInstances[0].setStyle(
        'transform',
        `scale(${scale}) translate(${x * getScale().x  / parentScale}px,
                                    ${y * getScale().y  / parentScale}px)`
      )
    }
  })

  axesPanzoomInstances[1] = Panzoom(axes[1], {
    //contain: "inside",
    disableYAxis: true,
    startX: startPans[1],
    setTransform: (svgcontainer, { x, y, scale }) => {
      // Adjust the panning according to the parent's scale
      const parentScale = panzoomInstance.getScale()
      axesPanzoomInstances[1].setStyle(
        'transform',
        `scale(${scale}) translate(${x * getScale().x  / parentScale}px,
                                    ${y * getScale().y  / parentScale}px)`
      )
    }
  })

  axesPanzoomInstances[2] = Panzoom(axes[2], {
    //contain: "inside",
    disableXAxis: true,
    startY: startPans[2],
    setTransform: (svgcontainer, { x, y, scale }) => {
      // Adjust the panning according to the parent's scale
      const parentScale = panzoomInstance.getScale()
      axesPanzoomInstances[2].setStyle(
        'transform',
        `scale(${scale}) translate(${x * getScale().x  / parentScale}px,
                                    ${y * getScale().y  / parentScale}px)`
      )
    }
  })

  axesPanzoomInstances[3] = Panzoom(axes[3], {
    //contain: "inside",
    disableYAxis: true,
    startX: startPans[3],
    setTransform: (svgcontainer, { x, y, scale }) => {
      // Adjust the panning according to the parent's scale
      const parentScale = panzoomInstance.getScale()
      axesPanzoomInstances[3].setStyle(
        'transform',
        `scale(${scale}) translate(${x * getScale().x  / parentScale}px,
                                    ${y * getScale().y  / parentScale}px)`
      )
    }
  })

}

function initRuler() {

  var rulerLine = drawLine(0, 0, 0, 0, rulerThickness, rulerColor)
  var rulerTable = document.getElementById("rulertbl")
  rulerTable.style.visibility = "hidden"
  rulerLine.setAttribute("id", "rulerline")

}

function resetPanZoom() {

  var svgcontainer = document.getElementById("svgcontainer")
  panzoomInstance = Panzoom(svgcontainer, {
    maxScale: 500,
  })

  svgcontainer.addEventListener('panzoomchange', (event) => {
    var rulerLine = document.getElementById("rulerline")
    if (rulerLine != null)
      rulerLine.setAttributeNS(null, "stroke-width", rulerThickness/panzoomInstance.getScale())
    if (document.getElementById("axes0") != null) {
      for (var i = 0; i < 4; i++) {
        document.getElementById("axes"+i).setAttributeNS(null,
                                                         "stroke-width",
                                                         axesThickness/panzoomInstance.getScale())
      }
    }
  })

}

function initPanZoom(active) {

  if (panzoomInstance == null)
    resetPanZoom()

  if (!active)
    deactivatePanZoom()
  else
    activatePanZoom()

  var defaultimg = document.getElementById("defaultimg")
  if (defaultimg.style.display == 'none')
    setSVGOverflow(baseCtx.svgOverflow)
  else
    setSVGOverflow('hidden')
}

function activatePanZoom() {
  if (panzoomInstance != null) {
    var svg = document.querySelector("svg")
    if (svg.getAttribute("zoomeventlistener") == null)
    {
        svg.setAttribute("zoomeventlistener", "true")
        svg.addEventListener('wheel', zoomWithWheel)
        svg.addEventListener('dblclick', zoomWithDblClick)
    }
    panzoomInstance.bind()
    var svgcontainer = document.getElementById("svgcontainer")
    svgcontainer.style.cursor = "move"
  }
}

function deactivatePanZoom() {
  if (panzoomInstance != null) {
    //var svg = document.querySelector("svg")
    //{
    //  svg.removeEventListener('wheel', zoomWithWheel)
    //  svg.removeEventListener('dblclick', zoomWithDblClick)
    //}
    panzoomInstance.destroy()
    var svgcontainer = document.getElementById("svgcontainer")
    svgcontainer.style.cursor = "auto"
  }
}

function adjustScaleOnAxes(oldScale, newScale) {

  for (var i = 0; i < 4; i++) {
    var rulerPan = axesPanzoomInstances[i].getPan()
    // Adjust child starting X/Y according the new scale for panning
    axesPanzoomInstances[i].pan((rulerPan.x / oldScale) * newScale,
                            (rulerPan.y / oldScale) * newScale, {
      animate: true
    })
  }

}

function zoomWithWheel(event) {

  if (panZoomOn()) {

    var graphscorepanel = document.getElementById("graphscorepanel")
    var prevScrollLeft = graphscorepanel.scrollLeft/panzoomInstance.getScale()
    var prevScrollTop = graphscorepanel.scrollTop/panzoomInstance.getScale()
    panzoomInstance.pan(-prevScrollLeft, -prevScrollTop , {force: true, relative: true})
    graphscorepanel.scrollLeft = 0
    graphscorepanel.scrollTop = 0

    var prevScale = panzoomInstance.getScale()
    var newScale = panzoomInstance.zoomWithWheel(event, {force: true}).scale
    if (axesPanzoomInstances[0] != null)
      adjustScaleOnAxes(prevScale, newScale)

  }
}

function zoomWithDblClick(event) {

  if (panZoomOn()) {

    var graphscorepanel = document.getElementById("graphscorepanel")
    var prevScrollLeft = graphscorepanel.scrollLeft/panzoomInstance.getScale()
    var prevScrollTop = graphscorepanel.scrollTop/panzoomInstance.getScale()
    panzoomInstance.pan(-prevScrollLeft, -prevScrollTop , {force: true, relative: true})
    graphscorepanel.scrollLeft = 0
    graphscorepanel.scrollTop = 0
    var prevScale = panzoomInstance.getScale()
    newScale = 0
    if (canZoomOut)
      newScale = panzoomInstance.getScale()/dblClickZoomFactor
    else
      newScale = panzoomInstance.getScale()*dblClickZoomFactor

    panzoomInstance.zoomToPoint(newScale, event, {force: true})
    newScale = panzoomInstance.getScale()
    if (axesPanzoomInstances[0] != null)
      adjustScaleOnAxes(prevScale, newScale)
  }
}

function toggleSVGScrollbars() {

  if (panzoomInstance == null)
    return

  var newSvgOverflow = ''

  if (baseCtx.svgOverflow == 'scroll')
    newSvgOverflow = 'hidden'
  else
    newSvgOverflow = 'scroll'

  setSVGOverflow(newSvgOverflow)

  baseCtx.svgOverflow = newSvgOverflow
}

function setSVGOverflow(val) {

  var graphscorepanel = document.getElementById("graphscorepanel")
  graphscorepanel.style.overflow = val

  if (panzoomInstance != null)
    panzoomInstance.setOptions({ overflow: val })

  if (val == 'scroll')
    graphscorepanel.style.scrollbarColor = svgScrollbarColor
  else
    graphscorepanel.style.removeProperty("scrollbar-color")

}

function showJsObjsMenu_() { showJsObjsMenu(this.getAttribute("textpos")) }

function linkSVGElementsToSVGMenu() {

  var elements = Array.from(document.querySelectorAll('svg a'));
  elements.forEach(function(node) {
    if (node.getAttribute("textpos"))
      node.removeEventListener("contextmenu", showJsObjsMenu_)
      node.addEventListener("contextmenu", showJsObjsMenu_ )
      if (mobileMode) {
        node.removeEventListener("dblclick", showJsObjsMenu_)
        node.addEventListener("dblclick", showJsObjsMenu_ )
      }
  })
}

function setSVGOrigWidth(val) {
  baseCtx.svgOrigWidth_ = val
}

function setSVGOrigHeight(val) {
  baseCtx.svgOrigHeight_ = val
}

function svgOrigWidth() {
  return baseCtx.svgOrigWidth_
}

function svgOrigHeight() {
  return baseCtx.svgOrigHeight_
}

function setSVGWidth(val) {
  svgContainerCtx.document.querySelector("svg").setAttribute("width", val)
}

function svgWidth() {
  return svgContainerCtx.document.querySelector("svg").getAttribute("width")
}

function setSVGHeight(val) {
  svgContainerCtx.document.querySelector("svg").setAttribute("height", val)
}

function svgHeight() {
  return svgContainerCtx.document.querySelector("svg").getAttribute("height")
}

function svgViewBox() {
  return svgContainerCtx.document.querySelector("svg").getAttribute("viewBox")
}

function currZoom() {
  return svgContainerCtx.currZoom_
}

function setCurrZoom(val) {
  svgContainerCtx.currZoom_ = val
}

function fitSVGToPanel() {

  if (panzoomInstance == null)
    return

  var graphscorepanel = document.getElementById('graphscorepanel')
  var panelW = graphscorepanel.clientWidth
  var panelH = graphscorepanel.clientHeight
  //Subtract 1px so to be sure that it never overflows
  zoomFactor = Math.min((panelH - 1)/svgHeight(),  (panelW - 1)/svgWidth())
  if (zoomFactor < 0)
    zoomFactor = 0
  //zoomFactor = Math.round(zoomFactor*100)/100
  var prevScale = panzoomInstance.getScale()
  panzoomInstance.zoom(zoomFactor)
  var newScale = panzoomInstance.getScale()
  if (axesPanzoomInstances[0] != null)
    adjustScaleOnAxes(prevScale, newScale)

  var svg = document.querySelector("svg")
  panX = Math.max(0, (panelW - svgWidth()*zoomFactor)/(2*zoomFactor))
  panY = Math.max(0, (panelH - svgHeight()*zoomFactor)/(2*zoomFactor))
  //panX = Math.round(panX * 100)/100
  //panY = Math.round(panY * 100)/100
  panzoomInstance.pan(panX, panY, {force: true})

}

function oneToOneZoom() {

  if (panzoomInstance == null)
    return

  var graphscorepanel = document.getElementById('graphscorepanel')
  var panelW = graphscorepanel.clientWidth
  var panelH = graphscorepanel.clientHeight
  var zoomFactor = svgOrigWidth()/svgWidth()
  var prevScale = panzoomInstance.getScale()
  panzoomInstance.zoom(zoomFactor)
  var newScale = panzoomInstance.getScale()
  if (axesPanzoomInstances[0] != null)
    adjustScaleOnAxes(prevScale, newScale)
  bgrect = document.getElementById('bgrect')
  var svg = document.querySelector("svg")
  panX = Math.max(0, (panelW - svgWidth()*zoomFactor)/(2*zoomFactor))
  panY = Math.max(0, (panelH - svgHeight()*zoomFactor)/(2*zoomFactor))
  panzoomInstance.pan(panX, panY, {force: true})

}

function zoomAndCenter(val = -1) {

}

function panZoomOn() {

  if (panzoomInstance == null)
    return false

  return baseCtx.ptzbtnSelected || zoomKeyPressed
}

function hypotenuse(a, b) {
  return (Math.sqrt((a * a) + (b * b)));
}

function initSVGPanel() {

  svgcontainer = document.getElementById("svgcontainer")

  svgcontainer.addEventListener('mousemove',
    function (e) {
      if (rootSVGNode() && document.getElementById('bgrect')!=null) {
        var graphscorepanelRect = document.getElementById('graphscorepanel').getBoundingClientRect()
        var svgRect = document.getElementById('bgrect').getBoundingClientRect();
        var x = e.clientX - svgRect.left;
        var y = e.clientY - svgRect.top;
        x = x * getScale().x / panzoomInstance.getScale()
        y = y * getScale().y / panzoomInstance.getScale()
        currCoordsInSVGUnits.x = x
        currCoordsInSVGUnits.y = y
        graphscorepanel = document.getElementById("graphscorepanel")
        currMouseCoordsOnSVG.x = e.clientX - graphscorepanelRect.left
        currMouseCoordsOnSVG.y = e.clientY - graphscorepanelRect.top

        //workaround for "contain: inside" bug on panzoom lib
        if (axesPanzoomInstances[0] != null)
        {
          for (var i = 0; i < 3; i = i+2) {
            var oldPan = axesPanzoomInstances[i].getPan()
            if (oldPan.y/panzoomInstance.getScale() >= svgHeight()) {
              axesPanzoomInstances[i].pan(oldPan.x, (svgHeight()-axesThickness)*panzoomInstance.getScale())
            }
            if (oldPan.y/panzoomInstance.getScale() <= 0) {
              axesPanzoomInstances[i].pan(oldPan.x, 0+axesThickness)
            }
          }
          for (var i = 1; i < 4; i = i+2) {
            var oldPan = axesPanzoomInstances[i].getPan()
            if (oldPan.x/panzoomInstance.getScale() >= svgWidth()) {
              axesPanzoomInstances[i].pan((svgWidth()-axesThickness)*panzoomInstance.getScale(), oldPan.y)
            }
            if (oldPan.x/panzoomInstance.getScale() <= 0) {
              axesPanzoomInstances[i].pan(0+axesThickness, oldPan.y)
            }
          }
        }

        var rulerLine = document.getElementById("rulerline")
        var rulerTable = document.getElementById("rulertbl")
        if (rulerLine!= null && rulerOn) {
          var x1 = Number(rulerLine.getAttributeNS(null, "x1"))
          var y1 = Number(rulerLine.getAttributeNS(null, "y1"))
          var x2 = Number(rulerLine.getAttributeNS(null, "x2"))
          var y2 = Number(rulerLine.getAttributeNS(null, "y2"))
          if ((x1 != x2) || (y1 != y2))
            rulerTable.style.visibility = "visible"
          else
            rulerTable.style.visibility = "hidden"
          var x2 = x
          var y2 = y
          rulerLine.setAttributeNS(null, "x2", x2)
          rulerLine.setAttributeNS(null, "y2", y2)
          var yDistInSS = Math.abs(Math.round((y2 - y1)/staffSpaceForRuler * 100) / 100)
          var xDistInSS = Math.abs(Math.round((x2 - x1)/staffSpaceForRuler * 100) / 100)
          var tmpInSS = hypotenuse(yDistInSS, xDistInSS)
          var xyDistInSS = Math.round(tmpInSS * 100) / 100

          rulerYDistanceInStaffUnits = document.getElementById("rulerdysu")
          rulerYDistanceInStaffUnits.innerHTML = yDistInSS + " ss"
          rulerXDistanceInStaffUnits = document.getElementById("rulerdxsu")
          rulerXDistanceInStaffUnits.innerHTML = xDistInSS + " ss"
          rulerXYDistanceInStaffUnits = document.getElementById("rulerdxysu")
          rulerXYDistanceInStaffUnits.innerHTML = xyDistInSS + " ss"

          rulerYDistanceInOrigUnits = document.getElementById("rulerdyou")
          rulerXDistanceInOrigUnits = document.getElementById("rulerdxou")
          rulerXYDistanceInOrigUnits = document.getElementById("rulerdxyou")
          if (origUnit != null) {
            var yDistInOU = Math.abs(Math.round(staffSpacesToOrigUnits(y2 - y1) * 100) / 100)
            var xDistInOU = Math.abs(Math.round(staffSpacesToOrigUnits(x2 - x1) * 100) / 100)
            var tmpInOU = hypotenuse(yDistInOU, xDistInOU)
            var xyDistInOU = Math.round(tmpInOU * 100) / 100
            rulerYDistanceInOrigUnits.innerHTML = yDistInOU + " " + origUnit
            rulerXDistanceInOrigUnits.innerHTML = xDistInOU + " " + origUnit
            rulerXYDistanceInOrigUnits.innerHTML = xyDistInOU + " " + origUnit
          }
        }
      }
  })

  //TODO? disable all mouse events when compiling?
  document.addEventListener('mouseup', unselectProperty)
  document.addEventListener('mousemove', manipulateProperty)

  graphscorepanel = document.getElementById("graphscorepanel")
  graphscorepanel.oncontextmenu = function(evt) {
    evt.preventDefault()
  }

  graphscorepanel.addEventListener('wheel', function (event) {
    if (panZoomOn())
      event.preventDefault()
  })

  window.addEventListener('keydown', function (event) {
    if (panZoomKeyCodes.includes(event.keyCode)) {
      if (!panZoomOn()) {
        activatePanZoom()
      }
      zoomKeyPressed = true
    }
    else if (zoomOutKeyCodes.includes(event.keyCode)) {
      canZoomOut = true
    }

    var rulerTable = document.getElementById("rulertbl")
    var rulerLine = document.getElementById("rulerline")
    if (event.shiftKey && !rulerOn && rulerLine != null) {
      rulerTable.style.visibility = "hidden"
      rulerOn = true
      rulerLine.setAttributeNS(null, "x1", currCoordsInSVGUnits.x)
      rulerLine.setAttributeNS(null, "x2", currCoordsInSVGUnits.x)
      rulerLine.setAttributeNS(null, "y1", currCoordsInSVGUnits.y)
      rulerLine.setAttributeNS(null, "y2", currCoordsInSVGUnits.y)
    }
  })

  window.addEventListener('keyup', function (event) {
    if (panZoomKeyCodes.includes(event.keyCode)) {
      zoomKeyPressed = false
      if (!panZoomOn()) {
        deactivatePanZoom()
      }
    }
    else if (zoomOutKeyCodes.includes(event.keyCode)) {
      canZoomOut = false
    }

    if (!event.shiftKey) {
      rulerOn = false
    }
  })

  //initRuler()

  addMouseListenersToSVGMenu()

}
