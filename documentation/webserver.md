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

# Web server configuration

  * Spontini-Editor provides a built-in **[Uvicorn](https://www.uvicorn.org/)** web server which is automatically launched by the SpontiniServer.py script. By default, the uvicorn web server is launched, and its parameters (port, host, certificates etc.) can be changed by modifying the **[uvicorn_cli.txt](../lib/python/uvicorn_cli.txt)** file.
  
    uvicorn_cli.txt uses the interface provided by Uvicorn: therefore you have to refer to the documentation of the two tools for setting the parameters you need.
    
      
  * If you want to run the web server in text-only mode (no tkinter GUI) launch it with the "nogui" parameter (in case of Windows, use the SpontiniServer.exe executable)
  
    ```
    SpontiniServer nogui
    ```
  
  * You can enable HTTPS(SSL), after creating cert.pem and key.pem certificates by uncommenting the #"ssl_keyfile":"key.pem" and #"ssl_certfile":"cert.pem" lines in **[uvicorn_cli.txt](../lib/python/uvicorn_cli.txt)**

    Self-signed certificates can be created with **[OpenSSL](www.openssl.org)** and, if using the above CLI, they must be put inside the base directory of the Spontini directory tree.
    
    Note too that if your private key has a passphrase, then you can't run Spontini-Server unless you supply it with the passphrase each time it restarts.

  * Finally: you can run the Spontini web server (**[spontini_server_core.py](../lib/python/spontini_server_core.py)**) from any other ASGI container than Uvicorn. Try it yourself, for example, with Daphne - which is good for a production context and which requires a little effort to be installed on Windows - by using the **spontini_server_core:asgi** parameter...


### [TABLE OF CONTENTS](toc.md)
