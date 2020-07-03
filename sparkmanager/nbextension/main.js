// Code cell snippets

define([
    'jquery',
    'base/js/namespace',
    'base/js/dialog'
], function (
    $,
    Jupyter,
    dialog
) {
    "use strict";

    let notebookServerURL = `${window.location.protocol}//${window.location.host}${Jupyter.contents.base_url}`;

    var initialize = async function () {
        // var driverMemoryInput = document.createElement("input");
        // driverMemoryInput.id = "driver_memory_input";
        // driverMemoryInput.placeholder = "Driver Memory";
        // driverMemoryInput.type = "number";
        // driverMemoryInput.onkeydown = function (event) {
        //     event.preventDefault()
        //     console.log(event)
        // }

        // var driverCores = document.createElement("input");
        // driverCores.id = "driver_cores";
        // driverCores.placeholder = "Driver Core";
        // driverCores.type = "number";
        // driverCores.onkeydown = function (event) {
        //     event.preventDefault()
        //     console.log(event)
        // }

        // var executorInstance = document.createElement("input");
        // executorInstance.id = "executer_instance";
        // executorInstance.placeholder = "Executer Instance";
        // executorInstance.type = "number";
        // executorInstance.onkeydown = function (event) {
        //     event.preventDefault()
        //     console.log(event)
        // }

        // var generateCodeButton = document.createElement('button');
        // generateCodeButton.innerHTML = 'Generate spark codes now';
        // generateCodeButton.onclick = function () {
        //     generateCode()
        // };


        var fetchDefaultConfigButton = document.createElement('button');
        fetchDefaultConfigButton.innerHTML = 'Start Spark';
        fetchDefaultConfigButton.onclick = function () {
            fetchDefaultConfig(configCurrentValue)
        };


        // var startSpark = document.createElement('button');
        // startSpark.innerHTML = 'Start Spark Now';
        // startSpark.onclick = function () {
        //     launchCluster()
        // };
        // var talkToKernel = document.createElement('button');
        // talkToKernel.innerHTML = 'Start Spark';
        // talkToKernel.onclick = function () {
        //     console.log(configCurrentValue)

        //     makeCallToKernel(configCurrentValue)
        // };

        let selectConfig = document.createElement("select");
        let listOfConfig = await fetch(`${notebookServerURL}api/all-config`);
        listOfConfig = await listOfConfig.json()
        let configCurrentValue = listOfConfig.data[0]
        let currentUser = listOfConfig.username
        console.log("listOfConfig", listOfConfig.data)
        for (let i = 0; i < listOfConfig.data.length; i++) {
            let option = new Option();
            option.value = listOfConfig.data[i];
            option.text = listOfConfig.data[i];
            selectConfig.options.add(option);
        }
        selectConfig.onchange = function (event) {
            configCurrentValue = event.target.value
            console.log(configCurrentValue)

        }

        let loadingText = document.createElement("div")
        loadingText.id = "loading-text"

        Jupyter.toolbar.element.append(selectConfig, fetchDefaultConfigButton, loadingText);


        // Jupyter.toolbar.element.append(driverMemoryInput);

    };

    // will be called when the nbextension is loaded
    function load_extension() {
        Jupyter.keyboard_manager.disable()
        Jupyter.notebook.config.loaded.then(initialize); // trigger loading config parameters
    };

    let fetchDefaultConfig = async (currentConfig) => {
        let response = await fetch(`${notebookServerURL}api/show-config/` + currentConfig);
        let config = await response.json();
        console.log("Config printed only from frontend : ", config)
        let username = config.username;
        makeCallToKernel(config.data, username)

        // let defaultConfigHadoop = document.createElement("ul")
        // let defaultConfigKubernetes = document.createElement("ul")
        // let defaultConfigScheduler = document.createElement("ul")
        // let defaultConfigSql = document.createElement("ul")
        // let defaultConfigJars = document.createElement("ul")



        // for (let i =0 ;i <config.data.length; i++) {

        //     let key = Object.keys(config.data[i])[0]
        //     if(key.indexOf("hadoop") != -1){
        //         defaultConfigHadoop.innerHTML += `<li>${key} : ${config.data[i][key]}</li>`
        //     }
        //     if(key.indexOf("kubernetes") != -1){
        //         defaultConfigKubernetes.innerHTML += `<li>${key} : ${config.data[i][key]}</li>`

        //     }
        //     if(key.indexOf("scheduler") != -1) {
        //         defaultConfigScheduler.innerHTML += `<li>${key} : ${config.data[i][key]}</li>`
        //     }
        //     if(key.indexOf("sql") != -1) {
        //         defaultConfigSql.innerHTML += `<li>${key} : ${config.data[i][key]}</li>`
        //     }
        //     if(key.indexOf("jars") != -1) {
        //         defaultConfigJars.innerHTML += `<li>${key} : ${config.data[i][key]}</li>`
        //     }
        // }

        // let defaultConfig = document.createElement("div")
        // defaultConfig.innerHTML += `<p>Hadoop</p>`;
        // defaultConfig.append(defaultConfigHadoop);
        // defaultConfig.innerHTML += `<p>Kubernetes</p>`;
        // defaultConfig.append(defaultConfigKubernetes);
        // defaultConfig.innerHTML += `<p>Scheduler</p>`;
        // defaultConfig.append(defaultConfigScheduler);
        // defaultConfig.innerHTML += `<p>SQL</p>`;
        // defaultConfig.append(defaultConfigSql);
        // defaultConfig.innerHTML += `<p>Jars</p>`;
        // defaultConfig.append(defaultConfigJars);

        // console.log(defaultConfig)
        // Jupyter.toolbar.element.append(defaultConfig);

    }

    let generateCode = async () => {
        // alert("Generating code")

        let clusterStartCode =
            `        import pyspark
        spark = (
            pyspark
            .sql
            .SparkSession
            .builder
            .config('spark.driver.memory', "${document.getElementById("driver_memory_input").value}g")
            .config("spark.driver.cores", "${document.getElementById("driver_cores").value}")
            .config("spark.executor.instances", "${document.getElementById("executer_instance").value}")
            .config("spark.executor.cores", "4")
            .config("spark.executor.memory", "57500m")
            .getOrCreate()
        )
        # Spark Context
        sc = spark.sparkContext`
        let selectedCell = Jupyter.notebook.insert_cell_at_index(0, 0)
        selectedCell.set_text(clusterStartCode);
        selectedCell.focus_cell();

    };

    let makeCallToKernel = (data, username) => {
        console.log("makeCallToKernel called")
        const comm = Jupyter.notebook.kernel.comm_manager.new_comm('my_comm_target', { 'foo': 6 })
        // Send data
        comm.send({ 'data': data })
        // alert("Creating your cluster....")
        document.getElementById("loading-text").innerHTML = `Creating Cluster please wait...`
        // Register a handler
        comm.on_msg(function (msg) {

            if (msg.content.data.status == "success") {
                document.getElementById("loading-text").innerHTML = `Spark Cluster accessible at: `;
                alert("Successfully created cluster")

                if (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") {
                    console.log("from localhost ")
                    console.log("username: ", username)
                    console.log("ui_proxy_basename ", window.location.host)
                    console.log("spark_port ", msg.content.data.sparkUiPort)
                    let link = `${notebookServerURL}proxy/${msg.content.data.sparkUiPort}/jobs/`
                    console.log("link generated " + link)
                    // document.getElementById("loading-text").innerHTML = `<a href="${link}>${link}</a>`

                    var hrefDiv = document.createElement('a');
                    var linkText = document.createTextNode(link);
                    hrefDiv.appendChild(linkText);
                    hrefDiv.href = link;
                    hrefDiv.title = link;
                    hrefDiv.target = "_BLANK"
                    document.getElementById("loading-text").appendChild(hrefDiv);

                    // document.getElementById("loading-text").innerHTML = "HELLo"
                } else {
                    console.log("from jupyterhub")
                    console.log("username: ", username)
                    console.log("ui_proxy_basename ", window.location.host)
                    console.log("spark_port ", msg.content.data.sparkUiPort)
                    let link = `${notebookServerURL}proxy/${msg.content.data.sparkUiPort}/jobs/`
                    console.log("link generated " + link)

                    var hrefDiv = document.createElement('a');
                    var linkText = document.createTextNode(link);
                    hrefDiv.appendChild(linkText);
                    hrefDiv.href = link;
                    hrefDiv.title = link;
                    hrefDiv.target = "_BLANK"
                    document.getElementById("loading-text").appendChild(hrefDiv);


                    
                    // document.getElementById("loading-text").innerHTML = `<a href="${link} target=”_blank”>${link}</a>`

                }


            }
        });
    }

    // return public methods
    return {
        load_ipython_extension: load_extension
    };
});
