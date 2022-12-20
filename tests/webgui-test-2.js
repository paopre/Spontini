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
 * This script executes two GUI tests.
 * It can be launched by opening: http://localhost:8000/spontini-editor?test=2
 * OR with Cypress. See README.txt for instructions
 */

/******************************************
 ******************************************
 * Test cross-staff/text editor tools
 ******************************************
 ******************************************/

function doEasyCrossStaffTest() {
/*
 * The following delay is not necessary for the test itself,
 * but it avoids that createNewLilypondDoc() clears the editor soon after
 * the content of the test is written
 */
window.setTimeout(() => {
  logInfo("Executing easyCrossStaff/texteditor test")
  addEasyCrossStaff()
  completeTableOrTemplateFunc(txtEditor())
  txtEditor().setCursor({line: 1, ch: 8})

  txtEditor().setCursor({line: 1, ch: 8})
  for (var i = 1; i < 4; i++) {
    insertColumnInTable("UP" + i, "DOWN" + i)
    let curs = txtEditor().getCursor()
    txtEditor().setCursor({line: 1, ch: curs.ch})
  }

  for (var i = 0; i < 3; i++)
    completeTableOrTemplateFunc(txtEditor())

  for (var i = 4; i < 7; i++) {
    insertColumnInTable("UP" + i, "DOWN" + i)
    let curs = txtEditor().getCursor()
    txtEditor().setCursor({line: 1, ch: curs.ch})
  }

  txtEditor().setCursor({line: 0, ch: 0})
  execTool("genericvarsblockmarker")

  txtEditor().setCursor({line: 9, ch: 18})

  txtEditor().setSelection({line: 9, ch: 18}, {line: 9, ch: 24})
  execTool("markwithvariable")

  var expectedText =
  "%----------------%\n" +
  "% START __VARS__ %\n" +
  "%----------------%\n" +
  "\n" +
  "#(define v1 #{\n" +
  "DOWN2\n" +
  "#})\n" +
  "\n" +
  "%----------------%\n" +
  "% END __VARS__   %\n" +
  "%----------------%\n" +
  "\\easyCrossStaff %TMODE\n" +
  "  { \\CS UP1   \\CS UP2 \\CS UP3   \\CS s \\CS s \\CS s \\CS UP4   \\CS UP5   \\CS UP6   \\CS }\n" +
  "  { \\CS DOWN1 \\CS $v1 \\CS DOWN3 \\CS s \\CS s \\CS s \\CS DOWN4 \\CS DOWN5 \\CS DOWN6 \\CS }\n" +
  "#'( \\CS -     \\CS -   \\CS -     \\CS - \\CS - \\CS - \\CS -     \\CS -     \\CS -     \\CS )\n"

  if (expectedText == getLyFileContent()) {
    logSuccess("EasyCrossStaff/texteditor test is successful")
    doPDFTest()
  }
  else
    throw new Error("EasyCrossStaff/texteditor test failed: the text that appears on the editor is not what is expected to be")

}, 1000) //setTimeout
}

/******************************************
 ******************************************
 * Test pdf.js
 ******************************************
 ******************************************/

export let retryMs_ = 500
export let step_    = 1

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

function doPDFTest() {
  logInfo("Executing PDF test")
  var data = { cmd: 'SET_WORKSPACE', param1: "%%SPONTINI_SERVER_BASE%%/tests" }
  logInfo((step_++) + ": Switch to test workspace")
  sendMsgToSpontiniServer2(data, function(statusTxt, responseTxt)
  {
    if (statusTxt != "OK") {
      throw new Error("Can't set workspace!")
      return
    }

    let fName = "test-pdf.ly"
    logInfo((step_++) + ": open " + fName)
    openLilypondDoc(fName)
    doWhen(() => { return pdfAnnotations != null && pdfAnnotations.size == 1 },
           () => {
                   logInfo((step_++) + ": check if 11 annotations are created and " +
                   "a point and click rect can be created with annotaion index == 10")
                   let pointAndClickRect = document.getElementById("pdfpointandclickrect")
                   resizeAndShowPdfAnnotationRect(pdfAnnotations.get(1)[10].pageAnnotation)
                   if (pointAndClickRect.style.left.includes('px')) {
                     console.log("SUCCESS")
                     logSuccess("PDF test is successful")
                   }
                 },
           retryMs_)
  })

}

export function doTest() {
  doEasyCrossStaffTest()
}
