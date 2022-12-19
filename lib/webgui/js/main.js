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

dialogEnabled = true

if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
  if (!window.HTMLDialogElement) {
    var notSupportedDialogErr = '<h2 style="text-align: center;">&nbsp;</h2>'+
                                '<h2 style="text-align: center;">One last step to do!</h2>'+
                                '<p style="text-align: center;">Please configure the browser for running Spontini-Editor:</p>'+
                                '<p style="text-align: center;">visit <strong>"about:config", </strong>set <strong>"dom.dialog_element.enabled"</strong>'+
                                ' preference to <strong>"true"</strong> and restart the browser.</p>'

    document.body.innerHTML = notSupportedDialogErr
    dialogEnabled = false
  }
}

if (dialogEnabled) {

initGraphicPanel()
createTxtEditor()
initKeymapsForTxtEditor()
setEventHandlersForTxtEditor()
// switch to block selection mode if the cursor is inside a cross staff table
setAutoSwitchToBlockSelection()
prepareMidiWithDefaultSoundFont()

if (editorLayout == 5) {
  setLayout(1)
  setLayout(5)
}
else
  setLayout(editorLayout)

const query = window.location.search
const urlParams = new URLSearchParams(query)
const doc = urlParams.get('doc')
const mobileModeParam = urlParams.get('mobilemode')

if (mobileModeParam != null) {
  if (mobileModeParam == "yes")
    mobileMode = true
}

function openOrCreateNewDoc() {

if (doc != null) {
  var data = {
    cmd: 'FILE_EXISTS',
    param1: doc
  }
  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (responseTxt == "YES") {
      openLilypondDoc(doc)
      //const url = new URL(window.location)
      //url.searchParams.delete('doc')
      //window.history.pushState({}, '', url)
    }
    else {
      createNewLilypondDoc(true)
    }
  }, false)
}
else
  createNewLilypondDoc(true)

}

var data = {
  cmd: 'GET_CONFIG_PARAM',
  param1: "default-mode"
}
sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
  if (responseTxt == "svg")
    baseCtx.defaultMode = baseCtx.currentMode = "svg"
  else
    baseCtx.defaultMode = baseCtx.currentMode = "pdf"
  openOrCreateNewDoc()
})

data = {
  cmd: 'TEMPLATE_LIST',
  param1: ""
}
sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
  if (statusTxt == "OK") {
    templates = responseTxt.split(templatesSepTkn)
    for (var i = 0; i < templates.length; i++) {
      templates[i] = "<"+templates[i]+">"
    }
    dictionary = dictionary.concat(templates)
  }
}, false)

addCustomSymbols()
addEventListenersToWidgets()
resizeWidgets()

data = {
  cmd: 'GET_CONFIG_PARAM',
  param1: "default-midi-input-channel"
}

if(navigator.requestMIDIAccess)
  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (responseTxt != "-1") {
      if (!isNaN(responseTxt))
        turnOnMidiInputAndListenOnChannel(parseInt(responseTxt))
    }
    else {
      turnOnMidiInputAndListenOnChannel(-1)
    }
  })

document.title = "Spontini Editor"

const test              = urlParams.get('test')
const lilyversion       = urlParams.get('lilyversion')
const removelilyinstall = urlParams.get('removelilyinstall')

async function loadAndExecTestModule(test, lilyversion, removelilyinstall) {
let {doTest} = await import('/files?filename=webgui-test-' + test + '.js');
  if (test == 1)
    doTest(lilyversion, removelilyinstall)
  else
    doTest()
}

if (test != null &&
    (location.host.includes("localhost") || location.host.includes("127.0.0.1")))
  loadAndExecTestModule(test, lilyversion, removelilyinstall)

} //if (dialogEnabled)
