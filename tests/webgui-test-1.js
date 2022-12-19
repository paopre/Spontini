/*
 * Created (14/11/2022) by Paolo-Prete.
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

/*
 * This file is useful for understanding how Spontini's API works
 * and at the same time it executes an automated test of the program, with multiple
 * versions (or a specific version) of LilyPond, starting from the GUI
 * It REQUIRES ImageMagick.
 * The test can be launched by opening: http://localhost:8000/spontini-editor?test=1
 * OR through Cypress:
 * npx cypress run --env testnum=1,timeout=1200000,removelilyinstall=false --config specPattern=SPONTINI/Spontini/tests --browser chrome --spec path/to/Spontini/tests/run-webgui-test.cy.js
 *
 * NOTE: removelilyinstall=true/false (uninstall LilyPond's current version after the test is done) and lilyversion=VERSION can be added as parameters to the URL)
 */

export let retryMs_               = 500
export let lyFileNameWOExt_       = "test_movable_grobs"
export let lyFileName_            = lyFileNameWOExt_ + ".ly"
export let lyModFileNameWOExt_    = lyFileNameWOExt_ + "_copy"
export let lyModFileName_         = lyModFileNameWOExt_ + ".ly"
export let lilyPondsList_         = []
export let lilyPondsListCurrItem_ = 0
export let step_                  = 1
export let removelilyinstall_     = null
export let lilyversion_           = null

function doWhen(cond, func, retryMs_, retries = 40) {

  if (cond())
    func()
  else {
    retries--
    if (retries > 0) {
      window.setTimeout(() => {
        doWhen(cond, func, retryMs_, retries)
      }, retryMs_)
    }
    else
      throw new Error("Timeout reached")
  }

}

function nullToStr(val) {

  if (!val)
    return ""
  else
    return val

}

function doMoveGrob(id, prop, x, y, subBeamsNum = 1) {

  if (prop.includes("positions")) {
      let anchors = ['left', 'right']
      for (var q = 0; q < 2; q++) {
        currGrob = document.querySelectorAll('[id="lilypolygon_' + id + '_' + subBeamsNum + '"]')[0]
        currGrob.setAttribute('anchor', anchors[q])
        currCoordsInSVGUnits.y = -(y[q])
        manipulateProperty()
        unselectProperty()
      }
  }
  else if (prop.includes("cpts")) {
    for (var q = 0; q < 4; q++) {
      currGrob = document.querySelectorAll('[id="' + id + '_cp_' + q + '"]')[0]
      currCoordsInSVGUnits.x = x[q]
      currCoordsInSVGUnits.y = y[q]
      manipulateProperty()
      unselectProperty()
    }
  }
  else if (prop.includes("shorten-pair")) {
    grobs = document.querySelectorAll('[gid="' + id + '"]')
    for (var q = 0; q < 2; q++) {
      currGrob = grobs[q]
      currCoordsInSVGUnits.x = x[q]
      manipulateProperty()
      unselectProperty()
    }
  }
  else {
    currGrob = document.querySelectorAll('[associatedprops-ids="'+prop+'='+id+';"]')[0]
    if (!isNaN(x))
      currCoordsInSVGUnits.x = x
    if (!isNaN(y))
      currCoordsInSVGUnits.y = y
    manipulateProperty()
    unselectProperty()
  }

}

function doTestStep6() {

  createNewLilypondDoc()
  doWhen(() => { return getLyFileContent() == "" },
         () => {
                logSuccess("Test with LilyPond " + lilyPondsList_[lilyPondsListCurrItem_] + " is successful")
                lilyPondsListCurrItem_++
                step_ = 1
                if (lilyPondsListCurrItem_ < lilyPondsList_.length && !lilyversion_) {
                    doTest(lilyversion_, removelilyinstall_)
                }
                else {
                  console.log("SUCCESS ")
                  logSuccess("All the tests are successful!")
                }
               },
        retryMs_)

}

export let pythonScript2 = "\
import os, glob\n\
testDir=os.path.join(os.getcwd(), '..', 'tests')\n\
os.remove(os.path.join(testDir,\"" + lyModFileNameWOExt_ + ".svg\"))\n\
for f in glob.glob(os.path.join(testDir, '*.bmp')):\n\
    os.remove(f)\n\
os.remove(os.path.join(testDir,\"" + lyModFileName_ + "\"))\n\
"

