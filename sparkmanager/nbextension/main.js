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
        var sparkLogo = document.createElement('img');
        sparkLogo.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Apache_Spark_logo.svg/1200px-Apache_Spark_logo.svg.png"
        sparkLogo.style = "height: 33px ; width: 60px; margin-left: 10px; padding: 5px";
        var fetchDefaultConfigButton = document.createElement('button');
        fetchDefaultConfigButton.innerHTML = 'Start';
        fetchDefaultConfigButton.id = "start_spark_button"
        fetchDefaultConfigButton.onclick = function () {
            fetchDefaultConfig(configCurrentValue)
        };

        let selectConfig = document.createElement("select");
        selectConfig.style = "height: 25px; width: 90px; font-size: 14px"
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

        let settingsButton = document.createElement('button');
        settingsButton.innerHTML = `<img id ="spark_config_logo" disabled=${JSON.parse(sessionStorage.getItem("cluster_data")) ? false :  true} src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Windows_Settings_app_icon.png/480px-Windows_Settings_app_icon.png" style="height: 20px; width: 20px"/>`;
        settingsButton.onclick = function () {
            console.log("Clicked showSettingsModal")
            Jupyter.keyboard_manager.disable()
            document.getElementById("myModal").style.display = "block";
            showSettingsModal()
        };

        let settingsModal = `
        <div id="myModal" class="config-modal" data-keyboard="false" data-backdrop="static">
        <!-- Modal content -->
        <div class="config-modal-content">
            <span class="close">&times;</span>
            <ul class="nav nav-tabs">
            <li role="presentation" class="active" id="cluster_config_tab"><a href="#">Configuration</a></li>
          </ul>

          <p id="cluster_config_content"></p>
        </div>
        </div>
        `



        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `.config-modal {
            display: none; /* Hidden by default */
            position: fixed; /* Stay in place */
            z-index: 1; /* Sit on top */
            left: 0;
            top: 0;
            width: 100%; /* Full width */
            height: 100%; /* Full height */
            overflow: auto; /* Enable scroll if needed */
            background-color: rgb(0,0,0); /* Fallback color */
            background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
          }
          
          /* Modal Content/Box */
          .config-modal-content {
            background-color: #fefefe;
            margin: 15% auto; /* 15% from the top and centered */
            padding: 20px;
            border: 1px solid #888;
            width: 80%; /* Could be more or less, depending on screen size */
          }
          
          /* The Close Button */
          .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
          }
          
          .close:hover,
          .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
          }`;
        document.getElementsByTagName('head')[0].appendChild(style);


        let configDisplay = document.createElement('button');
        configDisplay.id = "config_display"
        configDisplay.style = "margin-right: 5px"
        configDisplay.innerHTML = `Cores: ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.cores'] : 'N/A'} | Memory : ${sessionStorage.getItem("cluster_data") ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.memory'] : 'N/A'}`

        let sparkUiButton = document.createElement('button');
        sparkUiButton.id = "spark_ui_display"
        sparkUiButton.innerHTML = "UI"
        sparkUiButton.style = " display: none"
        sparkUiButton.onclick = function () {
            window.open(sessionStorage.getItem("sparkLink"), "_blank");

        };

       Jupyter.toolbar.element.append(sparkLogo, fetchDefaultConfigButton, selectConfig, configDisplay, settingsButton, sparkUiButton, loadingText, settingsModal);

        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        let cluster_config_tab = `<div><p>THIS IS CLUSTER CONFIG</p></div>`;

        // let cluster_status_tab = `<p id="showLog" style="height: 300px; overflow: scroll"></p>`;
        let fetchUpdatedConfig = () => {
            let childNodes = document.getElementById("cluster_config_content").childNodes;

            let config = {}
            for (let i = 0; i < childNodes.length - 1; i++) {
                if(childNodes[i].childNodes.length) {
                    let key = childNodes[i].children[0].innerText;
                    let value = childNodes[i].children[1].value;
                    console.log(key + " : " + value)
                    config[key] = value
                }
                
            }
            return config
        }
        let renderConfiguration = () => {
            let config = JSON.parse(sessionStorage.getItem("cluster_data"));
            if(!config){
                document.getElementById("cluster_config_content").innerHTML = `<h3>No configuration to show. Please create a cluster first.</h3>`;
                return;
            }
            Object.keys(config).map(eachKey => {
                document.getElementById("cluster_config_content").innerHTML += `
                <div class="input-group" style="margin: 10px">
                <span class="input-group-addon" id="basic-addon1">${eachKey}</span>
                <input type="text" class="form-control" placeholder=${eachKey} value=${config[eachKey]} >
              </div>
                `;
            })

            let updateConfigButton = document.createElement('button');
            updateConfigButton.id = "config_update"
            updateConfigButton.innerHTML = "Update"

            updateConfigButton.onclick = async function () {

                let updatedConfig = fetchUpdatedConfig()
                console.log("updatedConfig ", updatedConfig)


                let xsrf = document.cookie.match("\\b" + "_xsrf" + "=([^;]*)\\b");
                const settings = {
                    method: 'POST',
                    body: JSON.stringify(updatedConfig),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRFToken': xsrf[1]
                    }
                }
                console.log("settings ", settings)
                const response = await fetch(`${notebookServerURL}api/update-config`, settings);
                // const response = await fetch(`https://jsonplaceholder.typicode.com/posts`, settings);
                if (!response.ok) throw Error(response.message);

                try {
                    const data = await response.json();
                    console.log("updated config data ", data);
                    const comm = Jupyter.notebook.kernel.comm_manager.new_comm('update_cluster', { 'foo': 6 })
                    //   // Send data
                    //   comm.send({ 'data': updatedConfig.data, 'cluster_data' : JSON.stringify(updatedConfig.cluster_data)})
                    comm.send({ 'data': data.data, 'cluster_data': data.cluster_data })

                    comm.on_msg(function (msg) {
                        if(msg.content.data.status == "updated_success") {
                            sessionStorage.setItem("cluster_data", JSON.stringify(msg.content.data.cluster_data))
                            console.log("UPDATE COMM CONNECTED ", msg.content.data.status)
                            document.getElementById("config_display").innerHTML = `Cores: ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.cores'] : 'N/A'} | Memory : ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.memory'] : 'N/A'}`
                        } else {
                            alert("Updating failed. Please check values")
                            console.log("UPDATE COMM CONNECTED ", msg.content.data.status)

                        }


                    })
                } catch (err) {
                    throw err;
                }
            }

            document.getElementById("cluster_config_content").appendChild(updateConfigButton)




        }

        let showSettingsModal = () => {
            document.getElementById("cluster_config_content").innerHTML = ``
            renderConfiguration()
        }
       


    };

    let fetchDataFromKernel = () => {
        if(Jupyter.notebook.kernel){
            console.log("Kernel connected...")
            const comm = Jupyter.notebook.kernel.comm_manager.new_comm('get_cluster_config', { 'foo': 6 })
            // Send data
            comm.send({ 'data': "fetch config data" })
            comm.on_msg(function (msg) {
                console.log("CLUSTER CONFIG SAVED IN KERNMEL ", msg.content.data.clusterConfig)
                sessionStorage.setItem("cluster_data", JSON.stringify(msg.content.data.clusterConfig))
                document.getElementById("config_display").innerHTML = `Cores: ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.cores'] : 'N/A'} | Memory : ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.memory'] : 'N/A'}`
            })

        } else {
            console.log("Reinitializing...")
            setTimeout(() => { fetchDataFromKernel() }, 500);
        }
    }

    // will be called when the nbextension is loaded
    function load_extension() {
        Jupyter.notebook.config.loaded.then(initialize);
        fetchDataFromKernel();

    };

    let fetchDefaultConfig = async (currentConfig) => {
        let response = await fetch(`${notebookServerURL}api/show-config/` + currentConfig);
        let config = await response.json();
        console.log("Config printed only from frontend : ", config)
        let username = config.username;
        makeCallToKernel(config.data, username, config.cluster_data)
    }
    let storeDataInsessionStorage = (data) => {
        sessionStorage.setItem("cluster_data", JSON.stringify(data));
    }
    let makeCallToKernel = (data, username, cluster_data) => {
        console.log("makeCallToKernel called")
        const comm = Jupyter.notebook.kernel.comm_manager.new_comm('create_cluster', { 'foo': 6 })
        // Send data
        comm.send({ 'data': data, 'cluster_data': cluster_data.conf })
        // alert("Creating your cluster....")
        // document.getElementById("loading-text").innerHTML = `Creating Cluster please wait...`;
        document.getElementById("start_spark_button").disabled = true;
        document.getElementById("start_spark_button").style = "cursor: not-allowed";
        document.getElementById("spark_config_logo").src = "https://www.voya.ie/Interface/Icons/LoadingBasketContents.gif";
        storeDataInsessionStorage(cluster_data.conf)


        // Register a handler
        comm.on_msg(function (msg) {
            console.log("SUCCESSFULL UPDATED FROM KERNEL ", msg)

            if (msg.content.data.status == "created_success") {
                // document.getElementById("loading-text").innerHTML = `Spark Cluster accessible at: `;
                alert("Successfully created cluster")
                if (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") {
                    console.log("from localhost ")
                    console.log("username: ", username)
                    console.log("ui_proxy_basename ", window.location.host)
                    console.log("spark_port ", msg.content.data.sparkUiPort)
                    let link = `${notebookServerURL}proxy/${msg.content.data.sparkUiPort}/jobs/`
                    console.log("link generated " + link)
                    // document.getElementById("loading-text").innerHTML = `<a href="${link}>${link}</a>`
                    // var hrefDiv = document.createElement('a');
                    // var linkText = document.createTextNode(link);
                    // hrefDiv.appendChild(linkText);
                    // hrefDiv.href = link;
                    // hrefDiv.title = link;
                    // hrefDiv.target = "_BLANK"
                    // document.getElementById("loading-text").appendChild(hrefDiv);
                    sessionStorage.setItem("sparkLink" ,link )
                    document.getElementById("spark_ui_display").style="display: inline; margin-left: 5px;"
                    // document.getElementById("loading-text").innerHTML = "HELLo"
                } else { 
                    console.log("from jupyterhub")
                    console.log("ui_proxy_basename ", window.location.host)
                    console.log("spark_port ", msg.content.data.sparkUiPort)
                    let link = `${notebookServerURL}proxy/${msg.content.data.sparkUiPort}/jobs/`
                    console.log("link generated " + link)
                    // var hrefDiv = document.createElement('a');
                    // var linkText = document.createTextNode(link);
                    // hrefDiv.appendChild(linkText);
                    // hrefDiv.href = link;
                    // hrefDiv.title = link;
                    // hrefDiv.target = "_BLANK"
                    document.getElementById("spark_ui_display").style="display: inline; margin-left: 5px;"
                    sessionStorage.setItem("sparkLink" ,link )

                    // document.getElementById("loading-text").appendChild(hrefDiv);
                }
                document.getElementById("start_spark_button").disabled = false;
                document.getElementById("spark_config_logo").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Windows_Settings_app_icon.png/480px-Windows_Settings_app_icon.png";
                document.getElementById("start_spark_button").style = "cursor: pointer";
                document.getElementById("config_display").innerHTML = `Cores: ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.cores'] : 'N/A'} | Memory : ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.memory'] : 'N/A'}`
            } else {
                alert("Error in pyspark values")
                document.getElementById("loading-text").innerHTML = ``;
                document.getElementById("start_spark_button").disabled = false;
                document.getElementById("spark_config_logo").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Windows_Settings_app_icon.png/480px-Windows_Settings_app_icon.png";
                document.getElementById("start_spark_button").style = "cursor: pointer";
                document.getElementById("spark_ui_display").style="display: none"


            }
        });
    }

    // return public methods
    return {
        load_ipython_extension: load_extension
    };
});
