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

from PyInstaller.utils.hooks import collect_submodules
import os
from pathlib import Path
import os.path
import glob

block_cipher = None

hiddenimports = ['PyPDF2', 'natsort', 'svglib', 'svglib.svglib']
hiddenimports += collect_submodules('reportlab')
hiddenimports += collect_submodules('fastapi')
hiddenimports += collect_submodules('asgiref')
hiddenimports += collect_submodules('ly')
hiddenimports += collect_submodules('svglib')
hiddenimports += collect_submodules('psutil')
hiddenimports += collect_submodules('ssl')

HERE = Path(SPEC).parent.resolve()
datas = []

libdir = os.path.join(HERE, '..', 'lib')
pycacheDir = Path(os.path.join(libdir, 'python', '__pycache__'))
for pth in Path(libdir).glob("**/*"):
  p = str(pth)
  if os.path.isdir(pth):
    continue
  if pth == pycacheDir or pycacheDir in pth.parents:
    continue
  else:
    dest = str(os.path.join('bin', pth.parent.relative_to(HERE)))
    datas += [(p, dest)]

a = Analysis(
  ['../SpontiniServer.py'],
  pathex=[],
  binaries=[],
  datas=datas,
  hiddenimports=hiddenimports,
  hookspath=[],
  hooksconfig={},
  runtime_hooks=[],
  excludes=[],
  win_no_prefer_redirects=False,
  win_private_assemblies=False,
  cipher=block_cipher,
  noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
  pyz,
  a.scripts,
  a.binaries,
  a.zipfiles,
  a.datas,
  [],
  name='SpontiniServer',
  debug=False,
  bootloader_ignore_signals=False,
  strip=False,
  upx=True,
  upx_exclude=[],
  runtime_tmpdir=None,
  console=True,
  disable_windowed_traceback=False,
  argv_emulation=False,
  target_arch=None,
  codesign_identity=None,
  entitlements_file=None,
)

