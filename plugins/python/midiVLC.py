HTTPPORT = 8001

import os
import sys
import subprocess
import traceback
import os.path
import threading
import time
from utils import readSharedInfo
import queue
from http.client import HTTPConnection
from base64 import b64encode
from utils import *
from sys import argv

q = queue.Queue()
p = None

def vlcThread(vlcExec):

  try:

    cmdArr = [vlcExec, "-I", "skins2", "--extraintf", "http", "--http-password",
                     "midivlc", "--http-port", str(HTTPPORT), "--no-playlist-autostart"]

    midiFile = readSharedInfo('CURRENT_LY_FILE')
    if midiFile:
      midiFile = midiFile.replace(".ly", ".midi")
      cmdArr.append(midiFile)
    p = subprocess.Popen(cmdArr, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    vlcPidStr = str(p.pid)
    writeSharedInfo("PID_"+vlcPidStr, "")
    p.communicate()
    global q
    q.put(1, False)
    removeSharedInfo("PID_"+vlcPidStr)

  except:
    print(traceback.format_exc())

def pollerThread():

  attempts = 10
  ready = False
  err = ''

  while attempts > 0:
    try:
      HTTPCmd("/", HTTPPORT)
      ready = True
      break
    except:
      err = traceback.format_exc()
    time.sleep(1)
    attempts = attempts - 1

  prevMidiFile = readSharedInfo('CURRENT_LY_FILE')
  if prevMidiFile:
    prevMidiFile = prevMidiFile.replace(".ly", ".midi")

  if not ready:
    print(err)

  if ready:
    while True:

      midiFile = readSharedInfo('CURRENT_LY_FILE')
      if midiFile:
        midiFile = midiFile.replace(".ly", ".midi")

      #print(midiFile)
      reachable = True

      if midiFile != prevMidiFile:
        # Clear playlist
        try:
          HTTPCmd("/requests/status.xml?command=pl_empty", HTTPPORT)
          # Set file to playlist
          HTTPCmd("/requests/status.xml?command=in_enqueue&input="+midiFile, HTTPPORT)
        except:
          reachable = False

        prevMidiFile = midiFile

      time.sleep(1)
      print("i")
      if not q.empty() or not reachable:
        break

  print("Bye bye from midiVLCPoller")

def main():

  vlcExec = argv[1]
  threading.Thread(target=vlcThread,args=(vlcExec,)).start()
  threading.Thread(target=pollerThread).start()
  return 0

if __name__ == "__main__":
  sys.exit(main())
