/*
 * Created (28/12/2019) by Paolo-Prete.
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

var JSSVCompileHelperPort = 8764
var menuWidth = 25
var menuItemHeight = 4
var interactiveBarWidth = 0.2
var interactiveBarHeight = 2
var showLineNumbers = true
var osopadderColor = "#6f9ab0"
var editableObjectsColor = "blue"
var layoutBlockMarker = "__LAYOUT__"
var showAlwaysMenu = false

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
  line.setAttribute('onmouseout', 
                    'this.setAttributeNS(null, "stroke", "'+osopadderColor+'")') 
  
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
    leftPad = +(Number(lilySetProp.split("#\'(")[1].split(" ")[3].replace(")", ""))).toFixed(3)

  }  
  
  markerFound = false
  
  for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
    if (isOsPadder(n2)) {
      markerFound = true
      for (n3 = n2.firstChild; n3 !== null; n3 = n3.nextSibling)
      if (n3.nodeName == 'rect') {
        xs.push(Number(getTranslateCoords(n3)[0]) + Number(n3.getAttributeNS(null, "x")))
        ys.push(Number(getTranslateCoords(n3)[1]) + Number(n3.getAttributeNS(null, "y")) + thickness) 
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

  var bottomLine = drawLine(xs[0], yBottom, (xs[3]+thickness), yBottom, thickness, osopadderColor)  
  bottomLine.setAttribute("paddir", "bottom")
  bottomLine.setAttribute("startcoord", yBottom)
  bottomLine.setAttribute("startpadding", bottomPad)
  bottomLine.setAttribute("currpadding", bottomPad)
  setCommonAttrsForOSOPadderLine(bottomLine, n1, propName)
  
  var topLine = drawLine(xs[0], yTop, (xs[3]+thickness), yTop, thickness, osopadderColor)  
  topLine.setAttribute("paddir", "top")
  topLine.setAttribute("startcoord", yTop)
  topLine.setAttribute("startpadding", topPad)
  topLine.setAttribute("currpadding", topPad)
  setCommonAttrsForOSOPadderLine(topLine, n1, propName)
  
  var leftLine = drawLine((xs[0]+thickness/2), yTop, (xs[0]+thickness/2), yBottom, thickness, osopadderColor)  
  leftLine.setAttribute("paddir", "left")
  leftLine.setAttribute("startcoord", (xs[0]+thickness/2))
  leftLine.setAttribute("startpadding", leftPad)
  leftLine.setAttribute("currpadding", leftPad)
  setCommonAttrsForOSOPadderLine(leftLine, n1, propName)
  
  var rightLine = drawLine((xs[3]+thickness/2), yTop, (xs[3]+thickness/2), yBottom, thickness, osopadderColor)  
  rightLine.setAttribute("paddir", "right")
  rightLine.setAttribute("startcoord", (xs[3]+thickness/2))
  rightLine.setAttribute("startpadding", rightPad)
  rightLine.setAttribute("currpadding", rightPad)
  setCommonAttrsForOSOPadderLine(rightLine, n1, propName)
}

function selectOSOPaddable (grob) {

  //TODO: doesn't seem to be needed anymore
  if (!detectLeftButton(event)) {
    event.preventDefault()
    return
  }

  currGrob = grob

}

function manipulateOSOPadder() {
  
  var x = getMouseCoordsOnScore().x
  var y = getMouseCoordsOnScore().y

  var paddoffs = Number(currGrob.getAttribute("startpadding"))
  var padding = 0  

  if ((currGrob.getAttribute("paddir") == "left") || (currGrob.getAttribute("paddir") == "right")) {
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
  
  if (n1.getAttribute("editableclass") == 'PianoPedalBracket') {
  for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
    if (n2.nodeName == 'line') {

      if (Number(n2.getAttribute('x1')) != Number(n2.getAttribute('x2'))) {
        leftX = Number(getTranslateCoords(n2)[0])
        rightX = leftX
        Y = Number(getTranslateCoords(n2)[1])
        leftX += Number(n2.getAttribute('x1'))
        rightX += Number(n2.getAttribute('x2'))
      }
   
      if (n2.getAttribute('stroke-width') && Number(n2.getAttribute('stroke-width')) != 0)
        strokeWidth = n2.getAttribute('stroke-width')
    }
  }
  }
  
  if (n1.getAttribute("editableclass") == 'OttavaBracket') {
    var offsRightX = 0
    for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
      if ((n2.nodeName == 'line' || n2.nodeName == 'text' )) {
        if ( leftX == null || (Number(getTranslateCoords(n2)[0] < leftX))) {
          leftX = Number(getTranslateCoords(n2)[0])
          Y = Number(getTranslateCoords(n2)[1])
        }    
        
        if (n2.nodeName == 'line' && (Number(n2.getAttribute('x1')) != Number(n2.getAttribute('x2')))) {
          x1Transl = Number(n2.getAttribute('x1')) + Number(getTranslateCoords(n2)[0])
          x2Transl = Number(n2.getAttribute('x2')) + Number(getTranslateCoords(n2)[0])
          rightX = Math.max(x1Transl, x2Transl)
        }
        
        if (n2.getAttribute('stroke-width') && Number(n2.getAttribute('stroke-width')) != 0)
          strokeWidth = n2.getAttribute('stroke-width')    
      }
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
  
  var barLeft = createInteractiveRect(leftX-interactiveBarWidth, Y, interactiveBarWidth, interactiveBarHeight, editableObjectsColor)
  barLeft.setAttribute('origx', origCoords[0])  
  barLeft.setAttribute('gid', gid)
  barLeft.setAttribute('editcommand', n1.getAttribute('editcommand'))
  barLeft.setAttribute('editableclass', n1.getAttribute('editableclass'))
  barLeft.setAttribute('associatedtoprops', propName)
  barLeft.setAttribute('staffspace', n1.getAttribute('staffspace'))  
  barLeft.setAttribute('onmousedown', 'selectShortenPairable(this)')
  
  var barRight = createInteractiveRect(rightX, Y, interactiveBarWidth, interactiveBarHeight, editableObjectsColor)
  barRight.setAttribute('origx', origCoords[1])
  barRight.setAttribute('gid', gid)
  barRight.setAttribute('editcommand', n1.getAttribute('editcommand'))  
  barRight.setAttribute('editableclass', n1.getAttribute('editableclass'))
  barRight.setAttribute('associatedtoprops', propName)
  barRight.setAttribute('staffspace', n1.getAttribute('staffspace'))    
  barRight.setAttribute('onmousedown', 'selectShortenPairable(this)')
  
}

function selectShortenPairable(grob) {

  //TODO: doesn't seem to be needed anymore
  if (!detectLeftButton(event)) {
    event.preventDefault()
    return
  }

  currGrob = grob

}

function manipulateShortenPair() {
  
  x = getMouseCoordsOnScore().x

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
      var coords = getTranslateCoords(n2)
            
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
            console.log("[WARNING]: could not set '"+propName+"' to "+origVal+
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

  if (!detectLeftButton(event) && grob.getAttribute("textpos")) {
      createJsObjsMenu(grob.getAttribute("textpos"))
    return
  }  

  currGrob = grob

}

function manipulateXYPlacement() {

  var oldCoords = getTranslateCoords(currGrob).slice()
  var coords = []
  coords[0] = getMouseCoordsOnScore().x
  coords[1] = getMouseCoordsOnScore().y
  var props = currGrob.getAttribute('associatedtoprops')

  if (props.endsWith(';'))
    props = props.substring(0, props.length-1)  
  
  var propsArr = props.split(';')

  if (getAxisOfProps(props) == 'X') {
    coords[1] = Number(getTranslateCoords(currGrob)[1])
  }
  if (getAxisOfProps(props) == 'Y') {
    coords[0] = Number(getTranslateCoords(currGrob)[0])
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
      var shX = Number(getTranslateCoords(gobjs[i])[0]) - Number(oldCoords[0])
      var shY = Number(getTranslateCoords(gobjs[i])[1]) - Number(oldCoords[1])
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

  for (var n1 = node.firstChild; n1 !== null; n1 = n1.nextSibling) {
    if (n1.nodeName == 'g') {
      for (var n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
        if (n2.nodeName == 'circle') {
          transf = n2.getAttribute('transform')
          cps[cpsCount * 2] = transf.replace('translate(', '').split(',')[0]
          cps[cpsCount * 2 + 1] = transf.split(',')[1].trim().replace(')', '')

          node.setAttribute('cp' + cpsCount + 'x', cps[cpsCount * 2])
          node.setAttribute('cp' + cpsCount + 'y', cps[cpsCount * 2 + 1])
          //TODO: add prefix to these ids
          n2.setAttribute('id', gid + '_cp_' + cpsCount)
          //TODO fix repetitive code below for all grobs
          n2.setAttribute('textpos', node.getAttribute('textpos'))  
          n2.setAttribute('onmousedown', 'selectCp(this)')
          n2.setAttribute('staffspace', node.getAttribute('staffspace'))   
          n2.setAttribute('editcommand', node.getAttribute('editcommand'))
          n2.setAttribute('editableclass', node.getAttribute('editableclass'))
          n2.setAttribute('associatedtoprops', propName)
          n2.setAttribute('onmouseover', 'mouseOverModifiableElm(this)')
          n2.setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"))')          
          //TODO use the right red nuance
          n2.setAttribute('onmouseout', 'this.setAttribute("color", "rgb(207, 119, 112)")')
          cpsCount = cpsCount + 1
        }
      }

      for (var n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {

        if (n2.nodeName == 'line') {
          n2.setAttribute('id', gid + '_line_' + lineCounter)
          lineCounter++
        }
      }

    }
  }

  node.setAttribute('cps', cps.join(' '))

  for (var n1 = node.firstChild; n1 !== null; n1 = n1.nextSibling) {
    //remove 'transform' attribute and set abs coords
    if (n1.nodeName == 'path') {
      if (n1.hasAttribute('transform'))
        n1.removeAttribute('transform')

      setCpsOnPath(n1, cps)

      n1.setAttribute('id', gid + '_path')
      n1.setAttribute('fill', 'none')
    }
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

  //console.log("NEW")
  //logPointsCoords(cps)
  //console.log("ORIG")	
  //logPointsCoords(origcps)	
  //console.log("SHIFTS")	
  //logPointsCoords(origcpsShifts)	

}

function selectCp(cp) {

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
  assocCurve = currGrob.parentNode.parentNode
  cpIdx = currGrob.getAttribute('id').split('_')[2]
  cps = assocCurve.getAttribute('cps').split(' ')
  cps[cpIdx * 2] = (getMouseCoordsOnScore()).x
  cps[cpIdx * 2 + 1] = (getMouseCoordsOnScore()).y
  assocCurve.setAttribute('cps', cps.join(' '))

  //update circle corresponding to curr cp
  translateCoordsStr = cps[cpIdx * 2] + ',' + cps[cpIdx * 2 + 1]
  currGrob.setAttribute('transform',
    'translate(' + translateCoordsStr + ')')

  //Set new CPS on the 3 lines
  for (var i = 0; i < 3; i++) {
    currLine = document.getElementById(assocCurveId + '_line_' + (i + 1))
    currLine.setAttribute('transform',
                          'translate(' + cps[i * 2] + ',' + cps[i * 2 + 1] + ')')
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
  subbeamsnum = 1
  for (n2 = n1.firstChild; n2 !== null; n2 = n2.nextSibling) {
    if (n2.nodeName == 'polygon') {

      //Current points
      points = getShapePoints(n2)
      setAbsCoords(n2, points)
      n2.setAttribute('points', pointsArrToStr(points))
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

        //resetLilySetProperty(regex, n1.getAttribute('id').split('_')[1])
      }

      //console.log("CURRPTS")
      //	logPointsCoords(points)
      //console.log("ORIGPTS")		
      //	logPointsCoords(origcps)

      n2.setAttribute('origcps', pointsArrToStr(origcps))
      //IMPORTANT!  (and TODO: make automatic)
      n2.setAttribute('editcommand', n1.getAttribute('editcommand'))
      n2.setAttribute('editableclass', n1.getAttribute('editableclass'))
      n2.setAttribute('associatedtoprops', propName)
      n2.setAttribute('staffspace', n1.getAttribute('staffspace'))      
      //IMPORTANT! (and TODO: make automatic)
      n2.setAttribute('id', 'lilypolygon_' + gid +
        '_' + subbeamsnum++)
      //n2.setAttribute('textpos', n1.getAttribute('textpos'))
      n2.setAttribute('onmousedown', 'selectBeam(this)')
      n2.setAttribute('onmouseover', 'mouseOverModifiableElm(this)')
      //n2.setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"))')      
      n2.setAttribute('onmouseout', 'this.setAttribute("color", "'+editableObjectsColor+'")')
      n2.removeAttribute('transform')
      n2.setAttribute('anchor', '')
      if (n1.getAttribute('textpos')) {
        n2.setAttribute('textpos', n1.getAttribute('textpos'))        
        n2.setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"))')    
      }
      
      //updateLilyFileForPositions(n2)
    }

    n1.setAttribute('subbeamsnum', subbeamsnum - 1)
  }

}

function selectBeam(grob) {

  if (!detectLeftButton(event) && grob.getAttribute("textpos")) {
    createJsObjsMenu(grob.getAttribute("textpos"))
    return
  }

  parentIdNum = grob.getAttribute('id').split('_')[1]
  parentNode = grob.parentNode
  subbeamsnum = parentNode.getAttribute('subbeamsnum')
  for (var q = 1; q <= subbeamsnum; q++) {
    subBeam = document.getElementById('lilypolygon_' + parentIdNum + "_" + q)
    points = subBeam.getAttribute('points').split(' ')
    leftX = Number(points[4])
    rightX = Number(points[0])
    distanceFromRightSide = Math.abs((getMouseCoordsOnScore()).x - rightX)
    distanceFromLeftSide = Math.abs((getMouseCoordsOnScore()).x - leftX)
    distanceFromCenter = Math.abs((getMouseCoordsOnScore()).x - (leftX + (rightX - leftX) / 2))

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

    subBeam.setAttribute('yscreenprev', (getMouseCoordsOnScore()).y)
    currGrob = subBeam
  }

}

function manipulatePositions() {

  parentIdNum = currGrob.getAttribute('id').split('_')[1]
  parentNode = currGrob.parentNode
  subbeamsnum = parentNode.getAttribute('subbeamsnum')
  
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
        (getMouseCoordsOnScore()).y -
        Number(subBeam.getAttribute('yscreenprev'))
    }

    subBeam.setAttribute('yscreenprev', (getMouseCoordsOnScore()).y)
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
  lilyExpr = '\\js'+currGrob.getAttribute('editcommand')+' "' + idTkn + '" "'+ prop +'" #\'(' 
             + angleLeft + ' . ' + angleRight + ')'

  replaceExprInLyFile(idTkn, prop, lilyExpr)

}

////////////////////////////
// [END] POSITIONS DEFS
////////////////////////////

////////////////////////////
// [START] EXPANDIBLE
////////////////////////////

// Must be expanded only when adding
// NON avoid-collision properties
function isAvoidCollisionProp(propName) {

  return (!propName.startsWith("extra-offset"))
    
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
        
        coordsArr.push(Number(getTranslateCoords(child)[1]) + Number(child.getAttributeNS(null, 'y1')))
        coordsArr.push(Number(getTranslateCoords(child)[1]) + Number(child.getAttributeNS(null, 'y2')))
        
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
    console.log("[BUG/MISSING] getAxisOfProp error. Please report this")  
    a = null
    console.log(a[1])
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

var jsObjs = [
 
               ['Tweak', '', '', ['extra-offset', 
                                  'extra-offset-y', 
                                  'outside-staff-padding', 
                                  'padding',                                
                                  'shorten-pair', 
                                  'staff-padding',
                                  'X-offset',
                                  'Y-offset']],
               ['OnceOffset', '', '', ['positions']],                                  
               ['OnceOverride', '', '', ['extra-offset', 
                                         'extra-offset-y', 
                                         'outside-staff-padding', 
                                         'padding',                               
                                         'shorten-pair', 
                                         'staff-padding',
                                         'X-offset',
                                         'Y-offset']],
               ['OSOPadder', '', '', ['pads']],
               ['Padder', '', '', ['pads']],
               ['Shape', '', '', ['cpts']]
                                  
             ]

//WARNING: use LOWER case!
var managedProps = ['cpts', 'extra-offset', 'extra-offset-y', 'outside-staff-padding', 'padding',
                    'pads','positions', 'shorten-pair', 'staff-padding', 'x-offset', 'y-offset']             
              
// TODO remove this and use the codemirror's built-in regex support
const jsSVGRegex = /(?:\\jsShape|\\jsOnceOverride|\\jsOnceOffset|\\jsTweak|\\jsOSOPadder|\\jsPadder) +"[^"]+" +"[^"]+" +#'\((?:(?=([^()]*))\1|\((?:(?=([^()]*))\2|\((?:(?=([^()]*))\3|\((?=([^()]*))\4\))+\))+\))+\)/gm;

var layoutVarPrefix = "l"
const layoutVarRegex = /\$l\d+/gm;

////////////////////////////
// [END] EXPANDIBLE
////////////////////////////

////////////////////////////
// [START] DON'T TOUCH THIS!
////////////////////////////

//TODO: remove backspaces at the end of lines
//TODO: test+improve point and click (undo, cut, paste etc.)

var rootSVGNode = null
var lyFileContent = document.getElementById('lilyinputfile').textContent
var currGrob = null
var currZoom = 1
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
var lastSelectionStartLine = null
var lastSelectionEndLine = null
//FIXME? TODO? It seems overkill to compute it
//Will be used only by the staff-padding property!
var staffSymbolThickness = null
var txtEditor = null
var fileNameWPath = null
var ctrlStillPressed = false
var openLilypondFileButton = document.getElementById('openlilypondfile')
var openLyFileDialog = document.getElementById('openlyfiledialog')
var selectLyFile = document.getElementById('selectlyfile')
var doOpenLilypondFileButton = document.getElementById('doopenlilypondfilebutton')
var cancelOpenLilypondFileButton = document.getElementById('cancelopenlilypondfilebutton');
var newLilypondFileButton = document.getElementById('newlilypondfile')
var cursorDefaultBorderLeft = null
var cursorDefaultBlinkRate = null
var cursorCurrBlinkRate = null
var canShowMenu = false

currCoordsOnSVGPanel = {
  x: 0,
  y: 0
}

var isHTML = false
if (decodeURIComponent(document) == '[object HTMLDocument]')
  isHTML = true

function getLyFileContent() {
  return txtEditor.getValue()
}

function mouseOverModifiableElm(elm) {
    
    elm.setAttribute("color", "cyan")
    elm.style.cursor = "pointer"
    
}

function setLyFileContent(txt) {
  txtEditor.setValue(txt)
  //txtEditor.replaceRange(txt) 
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

function getTranslateCoords(node) {

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

  console.log(outStr)

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

  checkAndRemoveMenus(true)
  if (!currGrob)
    return
  //txtEditor.blur()
  var props = currGrob.getAttribute('associatedtoprops').split(';')
  manipulatePropFuncs[props[0].toLowerCase()]()
}

function detectLeftButton(evt) {

  evt = evt || window.event
  if ('buttons' in evt) {
    return evt.buttons == 1
  }
  var button = evt.which || evt.button
  return button == 1

}

function unselectProperty() {

  if (!currGrob)
    return
  var props = currGrob.getAttribute('associatedtoprops').split(';')
  updateLilyFileFuncs[props[0].toLowerCase()](currGrob)
  
  updatePointAndClickPositions(false)

  currGrob = null

}

document.getElementById("svgpanelcontainer").oncontextmenu = function(evt) {

  evt.preventDefault()

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
    rootSVGNode.insertBefore(line, rootSVGNode.firstChild)
  else
    rootSVGNode.appendChild(line)
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
  rootSVGNode.appendChild(rect)
  return rect
  
}


function replaceExprInLyFile(grobIdToken, prop, expr) {

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

          txtEditor.focus()
          var cursor = txtEditor.getSearchCursor(match)
          if (cursor.findNext())
            cursor.replace(expr)
        }
      }
    });
  }
}

function getNextFreeIdForJSObjsExpr() {
  let m;
  var idIdx = 1
  ret = 0

  while ((m = jsSVGRegex.exec(getLyFileContent())) !== null) {
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
  ret++
  return ret
}

function getNextLayoutVar() {
  let m;
  var idIdx = 1
  retId = 0
  retVar = "error"

  while ((m = layoutVarRegex.exec(getLyFileContent())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === layoutVarRegex.lastIndex) {
      layoutVarRegex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (match) {
        currId = match.replace("$"+layoutVarPrefix, "")
        if (Number(currId) && Number(currId) > retId)
          retId = Number(currId)
      }
    });
  }
  retId++
  return layoutVarPrefix+retId
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

function exportLilyFile() {

  window.open('data:;charset=utf-8,' + escape(lyFileContent));

}

var xhttp = null

function sendMsgToPythonHelper(data, onResponseReceived) {

  var request = new Request('http://localhost:' + JSSVCompileHelperPort, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify(data), // data can be `string` or {object}!
    headers: {
      'Content-Type': 'application/json'
    },
    origin: 'http://localhost:' + JSSVCompileHelperPort
  })
  fetch(request).then(response => {
      response.text().then(function(data) {
        onResponseReceived(response.statusText, data)
      })
    }).catch(function(error) {
    alert("Error while connecting to Python Helper. \n" +
          "Check details on the web console")
    })
}

function deleteLyFile() {

  if ((fileNameWPath != null) && (fileNameWPath != "")) {
    var result = confirm("Are you sure?")
    if (result) {
      var data = {
        cmd: 'DELETE',
        param1: fileNameWPath,
      }
      
      sendMsgToPythonHelper(data, function(statusTxt, responseTxt) { 
        setLyFileContent("")
        setDefaultSVGImage()
        setFileNameWPathAndUpdateLabel("")
      })
    }
  }
}

function setDefaultSVGImage() {
  htmlTag = '<img src="lib/default.svg" '
  htmlTag += 'style="display: block; margin-left: auto; margin-right: auto; width: 50%; height; 50%">'
  document.getElementById('svgpaneldraw').innerHTML = htmlTag
}

function setFileNameWPathAndUpdateLabel(val) {
  fileNameWPath = val
  document.getElementById("lyfilename").innerHTML = val
}

document.getElementById("cancelnamelilypondfilebutton").addEventListener('click', function (ev) {
  var txt = getLyFileContent()
  ev.preventDefault()
  //Prevent ff's bug
  setLyFileContent(txt)
  document.getElementById('namelyfiledialog').close()
})

// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
document.getElementById("donamelilypondlilebutton").addEventListener('click', function (ev) {

  ev.preventDefault()
  var fileName =  document.getElementById("filenametxtinput").value
  var data = {
    cmd: 'SAVE',
    param1: fileName,
    param2: getLyFileContent()
  }

  if (!fileName.endsWith(".ly"))
    alert("Please give \".ly\" extension to the file name")    
  else if (fileName.replace(".ly", "").trim() != "") {
    
    var data2 = {
      cmd: 'FILE_EXISTS',
      param1: fileName
    }
    
    sendMsgToPythonHelper(data2, function(statusTxt0, responseTxt0) {
      var doSave = true
      if (responseTxt0 == "YES")
        doSave = confirm("File exists. Overwrite?")
      if (doSave)
        sendMsgToPythonHelper(data, function(statusTxt, responseTxt) { 
          setFileNameWPathAndUpdateLabel(fileName)
          document.getElementById('namelyfiledialog').close() })
    })
  }
})

function showNameFileDialog() {
  
  document.getElementById("filenametxtinput").value = ""
  var nameLyFileDialog = document.getElementById('namelyfiledialog')
  if (typeof nameLyFileDialog.show === "function") {
    nameLyFileDialog.show()
  } else {
    alert("Error: the <dialog> API is not supported by this browser");
  }
}

function sendSaveLyFileCmdToPythonHelper(giveAName) {

  if (giveAName || (fileNameWPath == null) || (fileNameWPath == ""))
    showNameFileDialog()
  else {
    var fileName = fileNameWPath.split("/").pop()
    data = {
      cmd: 'SAVE',
      param1: fileName,
      param2: getLyFileContent()
    }
    
    sendMsgToPythonHelper(data, function(statusTxt, responseTxt) { setFileNameWPathAndUpdateLabel(fileName) })
  }
}

function loadScorePage(scoreName, wantedPageNum) {

    var url = window.location.href
    var prevFile = url.split('?')[0].split('/').pop()
    var prevFilePrefix = prevFile.replace('.html','')
    var newFile = ''
    if (numPages == 1)
      newFile = scoreName+".svg"
    else
      newFile = scoreName+"-"+wantedPageNum+".svg"

    var data = {
      cmd: 'SVG_CONTENT',
      param1: newFile
    }
    
    sendMsgToPythonHelper(data, function(statusTxt, responseTxt) {
    if (statusTxt == "OK") { 
        document.getElementById('svgpaneldraw').innerHTML = responseTxt
        document.getElementById('pageNumTxt').value = wantedPageNum
        rootSVGNode = document.querySelector('svg')
        initSVGEditableStuff()
      }    
    })
    
    //window.location.href = url;

}

function goToPage(wantedPageNum) {
  
  scoreName = fileNameWPath.replace('.ly', '')
  pageNum = wantedPageNum
  loadScorePage(scoreName, wantedPageNum)
}

function sendLyFileToPythonHelperForCompiling(btn) {

  defaultStyle = btn.style
  
  if ((fileNameWPath == null) || (fileNameWPath == "")) {
    alert("Save the file before compiling!")
    return
  }
    
  if (btn.getAttribute('locked') == 'false') {
    btn.setAttribute('locked', 'true')
    btn.style.background = 'yellow'

    fileName = fileNameWPath.split("/").pop()
    data = {
      cmd: 'COMPILE',
      param1: fileName,
      param2: getLyFileContent()
    }
    
    sendMsgToPythonHelper(data, function(statusTxt, responseTxt) {

      if(statusTxt.startsWith("OK")) { 
        numPages = Number(statusTxt.split('_')[1])
        document.getElementById('pageNumTxt').setAttribute("max", numPages)
        loadScorePage(fileName.replace('.ly',''), pageNum)
      }
      else
        alert("Error while compiling input file. \n" +
              "Check details on the browser's console")
      console.log(responseTxt)    
      console.log("------------") 
      btn.style = defaultStyle
      btn.setAttribute('locked', 'false')
    })
  }

}

function diffText(a, b)
{
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
  newCursorVal = diffTxt[1]
  offset = diffTxt[1] - diffTxt[0]
  nodesWithTextPos = document.querySelectorAll('[textpos]')
  for (var i = 0; i < nodesWithTextPos.length; i++) {
    prevPos = Number(nodesWithTextPos[i].getAttribute('textpos'))
    if (prevPos >= diffTxt[0]) {
      nodesWithTextPos[i].setAttribute('textpos', (prevPos+offset))
    }
  }
  
}

function zoom(value) {

  currZoom = 1 + value / 100
  document.getElementById('svgpaneldraw').style.transform = "scale(" + currZoom + ")"
  //document.getElementById('zoomPercentage').innerHTML = currZoom*100 + "%"

}

function isNumber(evt) {
  evt = (evt) ? evt : window.event
  var charCode = (evt.which) ? evt.which : evt.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false
  }
  return true
}

const markup = ``

function getScale() {
  var ret = {
    x: 0,
    y: 0
  }
  var widthInPixels = rootSVGNode.getAttribute('width').replace('mm', '') * 96 / 25.4
  var heightInPixels = rootSVGNode.getAttribute('height').replace('mm', '') * 96 / 25.4
  var scaleX = rootSVGNode.getAttribute('viewBox').split(' ')[2] / widthInPixels
  var scaleY = rootSVGNode.getAttribute('viewBox').split(' ')[3] / heightInPixels
  ret.x = scaleX
  ret.y = scaleY
  return ret
}

function getMouseCoordsOnScore() {

  var ret = {
    x: 0,
    y: 0
  }

  if (isHTML) {
    return currCoordsOnSVGPanel
  } else {
    ret.x = event.pageX * getScale().x
    ret.y = event.pageY * getScale().y
    return ret
  }

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

function setDragBarPos(pixels) {

  totalWidth = document.documentElement.clientWidth
  textScoreWidth = 100 * pixels / totalWidth
  document.getElementById('textscorepanel').style.width = textScoreWidth + '%'
  svgWidth = 100 - textScoreWidth
  document.getElementById('svgpanelcontainer').style.width = svgWidth + '%'

}

function getDragBarPos() {

  textscorepanelWidth = document.getElementById('textscorepanel').style.width
  if (!textscorepanelWidth)
    return "default"
  else
    return textscorepanelWidth.replace('%', '')

}

function moveDragBar(e) {

  setDragBarPos(e.pageX + 2)

}

function mouseOutModifiableElm(node) {
  
  node.setAttribute("color", editableObjectsColor)
  //document.getElementById("lilyinputfile").blur()
  
}

function showPointAndClickPosition(textPos) {

  var evt = event || window.event
  var button = evt.which || evt.button
  if (button != 1)
    return
    
  canShowMenu = true
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
  cursorCurrBlinkRate = 130
  txtEditor.focus()
  txtEditor.setCursor({line: i, ch: col})
  var el = document.querySelector('.CodeMirror-cursor')
  if(el) {
    el.style.borderLeft = "10px solid red"
    setTimeout(function(){ 
      el.style.borderLeft = cursorDefaultBorderLeft 
      cursorCurrBlinkRate = cursorDefaultBlinkRate
      txtEditor.getInputField().blur() 
      txtEditor.focus()
    }, 1500)
  }  
}

function addJsTxtItem(startToken, objName, prop, pos) {
  
  id = getNextFreeIdForJSObjsExpr()
  str = startToken + '\\js'+ objName + ' "'+ id+'" "'+prop+'" #\'() '
  var cursor = txtEditor.getCursor()
  txtEditor.replaceRange(str, cursor) 
  formatPianoTable()
  updatePointAndClickPositions(false)
  
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
      menuRectX1 = menuRectX1 - menuRectX1/(10*currZoom)
      menuRectX2 = menuRectX2 + menuRectX2/(10*currZoom)
      menuRectY1 = menuRectY1 - menuRectY1/(10*currZoom)
      menuRectY2 = menuRectY2 + menuRectY2/(10*currZoom)
      
      if ((getMouseCoordsOnScore().x >= menuRectX1) && (getMouseCoordsOnScore().x <= menuRectX2) &&
          (getMouseCoordsOnScore().y >= menuRectY1) && (getMouseCoordsOnScore().y <= menuRectY2))
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
      if ((getMouseCoordsOnScore().x >= subMenuRectX1) && (getMouseCoordsOnScore().x <= subMenuRectX2) &&
          (getMouseCoordsOnScore().y >= subMenuRectY1) && (getMouseCoordsOnScore().y <= subMenuRectY2))
         mouseOverSubMenu = true
  }  
  
  if (!doCheck || !(mouseOverMenu || mouseOverSubMenu)) {
      if (menu) 
        rootSVGNode.removeChild(menu)
      if (submenu) 
        rootSVGNode.removeChild(submenu)      
  }
  
}

function doNothing() {
}

function createJsObjsSubMenu(x, y, startToken, objName, propsJoined, textPos) {
  
  submenu = document.getElementById("jsobjssubmenu")
  if (submenu) 
    rootSVGNode.removeChild(submenu)   
  
  //mouseOverMenuObjs = true
  var svgns = "http://www.w3.org/2000/svg"  
  var g = document.createElementNS(svgns, 'g')
  
  menuItemHeightTmp = menuItemHeight/currZoom
  props = propsJoined.split(';')
  menuHeightTmp = menuItemHeightTmp*props.length
  menuWidthTmp = menuWidth/currZoom

  var bottomY = rootSVGNode.getAttribute('viewBox').split(' ')[3]  
  if (menuHeightTmp > (bottomY - y)) {
    y = bottomY - menuHeightTmp
  }
    
  var rect = document.createElementNS(svgns, 'rect')
  rect.setAttributeNS(null, 'x', x)
  rect.setAttributeNS(null, 'y', y)
  rect.setAttributeNS(null, 'height', menuHeightTmp)
  rect.setAttributeNS(null, 'width', menuWidthTmp)   
  rect.setAttributeNS(null, 'fill', 'white')
  rect.setAttributeNS(null, 'id', 'jsobjssubmenu_rect')
  g.setAttributeNS(null, 'id', 'jsobjssubmenu')    
  g.appendChild(rect) 

  for (var i = 0; i < props.length; i++) {
    item = createMenuItem(x, y + (i*menuItemHeightTmp), 
                          menuWidthTmp, 
                          menuItemHeightTmp,
                          "lightgrey", 
                          props[i],
                          'xxSub'+i, 
                          'doNothing()',
                          'addJsTxtItem(\"'+startToken+'\", \"'+objName+'\", \"'+props[i]+'\", '+textPos+')'+ ';checkAndRemoveMenus(false)',
                          'subMenu')
    g.appendChild(item)

  }  

  rootSVGNode.appendChild(g)
  
}

function createJsObjsMenu(textPos) {
  
  if (!canShowMenu && !showAlwaysMenu)
    return
  
  checkAndRemoveMenus(false)
  
  if (!detectLeftButton(event))
    event.preventDefault()
  else {
    return
  }

  x = currCoordsOnSVGPanel.x
  y = currCoordsOnSVGPanel.y

  //TODO: it can improved
  var bottomY = rootSVGNode.getAttribute('viewBox').split(' ')[3]
  rightX = rootSVGNode.getAttribute('viewBox').split(' ')[2]
  
  menuItemHeightTmp = menuItemHeight/currZoom
  menuHeightTmp = menuItemHeightTmp*jsObjs.length
  menuWidthTmp = menuWidth/currZoom
  subMenuX = x + menuWidthTmp
  subMenuPosition = "RIGHT"
  
  if (menuHeightTmp > (bottomY - y)) {
    y = bottomY - menuHeightTmp
  }
  
  if (menuWidthTmp*2 > (rightX - x)) {
    if (menuWidthTmp > (rightX - x))
      x = rightX - menuWidthTmp
    subMenuX = x - menuWidthTmp
    subMenuPosition = "LEFT"
  }  
  
  var svgns = "http://www.w3.org/2000/svg"  
  var g = document.createElementNS(svgns, 'g')

  var rect = document.createElementNS(svgns, 'rect')
  rect.setAttributeNS(null, 'x', x)
  rect.setAttributeNS(null, 'y', y)
  rect.setAttributeNS(null, 'height', menuHeightTmp)
  rect.setAttributeNS(null, 'width', menuWidthTmp)
  rect.setAttributeNS(null, 'onmouseover', '')  
  rect.setAttributeNS(null, 'onmouseout', '')    
  rect.setAttributeNS(null, 'fill', 'white')
  rect.setAttributeNS(null, 'id', 'jsobjsmenu_rect')
  g.appendChild(rect) 
  g.setAttributeNS(null, 'id', 'jsobjsmenu')    

  //Ex:
  //['Beam', '', '\\\\js', ['positions']],
  //['Beam', ' (-)', '-\\\\js', ['positions']],  
  
  for (var i = 0; i < jsObjs.length; i++) {
    //FIXME: not important, and not very error prone but the generated id is not safe
    subMenuStr = 'createJsObjsSubMenu(' + subMenuX + ', ' +
                                               (y + i*menuItemHeightTmp) + ', ' + 
                                               ' "' + jsObjs[i][2] + '", ' +
                                               ' "' + jsObjs[i][0] + '", ' + 
                                               ' "' + jsObjs[i][3].join(';') + '", ' +
                                               textPos+')'
               
    item = createMenuItem(x, (y + i*menuItemHeightTmp), menuWidthTmp, menuItemHeightTmp, "lightgrey", 
                          jsObjs[i][0]+jsObjs[i][1],
                          "xx"+i, 
                          subMenuStr,
                          "doNothing()",
                          "menu"
                         )
    g.appendChild(item)

  }  
  rootSVGNode.appendChild(g)
  
  canShowMenu = false
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
        n2.setAttribute('onmousedown', 'createJsObjsMenu(this.getAttribute("textpos"))')
        n2.setAttribute('onmouseup', 'showPointAndClickPosition(this.getAttribute("textpos"));')
        //FIXME: doesn't work properly on Firefox. If I set it, the text scrolls at each cursor move, 
        // which is not good. Then it's currently disabled.
        
        n2.setAttribute('onmouseover', 'this.style.cursor = "pointer"')
        //n2.setAttribute('onmouseout', 'document.getElementById("lilyinputfile").blur()')
      }
    }
  }
}

//TODO/FIXME  refactor API and eliminate __updatePointAndClickPositions()
function updatePointAndClickPositions(deepCheck) {

  lastMemTextLines = lastMemText.split('\n')
  newTextLines = getLyFileContent().split('\n')
  tempTextLines = lastMemTextLines.slice()
  
  // do this on PASTE-&-REPLACE on the same lines OR when the text is updated not by the user
  // otherwise the text edit will slow down
  if (deepCheck) { 
    for (var i = 0; i < newTextLines.length; i++) {
      if (tempTextLines[i] != newTextLines[i]){
        tempTextLines[i] = newTextLines[i]
        __updatePointAndClickPositions(lastMemText, tempTextLines.join('\n'))
        lastMemText = tempTextLines.join('\n')
      }
    }
  }
  else {
    __updatePointAndClickPositions(lastMemText, getLyFileContent())
  }
  
  lastMemText  = getLyFileContent()      
    
}

  //lilyScore = document.getElementById('lilyinputfile').textContent
  //lilyFilePath = document.getElementById('lilyinputfile').getAttribute('filepath')
  //document.getElementById('lilyinputfile').setAttribute('id', 'lilyinputfileorig')
  //document.body.innerHTML = markup
  //document.getElementById('lilyinputfile').value = "saa"
  //document.getElementById('lilyinputfile').setAttribute('filepath', lilyFilePath)

//document.getElementById('svgpaneldraw').appendChild(rootSVGNode)

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
          ref = Number(getTranslateCoords(child)[coordIdx])
        }
        
        if (child.nodeName == 'g') {
          for (var child2 = child.firstChild; child2 !== null; child2 = child2.nextSibling) {
            if (child2.nodeName == 'line') {
              ref = Number(getTranslateCoords(child2)[coordIdx])
            }
          }
        }
        
      }      
    }
    
    if (ref == null)
      console.log("[BUG/MISSING] getRef: ref not found. Please report this")    

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
    
    distance = Math.abs(refPointCoord - Number(getTranslateCoords(node)[coordIdx]))

    if (distance == null)
      console.log("[BUG/MISSING] distanceOfNodeFromRefPoint: distance not found. Please report this")

    return distance
  
}

function yPaddingOfTupletBracket(groupNode) {
  
  var maxY = null
  var y = null
  var pts = []
  var transY = null
   
  for (var child = groupNode.firstChild; child !== null; child = child.nextSibling) {
    
    if (child.nodeName == 'line') {
      y = Number(getTranslateCoords(child)[1])
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
    console.log("[ERROR]???")
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
              var markerY = Number(getTranslateCoords(n3)[1])
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
       (node.getAttributeNS(null, 'color') == "rgb(98.7000%, 12.3000%, 45.6000%)"))
      )
  
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
        
        coords = getTranslateCoords(child)
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
    
    distance =Math.abs(refPointCoord - groupCoord)
    
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
      console.log("[BUG/MISSING] distanceOfGrobFromRefPoint: groupCoord not found. Please report this")

    if (distance == null)
      console.log("[BUG/MISSING] distanceOfGrobFromRefPoint: distance not found. Please report this")    

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

      coords = getTranslateCoords(child)
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
      coordRef = Number(getTranslateCoords(child)[coordIdx])
    }
    
    if (child.nodeName == 'g') {
      for (var child2 = child.firstChild; child2 !== null; child2 = child2.nextSibling) {
        if (child2.nodeName == 'line') {
          coordRef = Number(getTranslateCoords(child2)[coordIdx])
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
    console.log("[BUG/MISSING] getCurrentLilyDirection: uknown direction. Please report this")
    
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

function initSVGEditableStuff() {

  document.querySelectorAll('*').forEach(function(node) {
      // Do whatever you want with the node object.
    setInitTextPositionForGrob(node)
  })

  staves = document.querySelectorAll('svg [isstaff^="true"]')
  for (var i = 0; i < staves.length; i++) {
    
      staffY = null
      for (n2 = staves[i].firstChild; n2 !== null; n2 = n2.nextSibling) {
        if (n2.nodeName == 'line') {
          lineY = Number(getTranslateCoords(n2)[1])
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
      
    var bottomY = Number(rootSVGNode.getAttribute('viewBox').split(' ')[3])
    var rightX = Number(rootSVGNode.getAttribute('viewBox').split(' ')[2])
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
      if (managedProps.includes(propName))
        initPropFuncs[propName](grobs[i])
    }
  }

  markers = document.querySelectorAll('svg [spontinimarker^="true"]')
  for (var i = 0; i < markers.length; i++) {
    markers[i].setAttributeNS(null, "color", "red")
    //markers[i].setAttributeNS(null, "visibility", "hidden")
  }

}

function getTableStartLine(cursorLine) {
  var ret = null
  var found = false
  
  
  for (var i = 1; i < 4; i++) {
    if (txtEditor.getLine(cursorLine - i) && 
        txtEditor.getLine(cursorLine - i).includes("\\easyCrossStaff") &&
        !txtEditor.getLine(cursorLine - i).includes("Poly") &&
        txtEditor.getLine(cursorLine - i).includes("%TMODE")) {  
      ret = []
      ret[0] = cursorLine - i
      ret[1] = 0
      ret[2] = "easyCrossStaff"
      found = true
      break
    }
  }
  
  if (!found)
  {
    for (var i = 1; i < 8; i++) {
      if (txtEditor.getLine(cursorLine - i) && 
         (
          txtEditor.getLine(cursorLine - i).includes("\\easyCrossStaff") ||
          txtEditor.getLine(cursorLine - i).includes("\\tabularTwoStaves")
         ) &&
         txtEditor.getLine(cursorLine - i).includes("%TMODE")) {
        ret = []
        ret[0] = cursorLine - i
        ret[1] = 0
        ret[2] = "easyCrossStaff"
        if (txtEditor.getLine(cursorLine - i).includes("\\tabularTwoStaves"))
          ret[2] = "tabularTwoStaves"
        
        if (txtEditor.getLine(cursorLine - i).includes("PolyI "))
          ret[1] = 1
        else if (txtEditor.getLine(cursorLine - i).includes("PolyII "))
          ret[1] = 2
        else if (txtEditor.getLine(cursorLine - i).includes("PolyIII "))
          ret[1] = 3         
        else if (txtEditor.getLine(cursorLine - i).includes("PolyIV "))
          ret[1] = 4 

        break
      }
    }
  }
  
  return ret
}

function getCSTCurrentCellNumber(cstStartLine, line, col) {
  
  var currLine = txtEditor.getLine(line)
  var pos = null
  if (((line - cstStartLine) >= 1) || ((line - cstStartLine) <= 3)) {
    let re = /\\CS/g 
    while( x=re.exec(currLine) ) { 
      if (pos == null)
        pos = 0
      if (x.index >= col) {
        //console.log("Cursor at position: "+pos) 
        return pos
      }
      pos++
    }
  }
  
  return pos
}

function getCSTCellContentLength(cstStartLine, line, currentCellNumber, doTrim = false) {

  var ret = null
  var str = null
  var currLine = txtEditor.getLine(cstStartLine + line)
  let re = "\\CS"
  if (currLine && (currLine.split(re).length >= currentCellNumber+1))
    str = currLine.split(re)[currentCellNumber]
  
  if (str != null) {
    ret = str.length
    if (doTrim) //right trim
      ret = str.replace(/\s+$/, '').length + 1
  }
  
  //if (str != null)
  //console.log("cella["+(line - cstStartLine)+"-"+currentCellNumber+"]: "+str.trim()+"   lunghezza="+ret)
  //console.log("CELLCONTENT"+(line - cstStartLine)+"-"+currentCellNumber+": "+ret)  
  
  return ret
}

//TODO make a better tuning
function setWidgetsFontSize() {
  var buttons = document.getElementsByTagName("button")
  var fileNameLabel = document.getElementById("lyfilename")
  var win = window,
      doc = document,
      docElem = doc.documentElement,
      body = doc.getElementsByTagName('body')[0],
      x = win.innerWidth || docElem.clientWidth || body.clientWidth,
      y = win.innerHeight|| docElem.clientHeight|| body.clientHeight;
  //console.log(x + "---" + y)
  for (var i = 0; i < buttons.length; i++) {
    var fontsize = ""
    if (x <= 700)
      fontsize = "6px"
    else if (x <= 1000 && x > 700)
      fontsize = "10px"
    else if (x <= 1400 && x > 1000)
      fontsize = "12px"
    else
      fontsize = "14px"      
    buttons[i].style.fontSize = fontsize
    fileNameLabel.style.fontSize = fontsize
  }
}

function onBodyResize() {
  setWidgetsFontSize()
}

function removeOrAddEndWhiteCharOfCell(cstStartLine, lineOffs, currentCellNumber, operation) {
  
  var currLine = txtEditor.getLine((cstStartLine + lineOffs))
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
  
  oldCursor = txtEditor.getCursor()
  
  if (sepIdx != null) {
    //Add white space
    if (operation == " ")
      txtEditor.replaceRange(operation, {line: (cstStartLine + lineOffs), ch: sepIdx}) 
    //remove white space
    else 
      txtEditor.replaceRange(operation, {line: (cstStartLine + lineOffs), ch: sepIdx-1}, {line: (cstStartLine + lineOffs), ch: sepIdx}) 
  }

  txtEditor.setCursor(oldCursor)
}

function formatPianoTable() {

  var cstStartLine = getTableStartLine(txtEditor.getCursor().line)
  if (cstStartLine != null) {
    var currentCellNumber = getCSTCurrentCellNumber(cstStartLine[0], txtEditor.getCursor().line, txtEditor.getCursor().ch)
    if (currentCellNumber != null) {
      var lengthOfContentOfCellToFormatOnCSTLine = []
      var numOfRows = 3 + Number(cstStartLine[1])*2

      if (cstStartLine[2] == "tabularTwoStaves")
        numOfRows -= 3
      
      for (var i = 0; i < numOfRows; i++) {
        lengthOfContentOfCellToFormatOnCSTLine[i] = getCSTCellContentLength(cstStartLine[0], (i +1), currentCellNumber, true)
      }

      for (var i = 0; i < numOfRows; i++) {
      
      if (lengthOfContentOfCellToFormatOnCSTLine[i] == null)
        return
      }        
        
      var maxContentLength = Math.max(...lengthOfContentOfCellToFormatOnCSTLine)

      for (var i = 0; i < numOfRows; i++) {
        lengthOfContentOfCellToFormatOnCSTLine[i] = getCSTCellContentLength(cstStartLine[0], (i +1), currentCellNumber)

        while (lengthOfContentOfCellToFormatOnCSTLine[i] != maxContentLength) {
          if (lengthOfContentOfCellToFormatOnCSTLine[i] < maxContentLength) {
            removeOrAddEndWhiteCharOfCell(cstStartLine[0], (i + 1), currentCellNumber, " ")
            lengthOfContentOfCellToFormatOnCSTLine[i] += 1
          }
          else {
            removeOrAddEndWhiteCharOfCell(cstStartLine[0], (i + 1), currentCellNumber, "")
            lengthOfContentOfCellToFormatOnCSTLine[i] -= 1
          }
        }
        
      }
    }
  }
}

function insertTextAtCursor(editor, text) {
    var doc = editor.getDoc();
    var cursor = doc.getCursor();
    doc.replaceRange(text, cursor);
}

var txtArea = document.getElementById('lilyinputfile')  
txtEditor = CodeMirror(function(elt) {
  txtArea.parentNode.replaceChild(elt, txtArea);}, {
    value: txtArea.value, 
    mode: "stex",
    matchBrackets: true,
    lineNumbers: showLineNumbers
   });

cursorDefaultBorderLeft = document.querySelector('.CodeMirror-cursor').style.borderLeft
cursorDefaultBlinkRate = CodeMirror.defaults.cursorBlinkRate
cursorCurrBlinkRate = cursorDefaultBlinkRate

txtEditor.on("focus", function () {
  txtEditor.setOption("cursorBlinkRate", cursorCurrBlinkRate)
})

txtEditor.on("change", function (change) {

  //TODO rebuild deepcheck for codemirror's events
  
  /*if (event && ( (event.type == 'input') || (event.type == 'keydown')) )*/ {
  //console.log(event.type)
  //formatPianoTable(change)

  var deepCheck = false

  if (event) {
     //console.log(event.inputType)
     deepCheck  = (event.inputType == 'insertFromPaste') ||
                  (event.inputType == 'historyUndo') ||
                  (lastSelectionStartLine != lastSelectionEndLine)
  }
  updatePointAndClickPositions(deepCheck)
  
  //lastSelectionEndLine = null
  //lastSelectionStartLine = null
  }
  
})

