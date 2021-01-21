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
<br></br>

  * Spontini-Editor provides a built-in **[Uvicorn](https://www.uvicorn.org/)** or **[Daphne](https://github.com/django/daphne)** web server which is automatically launched by the SpontiniServer.py script. The web server configuration is set inside the **[webserver.conf](../lib/python/webserver.conf)** file. By default, the uvicorn web server is launched, and its parameters (port, host, certificates etc.) can be changed by modifying the **[uvicorn_cli.py](../lib/python/uvicorn_cli.py)** file.
  
    If you want to start a Daphne web server, replace the content of *webserver.conf* with the content of *webserver.conf.daphne* file (in the same directory). In this case, the webserver parameters are set through a CLI defined in the following line, in the same file:

    ```
    cli-params=-p 8000 spontini_server_core:asgi
    ``` 
    Both uvicorn_cli.py and cli-params use the interface provided by Uvicorn or Daphne: therefore you have to refer to the documentation of the two tools for setting 
    the parameters you need.
    
    In general, Daphne is suggested for a *production context* and it requires a little effort to be installed on Windows.
        
    **IMPORTANT NOTE for Windows users**: *Daphne's automatic installation doesn't work, currently, with Python 3.9.x, due an issue of the Twisted package. Until the issue is not solved, if you need to use Daphne, either switch to Python 3.8 **OR** manually install Daphne, with the SAME VERSION specified in webserver.conf, inside lib/python/spontinivenv venv*.
        
    **IMPORTANT NOTE for Windows users**: *in order to make Daphne work, you may have to install **[Visual C++ Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16)** before launching SpontiniServer.py*
      
  * If you want to run the web server in text-only mode (no tkinter GUI) launch it with the "nogui" parameter
  
    ```
    python3 SpontiniServer.py nogui
    ```
  
  * You can enable HTTPS(SSL), after creating cert.pem and key.pem certificates, in the following way:
  
    **[UVICORN]** by uncommenting the #"ssl_keyfile":"key.pem" and #"ssl_certfile":"cert.pem" lines
  
    **[DAPHNE]** by replacing the content of the previous file with:

    ``` 
    cli-params=-e ssl:8000:privateKey=key.pem:certKey=cert.pem spontini_server_core:asgi
    ``` 
    
    Self-signed certificates can be created with **[OpenSSL](www.openssl.org)** and, if using the above CLI, they must be put 
    
    **[UVICORN]** inside the base directory of the Spontini directory tree. 
    
    **[DAPHNE]** inside the lib/python directory of the Spontini directory tree. 
    
    Note too that if your private key has a passphrase, then you can't run Spontini-Server unless you supply it with the passphrase each time it restarts.
  
  * With Daphne, the web server can run in **[TOR](https://www.torproject.org/)** mode as well. Prior to do this, collect the Python TOR module by adding **[txtorcon](https://pypi.org/project/txtorcon/)** to the **[daphne_cli_params.txt](../lib/python/requirements.txt)** file: the corresponding module will be automatically downloaded after Spontini-Server is restarted. Ensure too that TOR exectuable (not only the txtorcon module!) is installed on the web server host and set the following cli-params option:


    ``` 
    cli-params=-e onion:8000 -p 8002 -v 2 spontini_server_core:asgi

    ``` 
    * **NOTE 1)** *The above CLI runs two endpoints of the web server at the same time: a TOR instance and a localhost (HTTP) instance on port 8002, which is useful for setting options with the Spontini-Server tk GUI.*
    
    * **NOTE 2)** *The TOR setup can take some time: wait until it is completed. Check also that the right permissions are set in order to start the TOR web server instance (in case, for example, you get this error: twisted.internet.error.ConnectError: An error occurred while connecting: 2: No such file or directory)*
    
  * Finally: you can run the Spontini web server (**[spontini_server_core.py](../lib/python/spontini_server_core.py)**) from any other ASGI container than Daphne or Uvicorn. Try it yourself by using the **spontini_server_core:asgi** parameter...



### [TABLE OF CONTENTS](toc.md)
