#!/usr/bin/env python3
#
# Created (28/11/2020) by Paolo-Prete.
# This file is part of Spontini-Editor project.
#
# Spontini-Editor is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# Spontini-Editor is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
#

import sys
import re
from sys import argv
from lib.python.spontini_server_utils import *
import threading
from queue import Queue
import uvicorn
import tkinter
from tkinter import ttk
from tkinter.filedialog import askdirectory
from tkinter.filedialog import askopenfilename
from tkinter.messagebox import showerror
import httpx
import json
import time

webServerThread = None
textArea = None
installLilyPondDialogInstance = None
installLilyPondDialogBtnOKDefaultColor = None
win = None
msgQueueForTkGUI = None

def showReExecuteError():

  showerror(message = "Re-execute the command after the server initialization is completed")

def doSendMsgToServer(msg):
  r = None
  protocol = "http"
  if "ssl_keyfile" in cli:
    protocol = "https"
  port = cli["port"]
  webServerURL = protocol + "://localhost:" + str(cli["port"]) + "/cgi"
  if "https" in webServerURL:
    #we are on the server(localhost)
    r = httpx.post(webServerURL, data=msg, verify=False, timeout=2600)
  else: #http
    r = httpx.post(webServerURL, data=msg, timeout=2600)
  return r.json()["content"]

def sendMsgToServer(msg, threaded=False):
  global webServerThread
  if threaded:
    webServerThread = threading.Thread(target=doSendMsgToServer, args=(msg, )).start()
    return
  else:
    return doSendMsgToServer(msg)

def setWorkspace():
  try:
    sendMsgToServer('{"cmd":"DUMMY"}')
  except Exception as e:
    showReExecuteError()
    return
  ws = askdirectory()
  if ws:
    sendMsgToServer('{"cmd":"SET_WORKSPACE", "param1":"'+ws+'"}')

def onLilyPondDialogDestroy(*args):
  global installLilyPondDialogInstance
  global installLilyPondDialogBtnOKDefaultColor
  installLilyPondDialogInstance = None
  installLilyPondDialogBtnOKDefaultColor = None

def openInstallLilyPondDialog():

  class InstallLilyPondDialog:

    def doInstallLilyPond(self):
      selectedVersion = self.c.get()
      if selectedVersion == "":
        return
      waitInstallColor = "yellow"
      self.btnOk["bg"] = waitInstallColor
      self.btnOk["activebackground"] = waitInstallColor
      sendMsgToServer('{"cmd":"INSTALL_LILYPOND", "param1":"' + selectedVersion + '"}', True)

    def __init__(self):
      global installLilyPondDialogInstance
      global installLilyPondDialogBtnOKDefaultColor
      global win

      if installLilyPondDialogInstance != None:
        return

      res = ""
      try:
        res = sendMsgToServer('{"cmd":"AUTOINSTALLABLE_LILYPONDS_LIST"}')
      except Exception as e:
        showReExecuteError()
        return

      versions = res.split(';;::;;')
      if len(versions) == 0:
        showReExecuteError()
        return

      installLilyPondDialogInstance = self
      self.t = Toplevel()
      self.t.bind('<Destroy>', onLilyPondDialogDestroy)
      self.t.resizable(0,0)
      self.t.title("Install LilyPond")
      self.selection = None
      x = win.winfo_x()
      y = win.winfo_y()
      self.t.geometry("+%d+%d" % (x, y))

      currRow = 0
      colSpan = 5
      spanner = "                    "
      Label(self.t, text=spanner + "Choose a version:" + spanner).grid(row=currRow, column=0, columnspan=colSpan)
      currRow += 1

      self.c = ttk.Combobox(self.t, value=versions, state="readonly")
      self.c.grid(row=currRow, column=0, columnspan=colSpan)
      currRow += 1

      Label(self.t, text="").grid(row=currRow, column=0, columnspan=colSpan)
      currRow += 1

      Label(self.t, text=" ").grid(row=currRow, column=0)

      self.btnOk = tkinter.Button(self.t, text="INSTALL", command=self.doInstallLilyPond)
      self.btnOk.grid(row=currRow, column=1, sticky='nesw')
      installLilyPondDialogBtnOKDefaultColor = self.btnOk["bg"]
      Label(self.t, text=" ").grid(row=currRow, column=2)
      self.btnCancel = tkinter.Button(self.t, text="CLOSE", command=self.t.destroy)
      self.btnCancel.grid(row=currRow, column=3, sticky='nesw')
      Label(self.t, text=" ").grid(row=currRow, column=4)
      #self.c.bind("<<ComboboxSelected>>", self.combobox_select)

  a = InstallLilyPondDialog()

def setLilypond():
  try:
    sendMsgToServer('{"cmd":"DUMMY"}')
  except Exception as e:
    showReExecuteError()
    return
  pickedFile = askopenfilename(title = "Select Lilypond executable")
  if pickedFile:
    sendMsgToServer('{"cmd":"SET_LILYPOND", "param1":"'+pickedFile+'"}')