///////////
//KEY MAPS
///////////

var keyMaps = []

keyMaps.push({ "Ctrl-1": function(cm) { 
  var str = '\\tabularTwoStavesPoly %TMODE\n'
  insertTextAtCursor(txtEditor, str )
}})

keyMaps.push({ "Ctrl-2": function(cm) { 
  var str = '\\easyCrossStaff %TMODE\n'
  insertTextAtCursor(txtEditor, str )
}})

keyMaps.push({ "Ctrl-3": function(cm) { 
  var cursor = txtEditor.getCursor()
  
  var lineBeforeCursor = txtEditor.getLine(cursor.line - 1)
  
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
        if (txtEditor.getLine(cursor.line).trim() != "") {
          txtEditor.replaceRange("s \\CS ", cursor)
          txtEditor.replaceRange("s \\CS ", { line: (cursor.line + 1), ch: cursor.ch })
          txtEditor.replaceRange('- \\CS ', { line: (cursor.line + 2), ch: cursor.ch }) 
        }
        else {
          var str = ""  
          str += "  { s \\CS }\n"
          str += "  { s \\CS }\n"       
          str += "#'( - \\CS )\n"
          if (lineBeforeCursor.includes("\\easyCrossStaffB")) {
            str += "  %% UPPER STAFF %%\n"
            str += "  {}{}{}{}\n"
            str += "  %% LOWER STAFF %%\n"
            str += "  {}{}{}{}\n"          
          }
          txtEditor.replaceRange(str, cursor)           
        }
      }
      else if (txtEditor.getLine(cursor.line).trim() != "") {
        var q = 1
        var additionalChars = ""
        if (lineBeforeCursor.includes("\\easyCrossStaff"))
          additionalChars = "  "
          
        txtEditor.replaceRange(additionalChars + "\\CS ", cursor)
        for (var i = 0; i < polyNum - 1; i++) {
          txtEditor.replaceRange(additionalChars + "\\CS ", { line: (cursor.line + (i + 1)), ch: cursor.ch })
          q++
        }
        
        if (lineBeforeCursor.includes("\\easyCrossStaff")) {
          txtEditor.replaceRange("s \\CS ", { line: (cursor.line + q), ch: cursor.ch })
          q++
          txtEditor.replaceRange("s \\CS ", { line: (cursor.line + q), ch: cursor.ch })
          q++
        }
        var qCp = q
        for (var i = qCp; i < polyNum + qCp; i++) {
          txtEditor.replaceRange(additionalChars + "\\CS ", { line: (cursor.line + (i)), ch: cursor.ch })
          q++
        }
        if (lineBeforeCursor.includes("\\easyCrossStaff")) {
          txtEditor.replaceRange('- \\CS ', { line: (cursor.line + q), ch: cursor.ch }) 
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
          str += "  { s \\CS } %_\n"
          str += "  { s \\CS } % \n"
        }
        for (var i = 0; i < polyNum; i++) {
          str += "  { " + additionalChars + "\\CS }"
          if (!lineBeforeCursor.includes("\\easyCrossStaff") && i == 0)
            str += "%"
          str += "\n"            
        }          
        if (lineBeforeCursor.includes("\\easyCrossStaff")) {        
          str += "#'( - \\CS )\n"
        }
        txtEditor.replaceRange(str, cursor)        
      }
        
      
      
      
  }

}})