export let pythonScript1 = "\
import os, subprocess, traceback\n\
import platform\n\
\n\
def execCmd(cmd):\n\
  cliArr = cmd\n\
  try:\n\
    p = subprocess.run(cliArr, encoding='utf-8', stderr=subprocess.STDOUT, stdout=subprocess.PIPE)\n\
    print(p.stdout)\n\
    return p.stdout\n\
  except:\n\
    print(traceback.format_exc())\n\
    return traceback.format_exc()\n\
  return 'KO'\n\
\n\
testDir = os.path.join(os.getcwd(), '..', 'tests')\n\
perceptualRefsDir = os.path.join(testDir, 'perceptualrefs')\n\
\n\
svgWPath = os.path.join(testDir, '" + lyModFileNameWOExt_ + ".svg')\n\
\n\
perceptualMatchRes = 'KO'\n\
print()\n\
for refSvg in sorted(os.listdir(os.path.join(perceptualRefsDir))):\n\
  refSvgWPath = os.path.join(perceptualRefsDir, refSvg)\n\
  print(\"Comparing image with \" + refSvgWPath)\n\
  magickCmd = 'compare'\n\
  if platform.system() == 'Windows':\n\
    magickCmd = 'compare.exe'\n\
  res = execCmd([magickCmd, '-metric', 'phash', svgWPath, refSvgWPath, 'NULL:'])\n\
  res = round(float(res),5)\n\
  #print(\"Res=\" + str(res))\n\
  if res == 0:\n\
    perceptualMatchRes = 'OK'\n\
    break\n\
\n\
print(perceptualMatchRes)\n\
"

function doTestStep5() {

  logInfo((step_++) + ": executing ImageMagick compare test")
  var data1 = { cmd: 'EXEC_PYTHON_SCRIPT', param1: pythonScript1 }
  sendMsgToSpontiniServer2(data1, function(statusTxt1, responseTxt1)
  {
    if (statusTxt1 == "KO") {
      throw new Error("Error... (check webserver console)")
      return
    }
    if (responseTxt1.includes("KO")) {
      throw new Error(responseTxt1)
      return
    }
    logInfo((step_++) + ": delete files associated with " + lyModFileNameWOExt_)
    var data2 = { cmd: 'EXEC_PYTHON_SCRIPT', param1: pythonScript2 }
    sendMsgToSpontiniServer2(data2, function(statusTxt2, responseTxt2)
    {
      if (statusTxt2 == "KO") {
        throw new Error("Error... (check webserver console)")
        return
      }

      if (removelilyinstall_ && removelilyinstall_ == 'true') {
        logInfo((step_++) + ": uninstall LilyPond " + lilyPondsList_[lilyPondsListCurrItem_])
        var data3 = { cmd: 'UNINSTALL_LILYPOND', param1: lilyPondsList_[lilyPondsListCurrItem_] }
        sendMsgToSpontiniServer2(data3, function(statusTxt3, responseTxt3)
        {
          doTestStep6()
        })
      }
      else
        doTestStep6()

    })
  })

}

function doTestStep4() {

  logInfo((step_++) + ": save modified file")
  let newLyText = getLyFileContent().replace("showEditorStuff \"true\"", "showEditorStuff \"false\"")
  setLyFileContent(newLyText)
  saveLyFile()
  doWhen(() => { return document.getElementById("lyfilename").innerHTML == lyModFileName_ },
         () => {
                /*
                 * Instead of calling "compile()", here we choose to
                 * manually send a compile cmd to the server. Note that the compiled file
                 * will not update the SVG panel as compile() function does
                 */
                data = {
                  cmd: 'COMPILE',
                  param1: fileNameWPath,
                  param2: getLyFileContent(),
                  param3: "svg",
                  param4: "",
                  param5: getLyFileContent()
                }
                logInfo((step_++) + ": compile modified ly file")
                sendMsgToSpontiniServer2(data, function(statusTxt, responseTxt)
                {
                  if (statusTxt == "KO") {
                    throw new Error("Error while compiling modified ly file")
                    return
                  }
                  doTestStep5()
                })
               },
         retryMs_)

}

