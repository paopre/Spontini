<p align="center">
    <img src="documentation/images/fulllogo.svg" width="618px" alt="Spontini-Editor logo" />
</p>
<h3 align="center">An advanced GUI assistant for LilyPond</h3>
<p align="center"><i>Complex music engraving made possible and fast</i></p>
<br/>

Spontini-Editor is a text-combined-with-graphic music editor that strongly speeds up the creation and fine graphic tuning of complex scores edited with **[LilyPond](https://lilypond.org)** through two main features:

  * It allows the positioning of musical objects (articulations, texts, pedals, curves, brackets etc.) with the mouse, both for "avoid-collisions" properties (X/Y-offset, staff-padding, outside-staff-padding, padding) and for extra-offset property. Once the positioning is graphically done, the text editor reports the corresponding changes on the input file: these changes are written in standard LilyPond code and do not require any additional software to be compiled.

  * It assists in the creation of piano music by inserting notes in tabular and formatted form. It also supports cross-staff scores through a set of work-arounds (invisible to the user) that solve many issues of the native cross-staff functions.

Other main features:

  * No installation required
  * Multi-platform (written in Javascript and Python 3).
  * Web server + HTML client architecture: the client runs, without any installation, on the main browsers, thus allowing to edit LilyPond documents with cheap and small boards, like **[Raspberry PI](https://www.raspberrypi.org/)**. The client works on **Android** tablets too, provided you use a keyboard + touchpad or mouse with them.
  * The application server is made with a main layer which runs on the main Python *ASGI* platforms, like **[Uvicorn](https://www.uvicorn.org/)**, **[Daphne](https://github.com/django/daphne)** etc; it supports both **SSL** and **Tor** for security, and all the features provided by the Python ASGI servers
  * Plugin engine that can interface to **any** library/utility suitable for LilyPond; implemented plugins currently support: **[Abjad](https://abjad.github.io)**, **[python-ly](https://github.com/frescobaldi/python-ly)**, **[musicxml2ly](https://lilypond.org/doc/v2.21/Documentation/usage/invoking-musicxml2ly)** and **[VLC](https://www.videolan.org/vlc/index.html)**; plugins can be created as well by the users through a XML API (which interfaces to external scripts)
  * Python 3 scripting interface
  * A ***pure HTML MIDI player*** is included (**[Magenta](https://github.com/magenta/magenta)** through **[html-midi-player](https://github.com/cifkao/html-midi-player)**, ready to be used on the browser)
  * Pan-zoom advanced interface
  * Multiple layouts
  * "Fork-mode" for **collaborative remote editing**
  * Code completion
  * Quick insert for a set of notation symbols
  * Smart tools for extracting parts from the score
  * Customizable score templates
  * Expandible ruler and draggable axes to examine the generated score with accuracy
  * Filter tool for including/excluding sections/pages/systems or single measures of the score on the fly
  * PDF export command
  * MIDI input through the browser (Web MIDI)

*Note that Spontini-Editor is **NOT** a **WYSIWYG** notation editor (like Finale, Sibelius etc.). It only uses the graphical interface to avoid the waste of time caused by LilyPond functions that require the trial-and-error process. All the functions that do not require this process have been intentionally left to be implemented with the only text editor, in pure LilyPond language, which must therefore be known in advance by the user: through the knowledge of this language, and adding the Spontini-Editor functions to it, you can get a much faster editing process than WYSIWYG editors. In addition, as can be seen in the documentation below, the conversion of the Spontini-Editor functions into native LilyPond code can be obtained by changing simple strings in the corresponding musical expressions.*

Spontini-Editor's text editor component uses **[Codemirror](https://codemirror.net/)** library, which it will automatically download from the [cloud](https://cdnjs.cloudflare.com).

Thanks to [Aaron Hill](https://github.com/seraku24), Thomas Morley, Martin Tarenskeen, [Alexis Jeandeau](https://github.com/jeandeaual) and the #regex, #javascript and #python irc channels (libera) for the support in doing this!

##
![img](documentation/images/intro.gif)
<br></br>

# QUICK START

  **1)** Download the latest **[release](https://github.com/paopre/Spontini/releases)** and extract Spontini-Editor wherever you want. Click on "SpontiniServer" (or SpontiniServer.exe on Windows)

  **2)** Open the page: ***http://localhost:8000/spontini-editor*** with your browser (currently compatible and tested on: **Chrome**, **Chromium**, **Firefox** and **Brave**. Not compatible with **Pale Moon**, nor with **Safari**, nor with **Edge**).

  The editor will appear and it will allow to edit and compile files in the default workspace, which is the "examples" folder of the project.
  Spontini-Editor will automatically embed LilyPond 2.24.0, but other compatible versions of LilyPond can be automatically or manually installed and set as well (see **[THIS PAGE](documentation/spontini-server.md)** for details).

  **IMPORTANT NOTE!** *Keep ALL the files in the main folder at their place, otherwise SpontiniServer won't work*.

# [GO TO THE DOCUMENTATION](documentation/toc.md)
<br></br>
