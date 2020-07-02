#!/usr/bin/env python3
#
# Created (28/12/2019) by Paolo-Prete.
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

from sys import argv
from http.server import BaseHTTPRequestHandler, HTTPServer
from json import dumps
import subprocess
import cgi
import json
import os
import shutil
import pathlib
from subprocess import PIPE
from tkinter import *
from tkinter.filedialog import askdirectory
import threading

port = 8764
autoStart = "no"
wsDirPath = os.path.dirname(__file__)
baseDirAbsolutePath = pathlib.Path(".").resolve()
httpd = None

class RequestHandler(BaseHTTPRequestHandler):

  def checkIfIsChildFile(self, possibleChild, possibleParent, extension): 
    ret = (possibleChild == possibleParent.replace(".ly", extension))
    ret = ret or ((possibleChild.startswith(possibleParent.replace(".ly", "")+"-")) and possibleChild.endswith(extension))
    return ret
  
  def _send_cors_headers(self):
    """ Sets headers required for CORS """
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    self.send_header("Access-Control-Allow-Headers", "x-api-key,Content-Type")

  def send_complete_response(self, msg):
    self.send_response(200, msg)
    self._send_cors_headers()
    self.send_header("Content-Type", "application/json")
    self.end_headers()

  def do_OPTIONS(self):
    self.send_complete_response("OK")

  def do_POST(self):

    length = int(self.headers.get('Content-length'))
    message = json.loads(self.rfile.read(length))
    response = {}
    
    if message['cmd'] == 'SAVE':
      
      lilyFileWithPath = os.path.join(wsDirPath, message['param1'])
      content = message['param2'].encode('utf-8').strip()
      print (content)
      print ("Saving file: " + lilyFileWithPath)
      f = open(lilyFileWithPath,'wb')
      f.write(content)
      f.close()			
      self.send_complete_response("OK")

    if message['cmd'] == 'DELETE':
      
      inputFileName = message['param1']
      inputFileNameWOSuffix = message['param1'].replace(".ly", "")
      lilyFileWithPath = os.path.join(wsDirPath, inputFileName)
      print ("Deleting files associated to: " + lilyFileWithPath)
      os.remove(os.path.join(lilyFileWithPath))
      
      for currFile in sorted(os.listdir(wsDirPath)):
        if currFile == inputFileNameWOSuffix+".svg" :     
          os.remove(os.path.join(wsDirPath, currFile))
        if currFile.startswith(inputFileNameWOSuffix+"-") and currFile.endswith(".svg") :
          os.remove(os.path.join(wsDirPath, currFile))
          
      self.send_complete_response("OK")
      
    if message['cmd'] == 'COMPILE':
      
      inputFileName = message['param1']
      lilyFileWithPath = os.path.join(wsDirPath, inputFileName)
      content = message['param2'].encode('utf-8').strip()
      print ("Saving file: " + lilyFileWithPath)
      f = open(lilyFileWithPath,'wb')
      f.write(content)
      f.close()
      for currFile in os.listdir(wsDirPath):
        if self.checkIfIsChildFile(currFile, inputFileName, ".svg")  :
          os.rename(os.path.join(wsDirPath, currFile), 
            os.path.join(wsDirPath, currFile.replace(".svg", ".ljssvgswap")))
        
      print ("Compiling file: "+lilyFileWithPath)
      p = subprocess.run(["lilypond", "-dbackend=svg", "-o", wsDirPath, lilyFileWithPath], 
                         encoding='utf-8', stderr=subprocess.STDOUT, stdout=subprocess.PIPE)
      if p.returncode == 0:
        for currFile in os.listdir(wsDirPath):
          if self.checkIfIsChildFile(currFile, inputFileName, ".ljssvgswap")  :
            os.remove(os.path.join(wsDirPath, currFile))
        numPages = 0
        for currFile in os.listdir(wsDirPath):
          if self.checkIfIsChildFile(currFile, inputFileName, ".svg") :
            numPages += 1
        self.send_complete_response("OK_"+str(numPages))            
      else:
        for currFile in os.listdir(wsDirPath):
          if self.checkIfIsChildFile(currFile, inputFileName, ".ljssvgswap") :
            os.rename(os.path.join(wsDirPath, currFile), 
              os.path.join(wsDirPath, currFile.replace(".ljssvgswap", ".svg")))        
        self.send_complete_response("KO")
      self.wfile.write(p.stdout.encode("utf8"))        

    if message['cmd'] == 'SVG_CONTENT':
      lilyFileWithPath = os.path.join(wsDirPath, message['param1'])
      self.send_complete_response("OK")
      with open(lilyFileWithPath, 'rb') as f:
        shutil.copyfileobj(f, self.wfile)

    if message['cmd'] == 'LY_CONTENT':
      lilyFileWithPath = os.path.join(wsDirPath, message['param1'])
      self.send_complete_response("OK")
      with open(lilyFileWithPath, 'rb') as f:
        shutil.copyfileobj(f, self.wfile)        
        
    if message['cmd'] == 'FILE_LIST':
      filelist = ""
      sepTkn = ";;::;;"
      for currFile in sorted(os.listdir(wsDirPath)):
        if currFile.endswith(".ly"):
          filelist = filelist + currFile + sepTkn
      if filelist.endswith(sepTkn):
        filelist = filelist[0:-len(sepTkn)]
      self.send_complete_response("OK")
      self.wfile.write(filelist.encode("utf8"))  
      
    if message['cmd'] == 'FILE_EXISTS':
      res = "NO"
      for currFile in sorted(os.listdir(wsDirPath)):
        if currFile == message['param1']:
          res = "YES"
      self.send_complete_response("OK")
      self.wfile.write(res.encode("utf8"))
      
    if message['cmd'] == 'NUM_SVG_PAGES':
      resNum = 0
      fileName = message['param1'].replace(".ly", "")
      for currFile in sorted(os.listdir(wsDirPath)):
        if currFile == fileName + ".svg":
          resNum = 1
        if currFile.startswith(fileName+"-") and currFile.endswith(".svg"):
          resNum = resNum + 1
      self.send_complete_response("OK")
      self.wfile.write(str(resNum).encode("utf8"))      

