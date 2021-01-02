/*
 * Created (06/10/2020) by Paolo-Prete.
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

//TODO refactor these functions with better names and params

var currSoundFontURL = null
var defaultplayiconimg = null
var defaultstopiconimg = null
var alreadyWarnedForNoSoundfont = false
var defaultSFLoaded = false

async function prepareMidiPlayer(midiFileName) {

  var data2 = {
    cmd: 'FILE_EXISTS',
    param1: midiFileName
  }

  player = document.getElementById('midi-player')
  player.soundFont = currSoundFontURL

  const shRoot = player.shadowRoot

  if (!player.shadowRoot)
    return

  var playiconspan = shRoot.querySelectorAll('.icon.play-icon')[0]
  var stopiconspan = shRoot.querySelectorAll('.icon.stop-icon')[0]
  if (!defaultplayiconimg) {
    defaultplayiconimg = playiconspan.innerHTML
    defaultstopiconimg = stopiconspan.innerHTML
  }

  if (!player.soundFont) {
    msg = "No soundfont loaded.\n"
    msg += "In order to load a soundfont, use:\n\n"
    msg += "   TOOLS -> Set WEB-midi soundfont\n\nCheck available soundfonts' URLs at "
    msg += "https://magenta.github.io/magenta-js/music/index.html#soundfonts"
    if (!alreadyWarnedForNoSoundfont) {
      logWarning(msg)
      alreadyWarnedForNoSoundfont = true
    }
    playiconspan.innerHTML = "<img src='images/play-warn.svg'>"
    stopiconspan.innerHTML = "<img src='images/stop-warn.svg'>"
    document.getElementById("midi-player").title='No soundfont loaded!\n'+
                                                  'Set it with TOOLS -> Set WEB-midi soundfont'
  }
  else {
    playiconspan.innerHTML = defaultplayiconimg
    stopiconspan.innerHTML = defaultstopiconimg
    document.getElementById("midi-player").title=''
  }

  if (player.soundFont && midiFileName !='') {
    // prepare midi player so it will automatically download the midi file
    sendMsgToSpontiniServer(data2, function(statusTxt2, responseTxt2) {
      if (responseTxt2 == "YES") {
        var src = serverProtocolAndHost+"/files?filename="+midiFileName
        document.getElementById('midi-player').src = src
      }
      else
        document.getElementById('midi-player').src = ''
    })
  }

}

async function setSoundFontAndPrepareMidiPlayer(sf, origin=""){
  try {
    midiFileName = ""
    if(sf != "") {
      const player = new core.SoundFontPlayer(sf);
      fooSound = {notes:[{pitch: 60, startTime: 0.0, endTime: 0.5}]}
      const promise = player.loadSamples(fooSound)
      await promise
    }
    currSoundFontURL = sf

    midiFileName = ""
    if ((fileNameWPath != null) &&
        (fileNameWPath != "") &&
        (fileNameWPath != "untitled")) {
      fileName = fileNameWPath.split("/").pop()
      if (fileName.startsWith(modFileLabelToken))
        fileName = fileName.substring(modFileLabelToken.length)
      midiFileName = fileName.replace('.ly','.midi')
    }

    if (origin !="") {
      alert("Soundfont set!")
      executingToolInProgress = false
      document.getElementById('exectoolbtn').style = origin
    }
  }
  catch (error) {
    logError("Could not set SoundFont: "+error)
    if (origin != "") {
      alert("Could not set SoundFont! Check the browsers's console for details")
      executingToolInProgress = false
      document.getElementById('exectoolbtn').style = origin
    }
  }

  prepareMidiPlayer(midiFileName)
}

function prepareMidiWithDefaultSoundFont() {
  var data = {
    cmd: 'GET_CONFIG_PARAM',
    param1: "soundfont-url"
  }
  sendMsgToSpontiniServer(data, function(statusTxt, responseTxt) {
    if (statusTxt == "OK")
      setSoundFontAndPrepareMidiPlayer(responseTxt)
    else
      setSoundFontAndPrepareMidiPlayer("")

  })
}

async function promptSoundFontURL(exectoolbtndefaultstyle) {

  msg = "Please insert the soundfont's URL\n"
  msg += "Check available soundfonts' URLs at: \n"
  msg += "https://magenta.github.io/magenta-js/music/index.html#soundfonts"
  sf = prompt(msg)
  if (!sf || sf.trim() == '') {
    executingToolInProgress = false
    exectoolbtn.style = exectoolbtndefaultstyle
    return
  }

  setSoundFontAndPrepareMidiPlayer(sf, exectoolbtndefaultstyle)

}