def resetLilypond():
  try:
    sendMsgToServer('{"cmd":"DUMMY"}')
  except Exception as e:
    showReExecuteError()
    return
  sendMsgToServer('{"cmd":"RESET_LILYPOND", "param1":""}', True)

def clearScreen():
  try:
    sendMsgToServer('{"cmd":"DUMMY"}')
  except Exception as e:
    showReExecuteError()
    return
  sendMsgToServer('{"cmd":"TKGUICLEARSCREEN", "param1":""}', True)

def start():
  pass

def log(textArea, msg, tag=""):
  global installLilyPondDialogInstance
  global installLilyPondDialogBtnOKDefaultColor
  if tag == 'D':
    return
  strout = datetime.now().strftime("%Y-%m-%d %H:%M:%S ")
  if textArea != None:
    msgLines = msg.split("\n")
    textArea.config(state="normal")
    for msgLine in msgLines:
      if tag != "":
        textArea.insert(END, strout+"["+tag+"]", tag)
        textArea.insert(END, " "+msgLine+"\n")
      else:
        textArea.insert(END, msgLine+"\n")
    if "%%TKGUICLEARSCREEN%%" in msg:
      textArea.delete('1.0', END)
    #FIXME: surely a workaround, but I can't find a better/easier way to catch this without threading
    regex = r"LilyPond \S+ installed"
    if re.search(regex, msg) and installLilyPondDialogInstance != None and \
      installLilyPondDialogBtnOKDefaultColor != None:
      installLilyPondDialogInstance.btnOk["bg"] = installLilyPondDialogBtnOKDefaultColor
      installLilyPondDialogInstance.btnOk["activebackground"] = installLilyPondDialogBtnOKDefaultColor

    textArea.config(state="disabled")
    textArea.see("end")
  else:
    print(strout+"["+tag+"] "+msg)

def checkAndPrintStdout():
  global textArea
  global win
  global msgQueueForTkGUI
  while msgQueueForTkGUI.qsize() >= 1:
    msg = msgQueueForTkGUI.get()
    log(textArea,  str(msg[0]), msg[1])
  win.after(100, checkAndPrintStdout)

#TODO: implement for Daphne too?
def runASGIServer():
  uvicornCLIFile = open(os.path.join(getLibPythonPath(), 'uvicorn_cli.txt'))
  uvicornCLITxtLines = uvicornCLIFile.readlines()
  uvicornCLITxt = ""
  for line in uvicornCLITxtLines:
    if not line.startswith("#"):
      uvicornCLITxt += line

  uvicornCLI = json.loads(uvicornCLITxt)
  uvicornCLIFile.close()
  uvicorn.run(**uvicornCLI)

def runThreadedASGIServer():
  global webServerThread
  webServerThread = threading.Thread(target=runASGIServer)
  webServerThread.daemon = True
  webServerThread.start()

#----------------------------
#----------------------------
#   INIT
#----------------------------
#----------------------------

def main():

  if 'nogui' in argv:
    runASGIServer()

  else:
    global webServerThread
    global textArea
    global installLilyPondDialogInstance
    global installLilyPondDialogBtnOKDefaultColor
    global win
    global msgQueueForTkGUI

    msgQueueForTkGUI = Queue()
    setMsgQueueForTkGUI(msgQueueForTkGUI)
    win = Tk()
    win.title("Spontini Server")
    logoFilePath = os.path.join(getLibPythonPath(), "..", "..",
                                "lib", "webgui", "images", "logo.png")
    logo = PhotoImage(file = logoFilePath)
    win.iconphoto(False, logo)
    menubar = Menu(win)
    options = Menu(menubar, tearoff=0)
    options.add_command(label="Set workspace", command=setWorkspace)
    options.add_command(label="Install LilyPond", command=openInstallLilyPondDialog)
    options.add_command(label="Set LilyPond", command=setLilypond)
    options.add_command(label="Reset LilyPond", command=resetLilypond)
    options.add_command(label="Clear screen", command=clearScreen)
    menubar.add_cascade(label="OPTIONS", menu=options)
    win.config(menu=menubar)

    h = Scrollbar(win, orient = 'horizontal')
    h.pack(side = BOTTOM, fill = X)
    v = Scrollbar(win)
    v.pack(side = RIGHT, fill = Y)
    textArea = Text(win, bg="black", fg = "white", wrap=NONE, font = 'TkFixedFont',
                    state="disabled", xscrollcommand = h.set,  yscrollcommand = v.set)
    # allow copy
    textArea.bind("<Button>", lambda event: textArea.focus_set())
    textArea.tag_config('I', foreground='cyan')
    textArea.tag_config('S', foreground='#00FF00')
    textArea.tag_config('E', foreground='red')
    textArea.tag_config('W', foreground='yellow')
    textArea.tag_config('C', foreground='red', background='white')
    textArea.tag_config('D', foreground='magenta')
    textArea.pack(side=TOP, fill="both", expand=True)
    h.config(command=textArea.xview)
    v.config(command=textArea.yview)
    runThreadedASGIServer()
    win.after(0, checkAndPrintStdout)
    win.mainloop()

if __name__ == "__main__":
  main()
