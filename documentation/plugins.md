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

# Plugins
<br></br>

Spontini-Editor supports several built-in plugins and allows the creation of new ones with an API which consists in editing a XML file called **[plugins.xml](../plugins/plugins.xml)**

Any entry of this file represents a single plugin, and it must be written by using the following tag:


```
<plugin>
.
.
.
</plugin>
```

The content inside the above tag defines the plugin's features, and it must be written by combining the tags listed below.

  **Mandatory tags:**

  * **&lt;command&gt;**
    <br/>The command to be executed  
  * **&lt;displayedname&gt;** 
    <br/>The name of the plugin displayed in **TOOLS ---> Plugins** list
  * **&lt;input&gt;** 
    <br/>The plugin's input: can be "document" (the full document currently edited), "selection" (the selected text in the editor) or "none"
  * **&lt;output&gt;**
    <br/>The plugin's produced output: can be "document" (the full document currently edited will be replaced with the plugin's output), "selection" (the current active selection will be replaced), "block" (see **[THIS](../examples/python-to-spontini-example.ly)** example)

  **Optional tags:**  
  
  * **&lt;access&gt;**
    <br/>If set to "localhost" gives access to the plugin only from localhost
  * **&lt;command-win&gt;**
    <br/>It overrides &lt;command&gt; on Windows    
  * **&lt;enabled&gt;**
    <br/>Self explanatory. Can be "true" or "false"
  * **&lt;input-params-prompt&gt;**
    <br/>If filled, the plugin will ask to insert parameters by showing the inserted text.
  * **&lt;input-file-extension&gt;**
    <br/>An extension that will be added to the %%INPUT_FILE%% variable (see below)
  * **&lt;install-command&gt;**
    <br/>If filled, the editor will ask to execute the inserted command, in order to make the plugin available. Useful for plugins that require to install additional resources.
    See the "Translate" plugin, for example.    
  * **&lt;output-file-extension&gt;**
    <br/>An extension that will be added to the %%OUTPUT_FILE%% variable (see below)
  * **&lt;show-result&gt;**
    <br/>If set to "alert" the plugin shows a message with the status of the executed command    
 
  <br/>
 
In addition to the above tags, the following variables can be used as well:
       
  * **%%INPUT_FILE%%**
   <br/>Will be replaced with the name of a temporary file, called "spontini_plugin_input", automatically created by the Spontini server. This file will be filled with the input of the plugin and will be deleted after the execution of the tool.

  * **%%INPUT_PARAMS%%**
   <br/>Will be replaced with the string inserted through the **&lt;input-params&gt;** prompt.   
   
  * **%%LILYINSTDIR%%**
  <br/>Will be replaced with the absolute path of the directory containing LilyPond executable.
   
  * **%%NOTES_NAME_LANG%%**
   <br/>Will be replaced with the language of the current .ly document.
   
  * **%%OUTPUT_FILE%%**
   <br/>Will be replaced with the name of a temporary file, called "spontini_plugin_output", automatically created by the Spontini server. This file will be filled with the output of the plugin and will be deleted after the execution of the tool.

  * **%%PLUGINS_ABS_PATH%%**
   <br/>Will be replaced with the absolute path of the plugins directory.   
   
  * **%%VENVEDPYTHON3%%**
   <br/>Will be replaced with the python 3 executable (including its path) created by the Spontini server in its virtual environment (spontinivenv).  
  
A plugin can be **not only** an executable called with the **&lt;command&gt;** tag: refer to **[THIS](../plugins/python/testPlugin.py)** example as a template for writing a Python 3 script embedded into Spontni-Editor.


### [TABLE OF CONTENTS](toc.md)
   