#https://stackoverflow.com/questions/3221956/how-do-i-display-tooltips-in-tkinter
class CreateToolTip(object):
    """
    create a tooltip for a given widget
    """
    def __init__(self, widget, text='widget info'):
        self.waittime = 500     #miliseconds
        self.wraplength = 180   #pixels
        self.widget = widget
        self.text = text
        self.widget.bind("<Enter>", self.enter)
        self.widget.bind("<Leave>", self.leave)
        self.widget.bind("<ButtonPress>", self.leave)
        self.id = None
        self.tw = None

    def enter(self, event=None):
        self.schedule()

    def leave(self, event=None):
        self.unschedule()
        self.hidetip()

    def schedule(self):
        self.unschedule()
        self.id = self.widget.after(self.waittime, self.showtip)

    def unschedule(self):
        id = self.id
        self.id = None
        if id:
            self.widget.after_cancel(id)

    def showtip(self, event=None):
        x = y = 0
        x, y, cx, cy = self.widget.bbox("insert")
        x += self.widget.winfo_rootx() + 25
        y += self.widget.winfo_rooty() + 20
        # creates a toplevel window
        self.tw = Toplevel(self.widget)
        # Leaves only the label and removes the app window
        self.tw.wm_overrideredirect(True)
        self.tw.wm_geometry("+%d+%d" % (x, y))
        label = Label(self.tw, text=self.text, justify='left',
                       background="#ffffff", relief='solid', borderwidth=1,
                       wraplength = self.wraplength)
        label.pack(ipadx=1)

    def hidetip(self):
        tw = self.tw
        self.tw= None
        if tw:
            tw.destroy()

if len(argv) >= 2:
  wsDirPath = argv[1]

if len(argv) == 3:
  port = int(argv[2])

configFile = os.path.join(os.path.dirname(__file__), "SpontiniHelperConfig.txt")
try:
  with open(configFile) as fp:
    line = fp.readline().rstrip()
    while line:
      try: 
        parm = line.split("=")[0]
        val = line.split("=")[1]
        
        if parm == "workspace" :          
          wsDirPath = val
          # Workaround for a Lilypond Bug (the compile command doesn't work with abs path
          # on the base directory)      
          if str(wsDirPath) == str(baseDirAbsolutePath):
            wsDirPath = "."          
        
        if parm == "port" :
          port = int(val)
        
        if parm == "autostart":        
          autoStart = val
          
      except:
        print ("[WARNING] bad config line: "+line+" -> ignoring it")
        
      line = fp.readline().rstrip()

