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

  * **&lt;displayedname&gt;** 
    <br/>The name of the plugin displayed in **TOOLS ---> Plugins** list
  * **&lt;input&gt;** 
    <br/>The plugin's input: can be "document" (the full document currently edited), "selection" (the selected text in the editor) or "none"
  * **&lt;output&gt;**
    <br/>The plugin's produced output: can be "document" (the full document currently edited will be replaced with the plugin's output), "selection" (the current active selection will be replaced), "block" (see **[THIS](../examples/python-to-spontini-example.ly)** example)
  * **&lt;command&gt;**
    <br/>The command to be executed

  **Optional tags:**  
  
  * **&lt;access&gt;**
    <br/>If set to "localhost" gives access to the plugin only from localhost
  * **&lt;enabled&gt;**
    <br/>Can be "true" or "false"
  * **&lt;command-win&gt;**
    <br/>It overrides &lt;command&gt; on Windows
  * **&lt;show-result&gt;**
    <br/>If set to "alert" the plugin shows a message with the status of the executed command
  * **&lt;input-params-prompt&gt;**
    <br/>If filled, the plugin will ask to insert parameters by showing the inserted text.
  * **&lt;input-file-extension&gt;**
    <br/>An extension that will be added to the %%INPUT_FILE%% variable (see below)
  * **&lt;output-file-extension&gt;**
    <br/>An extension that will be added to the %%OUTPUT_FILE%% variable (see below)
  * **&lt;install-command&gt;**
    <br/>If filled, the editor will ask to execute the inserted command, in order to make the plugin available. Useful for plugins that require to install additional resources.
    See the "Translate" plugin, for example.
 
  <br/>
 
In order to make the plugin effective, the following variables can be used as well:

  * **%%VENVEDPYTHON3%%**
   <br/>It will be replaced with the python 3 executable (including its path) reated by the Spontini-Server in its virtual environment (spontinivenv)
   
  * **%%PLUGINS_ABS_PATH%%**
   <br/>It will be replaced with the absolute path of the plugins directory
  
  * **%%INPUT_PARAMS%%**
   <br/>It will be replaced with the string inserted through the **&lt;input-params&gt;** prompt.     
  
  * **%%INPUT_FILE%%**
   <br/>It will be replaced with the name of a temporary file, called "spontini_plugin_input", automatically created by Spontini-Server. This file will be filled with the input of the plugin and will be deleted after the execution of the tool.
   
  * **%%OUTPUT_FILE%%**
   <br/>It will be replaced with the name of a temporary file, called "spontini_plugin_output", automatically created by Spontini-Server. This file will be filled with the output of the plugin and will be deleted after the execution of the tool.   
   
   
   