keyMaps.push ({ "Ctrl-4": function(cm) { 
  var str1 = '%%% '+layoutBlockMarker+' %%%'
  var str2 = ''
  for (var i = 0; i < str1.length; i++)
    str2 += '%'
  var str = str1+'\n\n'+str2+'\n\n'
  //str += '\\easyCrossStaff %TMODE\n  { s \\CS }\n  { s \\CS }\n#\'( - \\CS )\n'
  insertTextAtCursor(txtEditor, str )
}})

keyMaps.push({ "Ctrl-5": function(cm) { 
  var cursor = txtEditor.getCursor()

  //var cstStartLine = getTableStartLine(txtEditor.getCursor().line)
  var currLineNum = txtEditor.getCursor().line  
  while ( currLineNum >= 0) {    
    var lineContent = txtEditor.getLine(currLineNum)
    if (lineContent.includes(layoutBlockMarker)) {
      var layoutVar = getNextLayoutVar()
      var defineVar = "\n#(define "+layoutVar+" #{\n"+txtEditor.getSelection()+"\n#})\n"
      txtEditor.replaceSelection("$"+layoutVar)
      txtEditor.replaceRange(defineVar, {line: (currLineNum+1), ch: 0}) 
      break
    }
    currLineNum--
  }

}})

keyMaps.push({ "Ctrl-6": function(cm) { 
  var cursor = txtEditor.getCursor()
  id = getNextFreeIdForJSObjsExpr()
  var str = '\\jsOSOPadder "'+id+'" "pads" #\'()'
  txtEditor.replaceRange(str, cursor)
}})