except:
   print ("Could not open config file. Using default values...")

### GUI
window = Tk()
def closeCallback():
  global httpd
  if httpd:
    httpd.shutdown()
    httpd.server_close()
  window.destroy()
  
window.protocol("WM_DELETE_WINDOW", closeCallback)
fontsize = 10
commonpad = 5
window.title("Spontini Python Helper")
fakeSpacer = "   "

### ROW 0
emptyLabel0 = Label(window, text=fakeSpacer, font=('monospace', fontsize))
emptyLabel0.grid(row=0, column=0)

portLabel = Label(window, width=4, text="Port", font=('monospace', fontsize))
portLabel.grid(row=0, column=1, sticky=W)

portEntry = Entry(window, width=5, font=('monospace', fontsize))
portEntry.insert(0, str(port))
portEntry.grid(row=0, column=2, sticky=W)

emptyLabel1 = Label(window, text=fakeSpacer, font=('monospace', fontsize))
emptyLabel1.grid(row=0, column=3)

### ROW 1
def chooseWSBtnClicked():
  folderSelected =  askdirectory()
  if folderSelected:
    # Workaround for a Lilypond Bug (the compile command doesn't work with abs path
    # on the base directory)
    if folderSelected == str(baseDirAbsolutePath):
      folderSelected = "."
    labelTxt = folderSelected
    if len(labelTxt) > 20:
      labelTxt = labelTxt[0: 18]+"..."
      wsLabelTooltip = CreateToolTip(wsLabel, folderSelected)      
    wsLabel.configure(text=labelTxt)
    global wsDirPath
    wsDirPath = folderSelected
    
chooseWSBtn = Button(window, text="WORKSPACE",  width=9, command=chooseWSBtnClicked, font=('monospace', fontsize))
chooseWSBtn.grid(row=1, column=1, columnspan=2, sticky=W)

### ROW 2
wsLabel = Label(window, text="", font=('monospace', fontsize))
wsLabel.grid(row=2, column=0, columnspan=4)
labelTxt = wsDirPath
if len(labelTxt) > 20:
  labelTxt = labelTxt[0: 18]+"..."
  wsLabelTooltip = CreateToolTip(wsLabel, wsDirPath)      
wsLabel.configure(text=labelTxt)

### ROW 3
emptyLabel2 = Label(window, text="", font=('monospace', fontsize))
emptyLabel2.grid(row=3, column=0, columnspan=4)

### ROW 4
def HTTPThread():
  global httpd
  print ('Listening incoming cmds on port '  + str(port))
  statusLabel.configure(text="")
  httpd.serve_forever()

def startStopCompileHelperBtnClicked():
  global httpd
  if startStopCompileHelperBtn['text'] == "START":
    ok = True
    try:
      global port
      port = int(portEntry.get()) 
    except:
      ok = False
      statusLabel.configure(text="Bad port number!")    
    try: 
      httpd = HTTPServer(('localhost', port), RequestHandler) 
      statusLabelTooltip = CreateToolTip(statusLabel, "")
    except Exception as e:
      
      ok = False
      labelTxt = str(e)
      if len(str(e)) > 20:
        labelTxt = str(e)[0: 18]+"..."
        statusLabelTooltip = CreateToolTip(statusLabel, str(e))        
      statusLabel.configure(text=labelTxt)
      
    if ok:
      startStopCompileHelperBtn.configure(text="STOP")      
      threading.Thread(target=HTTPThread).start()
      
  else:
    httpd.shutdown()
    httpd.server_close()
    httpd = None
    print("HTTPServer closed")
    #response = conn.getresponse()    
    startStopCompileHelperBtn.configure(text="START")

startStopCompileHelperBtn = Button(window, text="START", width=9, 
                                   command=startStopCompileHelperBtnClicked, 
                                   font=('monospace', fontsize))
startStopCompileHelperBtn.grid( row=4, column=1, columnspan=2, sticky=W)

### ROW 5
statusLabel = Label(window, text="", font=('monospace', fontsize))
statusLabel.grid(column=0, row=5, columnspan=4)

def afterIdleTask():
  global autoStart
  if autoStart == "yes" :
    startStopCompileHelperBtnClicked()
    
window.after_idle(afterIdleTask)

window.mainloop()
