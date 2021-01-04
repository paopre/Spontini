<!--
Created (20/11/2020) by Paolo-Prete.
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

# Miscellaneous
<br></br>

### CAIRO-SVG

If enabled, Spontini-Editor can generate PDF documents of the edited scores.
In order to enable and make it work:

  1. Set **"cairosvg-enabled"** to **"yes"** in **[saved-config.txt](../lib/saved-config.txt)**
  
  2. Uncomment the line containing *"CairoSVG==xxx"* in **[requirements.txt](../lib/python/requirements.txt)**
  
  3. [WINDOWS] Install **[Visual C++ Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16)**
  
  4. [WINDOWS] Install **[GTK Runtime Environment](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases)**
  
In case of issues, please refer to **[THIS](https://cairosvg.org/documentation/)** link.

**NOTE**: when generating PDFs, if \jsXXX functions are used, ensure that the variable *showEditorStuff* is set to *false* in the edited ly document

```
#(set! showEditorStuff "false")
```

### DOCK / UNDOCK SCORE BUTTON

... Don't forget to allow popups from Spontini-Editor's URL in your browser: then you can undock/dock the score into/from a separated window by pressing this button.

### FORK MODE

By choosing ***FILE ---> FORK***, you can create a copy of the current document, with a random generated name, and make it automatically available on the www for collaborative editing (just copy and share the generated link).

You can run the web-server in **"fork-access-only"** mode as well, which is an option included in **[saved-config.txt](../lib/saved-config.txt)**: if set to **"yes"**, the **"OPEN"** and **"DELETE"** options of the menu will be disabled, so that the forked files won't be seen/deleted by users connected to the same web server's host.

### MIDI VLC PLUGIN

This plugin can be launched on the web server's host. You can enable it by setting the **&lt;enabled&gt;** tag to **"true"**, inside **[plugins.xml](../plugins/plugins.xml)** and installing **[VLC](https://www.videolan.org/vlc/index.html)** with MIDI support. Check **[https://wiki.videolan.org/Midi/](https://wiki.videolan.org/Midi)** for more infos.

A minimal skin, which is good for a MIDI player (it doesn't show the default video panel) is included into the plugins directory (mpui.vlt): you can set it by following **[THESE](https://www.videolan.org/vlc/skins.html)** instructions.
  
### PAN-ZOOM

You can activate it by pressing the len button on the menu, or by keeping **CTRL** key pressed. Use the mouse wheel and/or zoom-in/out by using the left mouse button and the keys listed inside **[global-custom-vars.js](../lib/webgui/js/global-custom-vars.js)**.
Note that you can't do point and click, nor edit the svg score while panning/zooming.

### [TABLE OF CONTENTS](toc.md)
