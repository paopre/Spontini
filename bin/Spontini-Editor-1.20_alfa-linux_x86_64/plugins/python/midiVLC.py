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

def checkAndGetExecutableWithPath(execName, winExecName, pathAfterProgramFiles, testOption) :
  ret = execName
  if os.name == "nt":
    ret = winExecName
    programFilesEnv = os.environ.get('ProgramFiles', 'C:\\Program Files')

    if which(winExecName) is not None:
        return winExecName
    else:
        path = glob.glob(os.path.join(programFilesEnv,  pathAfterProgramFiles[0], pathAfterProgramFiles[1]))
        if not path:
            programFilesEnvX86 = os.environ.get('ProgramFiles(x86)', 'C:\\Program Files (x86)')
            path = glob.glob(os.path.join(programFilesEnvX86,  pathAfterProgramFiles[0], pathAfterProgramFiles[1]))
            if path:
                ret = os.path.join(path[0], ret)
        else:
            ret = os.path.join(path[0], ret)

        try:
            if os.path.isfile(ret) and os.access(ret, os.X_OK):
                return ret
            else:
                raise Exception("Bad "+ret+" executable")
            return None
        except:
            raise Exception("Bad "+ret+" executable")
            return None
  #linux, osx
  elif which(execName) is not None:
    return execName
  else:
    raise Exception("Could not find "+execName+" executable")
    return None

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
  vlcExec = checkAndGetExecutableWithPath('vlc', 'vlc.exe', ['VideoLAN*', 'VLC'], "--version")
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
      cmdArr = [vlcExec, "-I", "skins2", "--extraintf", "http", "--http-password",
                "midivlc", "--http-port", str(HTTPPORT), "--no-playlist-autostart"]

      midiFile = readSharedInfo('CURRENT_LY_FILE')
      if midiFile:
        midiFile = midiFile.replace(".ly", ".midi")
        cmdArr.append(midiFile)
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

