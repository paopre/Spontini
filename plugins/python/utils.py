#!/usr/bin/env python3
#
# Created (28/10/2020) by Paolo-Prete.
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

import os
import pathlib
import traceback
import sys
import subprocess
import glob
from shutil import which
from http.client import HTTPConnection
from base64 import b64encode

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
                print("Bad "+ret+" executable",  file=sys.stderr)
            return None
        except:
            print("Bad "+ret+" executable",  file=sys.stderr)
            return None
  #linux, osx
  elif which(execName) is not None:
    return execName
  else:
    print("Could not find "+execName+" executable",  file=sys.stderr)
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
    #print(traceback.format_exc(),  file=sys.stderr)
  return ret

def writeSharedInfo(infoFileName, info):
  path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'shared', infoFileName))
  try:
    shFile = open(path,'w+')
    shFile.write(info)
    shFile.close()
  except:
    print("Error while writing to shared info file")
    print(traceback.format_exc())

def removeSharedInfo(infoFileName):
  path = os.path.abspath(os.path.join(os.path.dirname( __file__ ), '..', 'shared', infoFileName))
  try:
    os.remove(path)
  except:
    print("Error while removing shared info")
    print(traceback.format_exc())
