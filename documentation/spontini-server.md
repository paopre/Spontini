<!--
Created (20/12/2022) by Paolo-Prete.
This file is part of Spontini-Editor project.

Spontini-Editor is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
Spontini-Editor is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Spontini-Editor. If not, see <http://www.gnu.org/licenses/>.
-->

# Spontini Server GUI
When SpontiniServer is launched, a GUI with the log of the editor is displayed.
This GUI also provides a menu with some options:

  1. **Set workspace:** you can choose the directory in which ly files will be opened, saved and compiled
  2. **Install LilyPond:** this option allows to choose a supported version of LilyPond and automatically install it inside a directory called "lilyponds", which will be automatically created inside the editor's base directory.
  3. **Set LilyPond:** you can set Spontini-Editor to work with a chosen installed version of LilyPond.
  4. **Reset LilyPond:** it configures Spontini-Editor to work with its default version of LilyPond, which is listed with "[D]" mark on the server's log.
  5. **Clear screen:** it clears the visible log of the editor

**NOTE** SpotiniServer can be launched also by a python3 interpreter; all the required dependencies are listed in **[requirements.txt](../lib/python/requirements.txt) and must be installed with pip (pip install -r requirements.txt).

### [TABLE OF CONTENTS](toc.md)