keyMaps.push({ "Ctrl-7": function(cm) { 
  var cursor = txtEditor.getCursor()
  id = getNextFreeIdForJSObjsExpr()
  var str = '\\jsPadder "'+id+'" "pads" #\'()'
  txtEditor.replaceRange(str, cursor)
}})


keyMaps.push( { "Ctrl-S": function(cm) { 
  sendSaveLyFileCmdToPythonHelper(false)
}})


keyMaps.push({ "Ctrl-F1": function(cm) { 
  var cursor = txtEditor.getCursor()
  id = getNextFreeIdForJSObjsExpr()
  var str = '\\jsTweak "'+id+'" " " #\'()'
  txtEditor.replaceRange(str, cursor)
}})

keyMaps.push({ "Ctrl-F2": function(cm) { 
  var cursor = txtEditor.getCursor()
  id = getNextFreeIdForJSObjsExpr()
  var str = '\\jsOnceOverride "'+id+'" " " #\'()'
  txtEditor.replaceRange(str, cursor)
}})

for (var i = 0; i < keyMaps.length; i++)
  txtEditor.addKeyMap(keyMaps[i])

txtEditor.on("keyup",  function (cm, event) {
  var keycode = event.which
  if (keycode == 17)
    ctrlStillPressed = false
  // Alt = 18 Ctrl = 17
  if (!ctrlStillPressed && keycode != 18) {   
    formatPianoTable()
  }
})

