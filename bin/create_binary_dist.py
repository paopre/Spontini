#
# Created (10/01/2023) by Paolo-Prete.
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

# -*- mode: python ; coding: utf-8 -*-

import subprocess
import sys
import os
import platform
import shutil
from pathlib import Path
import tarfile
import os.path
import glob
import re

def makeTarfile(output_filename, source_dir):
    with tarfile.open(output_filename, "w:gz") as tar:
        tar.add(source_dir, arcname=os.path.basename(source_dir))

HERE = os.path.dirname(__file__)
versionFile = open(os.path.join(HERE, '..', 'lib', 'version.txt'))
spontiniVersion = versionFile.read().rstrip()
versionFile.close()
platformToken = ""
if platform.system() == 'Linux':
  platformToken = "linux_x86_64"
elif platform.system() == 'Windows':
  platformToken = "windows_x86_64"
else:
  platformToken = "darwin_x86_64"

execDirName = os.path.join(HERE, 'Spontini-Editor-' + spontiniVersion + '-' + platformToken)
try:
  shutil.rmtree(execDirName)
except:
  pass
subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"])
subprocess.run([sys.executable, "-m", "pip", "install", "-r", os.path.join(HERE, "..", "lib", "python", "requirements.txt")])
subprocess.run([sys.executable, "-m", "PyInstaller", os.path.join(HERE, "create_binary_dist.spec")])

os.rename('dist', execDirName)

shutil.copytree(os.path.join(HERE, '..','tests'), os.path.join(execDirName, 'tests'))
shutil.copytree(os.path.join(HERE, '..','lib'), os.path.join(execDirName, 'lib'))
shutil.copytree(os.path.join(HERE, '..','documentation'), os.path.join(execDirName, 'documentation'))
shutil.copytree(os.path.join(HERE, '..', 'examples'), os.path.join(execDirName, 'examples'))
shutil.copytree(os.path.join(HERE, '..', 'plugins'), os.path.join(execDirName, 'plugins'))
shutil.copytree(os.path.join(HERE, '..', 'templates'), os.path.join(execDirName, 'templates'))
shutil.copyfile(os.path.join(HERE, '..', 'LICENSE'), os.path.join(execDirName,  'LICENSE'))
shutil.copyfile(os.path.join(HERE, '..', 'NEWS.txt'), os.path.join(execDirName, 'NEWS.txt'))
shutil.copyfile(os.path.join(HERE, '..', 'README.md'), os.path.join(execDirName, 'README.md'))

try:
  os.remove(os.path.join(execDirName, 'lib', 'saved-config.txt'))
except:
  pass
try:
  shutil.rmtree(os.path.join(execDirName, 'lib', 'python', '__pycache__'))
except:
  pass
try:
  shutil.rmtree(os.path.join(execDirName, 'plugins', 'python', '__pycache__'))
except:
  pass
files = glob.glob(os.path.join(execDirName, 'lib', 'spontini_plugin_input*'))
for f in files:
  os.remove(f)
files = glob.glob(os.path.join(execDirName, 'lib', 'spontini_plugin_output*'))
for f in files:
  os.remove(f)
files = glob.glob(os.path.join(execDirName, 'plugins', 'shared', '*'))
for f in files:
  os.remove(f)

# make compressed archive
archiveName = execDirName + '.tar.gz'
if platform.system() == 'Windows':
  archiveName = execDirName + '.zip'
  shutil.make_archive(execDirName, 'zip', execDirName)
else:
  makeTarfile(archiveName, execDirName)

# create release notes
newsFile = open(os.path.join(HERE, '..', 'NEWS.txt'))
newsFileContent = newsFile.read()
newsFile.close()
regex = r"^-{10,}\n.+\n-{10,}\n((?:[^-]+|(?!^-{10,})-+)*)"
matches = re.finditer(regex, newsFileContent, re.MULTILINE)
for matchNum, match in enumerate(matches, start=1):
    #print (match.group()[match.start():])
    releaseNotesFile = open(os.path.join(HERE, "releaseNotes.txt"), "w")
    releaseNotesFile.write(match.group()[match.start():])
    releaseNotesFile.close()
    break

# remove unuseful dir
shutil.rmtree('build')
shutil.move(archiveName, os.path.join(HERE, archiveName))

