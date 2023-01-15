This directory contains a set of CI tests.
The "run_exec" param is optional. If set, it builds an executable of Spontini-Editor and runs the test with it

-----------------------------------
*) python3 spontini_server_test.py [run_exec] [lilypond-version]:
Execute a set of tests on the server, using the Spontini-Editor's default installation of LilyPond and
(optionally) and an additional installation of "lilypond-version" (which will be downloaded and installed) if this param is provided

-----------------------------------
*) python3 compile_all_examples.py [remove_installation]
Compile all the examples for all the supported LilyPond versions, which will be downloaded and installed. Each installed version will be uninstalled after all the examples are compiled, if "remove_installation" is provided
*) python3 compile_all_examples.py [lilypond-version-1] ... [lilypond-version-N][remove_installation]
Same as before, but it works for a set of LilyPond versions specified in the argv list.

-----------------------------------
*) python3 open_all_examples.py [run_exec]
Open all the examples on Chromium (as separate tabs)

-----------------------------------
*) python3 music2xmltest.py [run_exec] [remove_installation]
Execute a music2xml test on ALL the supported LilyPond versions. Each installed version will be uninstalled after the test is done, if "remove_installation" is provided.
*) python3 music2xmltest.py [lilypond-version-1] ... [lilypond-version-N][remove_installation]
Same as before, but it works for a set of LilyPond versions specified in the argv list.

-----------------------------------
*) webgui-test-1.js

Execute an automated test on the web GUI, which installs multiple versions (or a specific
version) of LilyPond, and moves grobs on the SVG panel.
It is Also useful for understanding how Spontini's API works.
This test REQUIRES ImageMagick installed on the server side.
It can be launched from the browser (if SpontiniServer is already running)
with:

http://localhost:8000/spontini-editor?test=1[&lilyversion=VERSION][&removelilyinstall=[true/false]]

If lilyversion is not set, the test will be performed for ALL the supported LilyPond versions.
If removelilyinstall is set to true, Each installed version will be uninstalled after the test is done.

-----------------------------------
*) webgui-test-2.js
Execute an automated test on the web GUI which calls some Codemirror's and pdfjs' functions.
It is Also useful for understanding how Spontini's API works.
It can be launched from the browser (if SpontiniServer is already running) with:

http://localhost:8000/spontini-editor?test=2

-----------------------------------
*) python3 webgui_tests.py
Executes webgui_tests-1/2.js on Cypress, after launching SpontiniServer. The Cypress command line must be passed as argv in this way:

(test 1)
python3 webgui_tests.py [run_exec] npx cypress run --env testnum=1,timeout=1200000,removelilyinstall=true --config specPattern=. --browser chrome --spec run-webgui-test.cy.js

(test 2)
python3 webgui_tests.py [run_exec] npx cypress run --env testnum=2,timeout=20000 --config-file cypress.config.js --config specPattern=. --browser chrome --spec run-webgui-test.cy.js