txtEditor.on("mousedown",  function (cm, event) {
  canShowMenu = false
})

txtEditor.on("keydown",  function (cm, event) {
  canShowMenu = false
  var keycode = event.which
  //Ctrl = 17
  if (keycode == 17)
    ctrlStillPressed = true
})

document.addEventListener('mouseup', function(e) {
  document.removeEventListener('mousemove', moveDragBar)
})

document.getElementById('dragbar').addEventListener('mousedown', function(e) {
  e.preventDefault();
  document.addEventListener('mousemove', moveDragBar)
})

document.getElementById('svgpanelcontainer').addEventListener('mousemove',
  function mouseCoordinates() {
    if (rootSVGNode) {
      var offsetpos = coordsCorrection(this);
      currCoordsOnSVGPanel.x = (event.clientX + offsetpos.x) * getScale().x / currZoom
      currCoordsOnSVGPanel.y = (event.clientY + offsetpos.y) * getScale().y / currZoom
    }
})

lastMemText = getLyFileContent()
setLyFileContent("")
setDefaultSVGImage()
setWidgetsFontSize()

//TODO? disable all mouse events when compiling?
document.addEventListener('mouseup', unselectProperty)
document.addEventListener('mousemove', manipulateProperty)

newLilypondFileButton.addEventListener('click', function () {
  setLyFileContent("")
  setDefaultSVGImage()
  setFileNameWPathAndUpdateLabel("")
  document.getElementById('pageNumTxt').value = 1
})

