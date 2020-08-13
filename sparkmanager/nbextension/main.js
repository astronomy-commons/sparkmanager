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
        let listOfConfig = await fetch(`${window.location.protocol}//${window.location.host}/api/all-config`);
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
        settingsButton.innerHTML = `<img id ="spark_config_logo" disabled=${JSON.parse(sessionStorage.getItem("cluster_data")) ? false :  true} src="data:image/png;base64,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" style="height: 20px; width: 20px"/>`;
        settingsButton.onclick = function () {
            const comm = Jupyter.notebook.kernel.comm_manager.new_comm('get_kernel_logs', { 'foo': 6 })
            // Send data
            comm.send({ 'data': "fetch config data" })
            comm.on_msg(function (msg) {
                console.log(msg.content.data.log)
                // document.getElementById("showLog").innerHTML = msg.content.data.log

            })
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
            <li role="presentation" id="cluster_status_tag"><a href="#">Status</a></li>
          </ul>
          <button onclick="this.stopFetchingLogs()">Close</button>

          <p id="cluster_config_content"></p>
          <div id="closeModalBtn"></div>
        </div>
        </div>
        `


        let closeModalBtn = document.createElement('button')
        closeModalBtn.innerHTML = "Close"
        closeModalBtn.onclick = function () {
            console.log("Closing modal...")
            const comm = Jupyter.notebook.kernel.comm_manager.new_comm('stop_kernel_logs', { 'foo': 6 })
            // Send data
            comm.send({ 'data': "stop log fetch " })
            comm.on_msg(function (msg) {
                console.log("log status.... ", msg.content)


            })
        }

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


        Jupyter.toolbar.element.append(sparkLogo, fetchDefaultConfigButton, selectConfig, configDisplay, settingsButton, loadingText, settingsModal);
        document.getElementById("closeModalBtn").append(closeModalBtn)

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
                const response = await fetch(`${window.location.protocol}//${window.location.host}/api/update-config`, settings);
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
        document.getElementById("cluster_status_tag").onclick = () => {
            if (document.getElementById("cluster_config_tab").classList.contains("active")) {
                document.getElementById("cluster_config_tab").classList.remove("active")
            }
            document.getElementById("cluster_status_tag").classList.add("active")
            // document.getElementById("cluster_config_content").innerHTML = cluster_status_tab

        }

        document.getElementById("cluster_config_tab").onclick = () => {
            if (document.getElementById("cluster_status_tag").classList.contains("active")) {
                document.getElementById("cluster_status_tag").classList.remove("active")
            }
            document.getElementById("cluster_config_tab").classList.add("active")
            // document.getElementById("cluster_config_content").innerHTML = cluster_config_tab
            renderConfiguration()
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
        let response = await fetch(`${window.location.protocol}//${window.location.host}/api/show-config/` + currentConfig);
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
        document.getElementById("loading-text").innerHTML = `Creating Cluster please wait...`;
        document.getElementById("start_spark_button").disabled = true;
        document.getElementById("start_spark_button").style = "cursor: not-allowed";
        document.getElementById("spark_config_logo").src = "https://thumbs.gfycat.com/GoodSnoopyCrustacean-size_restricted.gif";
        storeDataInsessionStorage(cluster_data.conf)


        // Register a handler
        comm.on_msg(function (msg) {
            console.log("SUCCESSFULL UPDATED FROM KERNEL ", msg)

            if (msg.content.data.status == "created_success") {
                document.getElementById("loading-text").innerHTML = `Spark Cluster accessible at: `;
                alert("Successfully created cluster")
                if (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") {
                    console.log("from localhost ")
                    console.log("username: ", username)
                    console.log("ui_proxy_basename ", window.location.host)
                    console.log("spark_port ", msg.content.data.sparkUiPort)
                    let link = `${window.location.protocol}//${window.location.host}/proxy/${msg.content.data.sparkUiPort}/jobs/`
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
                    console.log("username: ", currentUser)
                    console.log("ui_proxy_basename ", window.location.host)
                    console.log("spark_port ", msg.content.data.sparkUiPort)
                    let link = `${window.location.protocol}://${window.location.host}/user/${username}/proxy/${msg.content.data.sparkUiPort}/jobs/`
                    console.log("link generated " + link)
                    var hrefDiv = document.createElement('a');
                    var linkText = document.createTextNode(link);
                    hrefDiv.appendChild(linkText);
                    hrefDiv.href = link;
                    hrefDiv.title = link;
                    hrefDiv.target = "_BLANK"
                    document.getElementById("loading-text").appendChild(hrefDiv);
                }
                document.getElementById("start_spark_button").disabled = false;
                document.getElementById("spark_config_logo").src = "data:image/png;base64,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";
                document.getElementById("start_spark_button").style = "cursor: pointer";
                document.getElementById("config_display").innerHTML = `Cores: ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.cores'] : 'N/A'} | Memory : ${JSON.parse(sessionStorage.getItem("cluster_data")) ? JSON.parse(sessionStorage.getItem("cluster_data"))['spark.driver.memory'] : 'N/A'}`
            } else {
                alert("Error in pyspark values")
                document.getElementById("loading-text").innerHTML = ``;
                document.getElementById("start_spark_button").disabled = false;
                document.getElementById("spark_config_logo").src = "data:image/png;base64,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";
                document.getElementById("start_spark_button").style = "cursor: pointer";

            }
        });
    }

    // return public methods
    return {
        load_ipython_extension: load_extension
    };
});
