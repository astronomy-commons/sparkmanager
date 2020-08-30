# How it works

## The workflow

<kbd>
<img src="https://raw.githubusercontent.com/astronomy-commons/sparkmanager/master/docs/images/how_it_works.png" style="border: 1px solid black"/>
</kbd>

## The steps involved

Step 1: The extension gets loaded. <br/>
Step 2: While it loads it automatically calls an API/serverextension handler /all-config and that API gives all the list of the available configs. <br/>
Step 3: We can see that list of all available configs in the dropdown.<br/>
Step 4: We can select any config that we want and click on “Start Spark” Button<br/>
Step 5 : When we click Start Spark Button, the front end detects which config we have selected and then tells the serverextension about the selected config via REST API. <br/>
Step 6: The serverextension fetches all the config details of the config that is selected in the frontend from the config dir located at home dir. <br/>
Step 7: Then once it has the required config fetched from the config dir it converts it into a Jinja Template and sends the jinja template to the front end via API <br/>
Step 8: Once the front end receives the Jinja template of the required config it sends the Jinja Template to the Kernel Extension via Sockets <br/>
Step 9: The kernel extension executes the jinja template to start the spark cluster that it receives from the Jupyter front end. <br/>
<br/>

<i>
 Select Config -> Click the Start Spark Button -> Config Data fetched in backend -> Config data converted to Jinja Template in Backend -> Jinja Template Sent from backend to front end -> Jinja sent from front end to Kernel → Jinja template gets executed in Kernel to start the cluster!
 </i>