openLilypondFileButton.addEventListener('click', function onOpen() {
  if (typeof openLyFileDialog.show === "function") {
    var data = {
      cmd: 'FILE_LIST',
      param1: ""
    }
    sendMsgToPythonHelper(data, function(statusTxt, responseTxt) {
    if (statusTxt == "OK") { 
        var sepTkn = ";;::;;"
        var fileList = responseTxt.split(sepTkn)
        var selectOptions = ""
        for (var i = 0; i < fileList.length; i++)
          selectOptions += "<option>"+fileList[i]+"</option>"
        if (fileList.length > 0)
          doOpenLilypondFileButton.setAttribute('value', fileList[0])
        selectLyFile.innerHTML = selectOptions
      }    
    })
    openLyFileDialog.show()
  } else {
    alert("Error: the <dialog> API is not supported by this browser");
  }
})

selectLyFile.addEventListener('change', function onSelect(e) {
  doOpenLilypondFileButton.value = selectLyFile.value;
})


cancelOpenLilypondFileButton.addEventListener('click', function (ev) {
  var txt = getLyFileContent()
  ev.preventDefault()
  //Prevent ff's bug
  setLyFileContent(txt)
  openLyFileDialog.close()
})

// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
doOpenLilypondFileButton.addEventListener('click', function doOpenLilyFile(ev) {

  ev.preventDefault()
  var val = this.getAttribute("value")
  if (val != "") {
        
    var data = {
      cmd: 'LY_CONTENT',
      param1: val
    }

    sendMsgToPythonHelper(data, function(statusTxt, responseTxt) {
      if (statusTxt == "OK") { 
        
        setLyFileContent(responseTxt)
        setFileNameWPathAndUpdateLabel(val)
        
        var data2 = {
          cmd: 'NUM_SVG_PAGES',
          param1: val
        }
        
        sendMsgToPythonHelper(data2, function(statusTxt2, responseTxt2) {
          if (statusTxt2 == "OK") { 
            if (Number(responseTxt2) != 0) {
              numPages = Number(responseTxt2)
              document.getElementById('pageNumTxt').setAttribute("max", numPages)
              txtEditor.clearHistory()
              loadScorePage(val.replace('.ly',''), 1)
            }
          } 
        })

      }
      
      openLyFileDialog.close()      
    }) 
  }
})

////////////////////////////
// [END] DON'T TOUCH THIS!
////////////////////////////
