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
from sys import argv

if sys.version_info[0] != 3 or sys.version_info[1] < 6:
  error = "Could not run "+argv[0]+"!\n\n"
  error += "Python >= 3.6 is required\n"
  error += "but the application has been launched with Python "
  error += str(sys.version_info[0])+"."+str(sys.version_info[1])

  if (sys.version_info[0] != 3) and 'nogui' not in argv:
    import Tkinter
    import tkMessageBox
    tkMessageBox.showerror("Error", error)

  elif 'nogui' not in argv:
    from tkinter import messagebox
    messagebox.showerror("Error", error)

  else:
    print("ERROR!\n"+error)

  sys.exit(1)

import os
sys.path.insert(1, os.path.join(os.path.dirname(__file__), "lib", "python"))
from spontini_server_utils import (setPip3AndVenvParams, getVenvName,
                                   getVenvedExecDir, checkAndInstallModule,
                                   upgradePip, terminateSpawnedProcesses)

import subprocess
from subprocess import PIPE
import threading
import subprocess
from datetime import datetime
import traceback

wsThread = None
webServerProc = None
webserverScript = os.path.join(os.path.dirname(__file__),
                               "lib", "python",
                               "spontini_server_webserver.py")

sendMsgScript = os.path.join(os.path.dirname(__file__),
                             "lib", "python",
                             "send_msg.py")

webserverCLI = None
sendMsgCLI = None

webServerURL = ""
textArea = None

def getWebserverParam(param):
  try:
    path = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                        "lib",
                                        "python",
                                        "protocolAndPort"))
    fp = open(path,'r')
    ret = ""
    if param == "protocol":
      ret = fp.readline().rstrip().split(":")[0]
    else:
      ret = int(fp.readline().rstrip().split(":")[1])
    fp.close()
    return ret
  except:
    pass

def message(txt, loggerTag = None,
            startTagIdx = 0, endTagIdx = 0, startMsgIdx = 0):
  global textArea
  if not textArea:
    return
  textArea.config(state="normal")
  firstNonPrintableCharIdx = len(txt)
  for i in range (startMsgIdx,len(txt)):
    if not txt[i].isprintable():
      firstNonPrintableCharIdx = i
      break
  if loggerTag:
    textArea.insert(END, txt[startTagIdx:endTagIdx], loggerTag)
    textArea.insert(END, " "+txt[startMsgIdx:firstNonPrintableCharIdx]+"\n")
    if "%%TKGUICLEARSCREEN%%" in txt:
      textArea.delete('1.0', END)
  else:
    textArea.insert(END, txt[:firstNonPrintableCharIdx])
    textArea.insert(END, "\n")
  textArea.config(state="disabled")
  textArea.see("end")

def initVenvWithModules():

  global webserverCLI
  global sendMsgCLI
  pipAndVenvParams = None
  pip3Exists = False
  venvExists = False

  error = True
  pipAndVenvParams = setPip3AndVenvParams(log)
  pip3Exists = pipAndVenvParams[0]
  venvExists = pipAndVenvParams[1]
  error = (not pip3Exists) or (not venvExists)
  if not error:

    log("", "I")

    log("*** Upgrading pip ***", "I")
    try:
      error = not upgradePip(log)
    except:
      log(traceback.format_exc(), "E")
      error = True

    if not error:
      log("*** Checking required modules ***", "I")
      requirementsFile = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                                                "lib", "python", "requirements.txt"))

      pip3VenvCmd = os.path.join(pipAndVenvParams[2], "pip3")
      installedModules = subprocess.check_output([pip3VenvCmd, "freeze"], encoding='utf-8')

      fp = open(requirementsFile,'r')
      while True and not error:
        module = fp.readline().rstrip()
        if not module:
          break
        if module.startswith("#"):
          continue
        try:
          error = not checkAndInstallModule(module, installedModules, log)
          if error:
            break
        except:
          log(traceback.format_exc(), "E")
          error = True
          break

      fp.close()

  if error:
    log("Installation not completed", "C")
    return not error

  webserverCLI = [pipAndVenvParams[3], webserverScript]
  sendMsgCLI = [pipAndVenvParams[3], sendMsgScript]

  log("", "I")
  return not error

