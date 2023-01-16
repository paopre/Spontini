HTTPPORT = 8001

import os
import subprocess
import traceback
import os.path
import httpx
import time
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import platform
import pathlib
import traceback
import sys
import subprocess
import glob
from shutil import which
from http.client import HTTPConnection
from base64 import b64encode
from sys import argv
import atexit

log = argv[2]
vlcProc = None

def HTTPCmd(cmd, port):
  userAndPass = b64encode(b":midivlc").decode("ascii")
  conn = HTTPConnection('127.0.0.1:'+str(port))
  headers = { 'Authorization' : 'Basic %s' %  userAndPass }
  conn.request('GET', cmd, headers=headers)
  res = conn.getresponse().read()
  conn.close()
  return res

def checkAndGetExecutableWithPath() :

  #Check if VLC is in path
  foundInSysPath  = False
  foundInConfPath = False

  try:
    subprocess.Popen(["vlc", "--version"], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    foundInSysPath = True
    return "vlc"
  except:
    pass

  if not foundInSysPath:
    VLCPathsFilename ="VLCPaths.txt"
    if getattr(sys, 'frozen', False):
      VLCPathsFilename = os.path.join(os.path.dirname(sys.executable), 'plugins', 'python', VLCPathsFilename)
    else:
      VLCPathsFilename =  os.path.join(os.path.dirname(__file__), VLCPathsFilename)

    VLCPathsFile = open(VLCPathsFilename)
    lines = VLCPathsFile.readlines()
    VLCPathsFile.close()
    execPath = ""
    for line in lines:
      if platform.system() == "Windows" and line.lower().startswith("windows="):
        execPath = line[8:].rstrip()
        break
      elif platform.system() == "Linux" and line.lower().startswith("linux="):
        execPath = line[6:].rstrip()
        break
      elif platform.system() == "Darwin" and line.lower().startswith("macos="):
        execPath = line[6:].rstrip()
        break
    try:
      subprocess.Popen([execPath, "--version"], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
      return execPath
    except:
      pass

  raise Exception("Could not find VLC executable nor in sys nor in configured path")



# TODO: create a common lib for these two funcs
def readSharedInfo(infoFileName):
  ret = None
  try:
    path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'shared', infoFileName))
    with open(path, 'r') as shFile:
      ret = shFile.read().replace('\n', '')
    shFile.close()
  except:
    pass
  return ret

def writeSharedInfo(infoFileName, info):
  path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'shared', infoFileName))
  try:
    shFile = open(path,'w+')
    shFile.write(info)
    shFile.close()
  except:
    raise Exception("Error while writing to shared info file: " + traceback.format_exc())

def removeSharedInfo(infoFileName):
  path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'shared', infoFileName))
  try:
    os.remove(path)
  except:
    raise Exception("Error while removing shared info:" + traceback.format_exc())

def checkAndLaunchVLCWithHTTPServer():
  global vlcProc
  vlcExec = checkAndGetExecutableWithPath()
  if vlcExec:
    try:
      HTTPCmd("/requests/status.xml", HTTPPORT)
      err = "Can't lanch midi VLC player.\n"
      err = err + "Check if another midi VLC player player is still running:\n"
      err = err + "you can open only one instance at time"
      log(err, "W")
      return None
    except Exception as e:
      pass

    try:
      cmdArr = [vlcExec]
      if platform.system() == "Linux":
        cmdArr += ["-I"]
        cmdArr += ["skins2"]
      cmdArr += ["--extraintf", "http", "--http-password",
                 "midivlc", "--http-port", str(HTTPPORT), "--no-playlist-autostart"]
      midiFile = readSharedInfo('CURRENT_LY_FILE')
      if midiFile:
        midiFile = midiFile.replace(".ly", ".midi")
        cmdArr += [midiFile]
      vlcProc = subprocess.Popen(cmdArr, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    except:
      raise Exception("Could not run VLC: " + traceback.format_exc())
      return None

    return vlcProc

  else:
    raise Exception("VLC not found! Please install it")
    return None

def runMidiVLCHTTPClient(p):
  counter = 0
  attempts = 10
  ready = False
  err = ''

  while attempts > 0:
    try:
      HTTPCmd("/", HTTPPORT)
      ready = True
      log("MIDI VLC ready", "I")
      break
    except:
      err = traceback.format_exc()
    time.sleep(1)
    attempts = attempts - 1

  if not ready:
    raise Exception("Could not communicate with MIDI VLC: " + err)

  prevMidiFile = readSharedInfo('CURRENT_LY_FILE')
  if prevMidiFile:
    prevMidiFile = prevMidiFile.replace(".ly", ".midi")

  if ready:
    while True:
      try:
        HTTPCmd("/", HTTPPORT)
      except:
        break
      midiFile = readSharedInfo('CURRENT_LY_FILE')
      if midiFile:
        midiFile = midiFile.replace(".ly", ".midi")
      if midiFile != prevMidiFile:
        try:
          # Clear playlist
          HTTPCmd("/requests/status.xml?command=pl_empty", HTTPPORT)
          # Set file to playlist
          HTTPCmd("/requests/status.xml?command=in_enqueue&input="+midiFile, HTTPPORT)
        except:
          break
        prevMidiFile = midiFile
      time.sleep(1)

def closeVLC():
  global vlcProc
  if vlcProc != None:
    vlcProc.terminate()


atexit.register(closeVLC)
p = checkAndLaunchVLCWithHTTPServer()
if p:
  HTTPClientThread = threading.Thread(target=runMidiVLCHTTPClient,args=(p,))
  HTTPClientThread.daemon = True
  HTTPClientThread.start()

