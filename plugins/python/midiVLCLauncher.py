HTTPPORT = 8001

import os
import sys
import subprocess
import traceback
import os.path
import httpx
from utils import *
spontini_utils_path = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                      '..', '..', 'lib', 'python'))
sys.path.insert(1, spontini_utils_path)
from spontini_server_utils import getVenvedPyCmd
from http.server import BaseHTTPRequestHandler, HTTPServer

def main():

  vlcExec = checkAndGetExecutableWithPath('vlc', 'vlc.exe', ['VideoLAN*', 'VLC'], "--version")

  if vlcExec:
    try:
      HTTPCmd("/requests/status.xml", HTTPPORT)
      err = "Can't lanch midi VLC player.\n"
      err = err + "Check if another midi VLC player player is still running:\n"
      err = err + "you can open only one instance at time"
      print(err, file=sys.stderr)
      return 1
    except Exception as e:
      pass

    try:
      p = subprocess.Popen([getVenvedPyCmd(), os.path.join(os.path.dirname(__file__), "midiVLC.py"), vlcExec],
                           stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
      print("midiVLC.py is running")
    except:
      print(traceback.format_exc(), file=sys.stderr)
      return 1

    return 0

  else:
    print("VLC not found! Please install it", sys.stderr)
    return 1

if __name__ == "__main__":
  sys.exit(main())
