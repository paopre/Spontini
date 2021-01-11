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

initSVGPanel()
createTxtEditor()
initKeymapsForTxtEditor()
setEventHandlersForTxtEditor()
// switch to block selection mode if the cursor is inside a cross staff table
setAutoSwitchToBlockSelection()

if (editorLayout == 5) {
  setLayout(1)
  setLayout(5)
}
else
  setLayout(editorLayout)

const query = window.location.search
const urlParams = new URLSearchParams(query)
const doc = urlParams.get('doc')
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

addEventListenersToWidgets()
resizeWidgets()

if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
  if (!window.HTMLDialogElement) {
    var notSupportedDialogErr = "Please complete the installation of the editor:\n"
    notSupportedDialogErr = notSupportedDialogErr + "visit \"about:config\" page "
    notSupportedDialogErr = notSupportedDialogErr + "and set \"dom.dialog_element.enabled\" preference to \"true\""
    alert(notSupportedDialogErr)
    window.location.href = "about:config"
  }
}

prepareMidiWithDefaultSoundFont()

document.title = "Spontini Editor"
