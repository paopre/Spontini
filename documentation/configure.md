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

# Editor configuration
<br></br>

Many options of Spontini-Editor can be configured and their configuration is permanently saved. Configuration parameters are grouped into two distinct files and their names are (...I hope so...) self-explanatory:

  1. **[saved-config.txt](../lib/saved-config.txt)**
  2. **[global-custom-vars.js](../lib/webgui/js/global-custom-vars.js)**

All the options inside **[global-custom-vars.js](../lib/webgui/js/global-custom-vars.js)** are mostly layout options and they should be changed **only if really necessary** (in any case: note that this is a js "core" file, and any bad configuration will prevent the editor to work)
  
All the options inside **[saved-config.txt](../lib/saved-config.txt)** can be set with the Spontini-Server GUI or the Spontini-Editor GUI; if they are not exposed by these two GUIs, they can be edited:

  1. By manually modifying the previous file.
  2. By sending to the web server, on the /cgi subaddress, a POST request with a JSON content in the form:
  
  ```
  {cmd: "SET_CONFIG_PARAM", param1: "param-name", param2: "value"}
  ```
  
  If you use **[curl](https://curl.se/)**, a complete command could be, for example:
  
  ```
  curl --header "Content-Type: application/json" \
  --request POST --data '{"cmd":"SET_CONFIG_PARAM","param1":"debug","param2":"yes"}' \
  http://localhost:8000/cgi
  ```
  
  After a configuration parameter is set, restart the web server.
  
### [TABLE OF CONTENTS](toc.md)