function doTestStep3() {

  logInfo((step_++) + ": manipulate objects")
  doMoveGrob(1,  "extra-offset", 8, 20)
  doMoveGrob(2,  "X-offset", 16, NaN)
  doMoveGrob(3,  "Y-offset", NaN, 20)
  doMoveGrob(4,  "padding", NaN, 20)
  doMoveGrob(5,  "outside-staff-padding", NaN, 20)
  doMoveGrob(6,  "staff-padding", NaN, 20)
  doMoveGrob(7,  "extra-offset-y", NaN, 40)
  doMoveGrob(8,  "X-offset", 16, NaN)
  doMoveGrob(9,  "Y-offset", NaN, 40)
  doMoveGrob(10, "padding", NaN, 40)
  doMoveGrob(11, "outside-staff-padding", NaN, 40)
  doMoveGrob(12, "staff-padding", NaN, 40)
  doMoveGrob(20, "shorten-pair", [20, 40], NaN)
  doMoveGrob(22, "cpts", [12, 4,  36, 28], [72, 80, 80, 72])
  doMoveGrob(23, "cpts", [44, 44, 68, 68], [64, 56, 56, 64])
  doMoveGrob(26, "positions", NaN, [0, 4], 1)
  doMoveGrob(27, "positions", NaN, [4, 4], 1)
  doMoveGrob(28, "X-offset", 16, NaN)

}

function doTestStep2() {

  logInfo((step_++) + ": compile "  + lyModFileName_ )
  compileLyFile(fileNameWPath, getLyFileContent(), getLyFileContent(), "svg", "")
  //the engraving was successful if we have an element with  extra-offset-propid="1" in the out SVG
  doWhen(() => { return document.getElementById("defaultimg").style.display == 'none' },
         () => {
                doTestStep3()
                doTestStep4()
               },
         retryMs_)

}

function doTestStep1() {

  var data = { cmd: 'SET_WORKSPACE', param1: "%%SPONTINI_SERVER_BASE%%/tests" }
  logInfo((step_++) + ": Switch to test workspace")
  sendMsgToSpontiniServer2(data, function(statusTxt, responseTxt)
  {
    if (statusTxt != "OK") {
      throw new Error("Can't set workspace!")
      return
    }
    logInfo((step_++) + ": open " + lyFileName_ )
    openLilypondDoc(lyFileName_ )
    doWhen(() => { return nullToStr(getLyFileContent()) != "" },
           () => {
                  logInfo((step_++) + ": save as " + lyModFileName_ )
                  tmpFilenameToSave = lyModFileName_
                  saveLyFile()
                  doWhen(() => { return fileNameWPath == lyModFileName_ },
                         () => { doTestStep2() },
                         retryMs_)
                 },
           retryMs_)
  })

}

export function doTest(lilyversion, removelilyinstall) {

  logInfo((step_++) + ": get autoinstallable LilyPonds list")
  var data1 = { cmd: 'AUTOINSTALLABLE_LILYPONDS_LIST' }
  sendMsgToSpontiniServer2(data1, function(statusTxt1, responseTxt1)
  {

    removelilyinstall_ = removelilyinstall
    lilyversion_       = lilyversion

    lilyPondsList_ = responseTxt1.split(";;::;;")
    if (lilyversion) {
      if (lilyPondsList_.includes(lilyversion))
        lilyPondsList_ = [lilyversion]
      else {
        throw new Error("Not supported LilyPond version: " + lilyversion)
        return
      }
    }

    logInfo((step_++) + ": install LilyPond " + lilyPondsList_[lilyPondsListCurrItem_])
    var data2 = { cmd: 'INSTALL_LILYPOND', param1: lilyPondsList_[lilyPondsListCurrItem_] }
    sendMsgToSpontiniServer2(data2, function(statusTxt2, responseTxt2)
    {
      if (statusTxt2 != "OK") {
        throw new Error("Can't install LilyPond!")
        return
      }
      logInfo((step_++) + ": set LilyPond: " + responseTxt2)
      var data3 = { cmd: 'SET_LILYPOND', param1: responseTxt2 }
      sendMsgToSpontiniServer2(data3, function(statusTxt3, responseTxt3)
      {
        if (statusTxt3 != "OK") {
          throw new Error("Can't install LilyPond!")
          return
        }
        doTestStep1()
      })
    })
  })

}
