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

if (dialogEnabled)
{

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
prepareMidiWithDefaultSoundFont()
document.title = "Spontini Editor"

}