def WebServerThread():
  global webServerProc
  global webServerURL
  global webserverCLI
  global sendMsgCLI

  initStatus = initVenvWithModules()
  if not initStatus:
    return

  webServerProc = subprocess.Popen(webserverCLI,
                                   stdout=subprocess.PIPE,
                                   stderr=subprocess.STDOUT)
  while True:
    line = webServerProc.stdout.readline()
    if not line:
      break
    try:
      if webServerURL == "":
        protocol = getWebserverParam("protocol")
        webServerURL = protocol + "://localhost:"
        webServerURL += str(getWebserverParam("port")) + "/cgi"
    except:
      pass
    stdout = str(bytes(line).decode("utf8")).replace("\n", "")
    tagged = True
    brightGreenTag = "\033[01;32m"
    criticalTag = "\033[01;31m\033[47m"
    lenOfSimpleColorTag = len("\033[36m")
    lenOfDateTkn = len("2020-12-05 00:27:18 [I]")
    startTagIdx = lenOfSimpleColorTag
    endTagIdx = lenOfDateTkn + startTagIdx
    startMsgIdx = endTagIdx + lenOfSimpleColorTag
    loggerTag = None
    if stdout.startswith("\033[35m"):
      loggerTag = "D"
    elif stdout.startswith("\033[36m"):
      loggerTag = "I"
    elif stdout.startswith("\033[31m"):
      loggerTag = "E"
      startMsgIdx = startMsgIdx + lenOfSimpleColorTag
    elif stdout.startswith(brightGreenTag):
      startTagIdx = len(brightGreenTag)
      endTagIdx = lenOfDateTkn + startTagIdx
      startMsgIdx = endTagIdx + len(brightGreenTag) - 3 #why 3??
      loggerTag = "S"
    elif stdout.startswith("\033[33m"):
      loggerTag = "W"
    elif stdout.startswith(criticalTag):
      startTagIdx = len(criticalTag)
      endTagIdx = lenOfDateTkn + startTagIdx
      startMsgIdx = endTagIdx + len(criticalTag) - 3 #why 3??
      loggerTag = "C"
    else:
      tagged = False

    if tagged:
      message(stdout, loggerTag, startTagIdx, endTagIdx, startMsgIdx)
    else:
      #TODO FIXME: use a proper filter.
      #HINT: logging.getLogger(...) (however, currently
      #it's not easy to figure which logger must be silented)
      trashLog = False
      if "\"OPTIONS /cgi\"" in stdout or "POST /cgi" in stdout or "\"GET " in stdout:
        trashLog = True
      if not trashLog:
        message(stdout)

def log(msg, tag=""):
  global textArea
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
    textArea.config(state="disabled")
    textArea.see("end")
  else:
    print(strout+"["+tag+"] "+msg)

def startWebServerThread():

  global wsThread
  wsThread = threading.Thread(target=WebServerThread)
  wsThread.setDaemon(True)
  wsThread.start()

def sendMsgToServer(msg):
  global webServerURL
  if webServerURL == "":
    return
  elif webServerURL.startswith("onion"):
    from tkinter.messagebox import showerror
    showerror(title = "Error", message = "Not enabled on this GUI: please set it through CGI")
    return
  newCLI = sendMsgCLI[:]
  newCLI.append(webServerURL)
  newCLI.append(msg)
  subprocess.run(newCLI)

def setWorkspace():
  global webServerURL
  if webServerURL == "":
    return
  ws = askdirectory()
  if ws:
    sendMsgToServer('{"cmd":"SET_WORKSPACE", "param1":"'+ws+'"}')

def setLilypond():
  pickedFile = askopenfilename(title = "Select Lilypond executable")
  if pickedFile:
    sendMsgToServer('{"cmd":"SET_LILYPOND", "param1":"'+pickedFile+'"}')

def resetLilypond():
  sendMsgToServer('{"cmd":"RESET_LILYPOND", "param1":""}')

def clearScreen():
  sendMsgToServer('{"cmd":"TKGUICLEARSCREEN", "param1":""}')

def start():
  pass

if 'nogui' in argv:
  initVenvWithModules()
  subprocess.run(webserverCLI)

else:

  import tkinter as tk
  from tkinter import *
  from tkinter.filedialog import askdirectory
  from tkinter.filedialog import askopenfilename

  win = Tk()
  win.title("Spontini Server")
  logoFilePath = os.path.join(os.path.dirname(__file__),
                              "lib", "webgui", "images", "logo.png")
  logo = PhotoImage(file = logoFilePath)
  win.iconphoto(False, logo)
  menubar = Menu(win)
  options = Menu(menubar, tearoff=0)
  options.add_command(label="Set workspace", command=setWorkspace)
  options.add_command(label="Set Lilypond", command=setLilypond)
  options.add_command(label="Reset Lilypond", command=resetLilypond)
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
  startWebServerThread()
  win.mainloop()
  textArea = None
  if webServerProc:
    webServerProc.terminate()
  wsThread.join()
  #TODO FIXME On win, atexit handled function is not called (??)
  # then we explicitly call terminateSpawnedProcesses here too.
  # Fix this duplication.
  terminateSpawnedProcesses()

