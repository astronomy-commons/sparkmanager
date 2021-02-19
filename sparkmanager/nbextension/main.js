
define([
    'jquery',
    'base/js/namespace',
    'base/js/dialog',
    './ui',
    './api',
    './utils',
    'require'
], function (
    $,
    Jupyter,
    dialog,
    UI_Promise,
    sparkManagerAPI,
    utils,
    requirejs
) {
    "use strict";

    let notebookServerURL = `${window.location.protocol}//${window.location.host}${Jupyter.contents.base_url}`;
    var UI;
    var comm;
    // add CSS
    $('<link/>')
        .attr({
            rel: 'stylesheet',
            type: 'text/css',
            href: requirejs.toUrl('./sparkmanager.css')
        })
        .appendTo('head');


    var waitForKernel = async function() {
        while (true) {
            if (Jupyter.notebook.kernel) {
                break;
            } else {
                await utils.sleep(10);
            }
        }
        return;
    }

    var ensureKernelAndAPIAndComm = async function() {
        // wait for kernel to connect
        await waitForKernel();
        // load api
        await sparkManagerAPI.init();
        // Register Kernel communication
        comm = Jupyter.notebook.kernel.comm_manager.new_comm('kernelCallback', {'foo': 1});
        comm.on_msg(function(msg) {
            console.log("got message from kernel: " + msg);
            updateFromState();
        });
        comm.on_close(function(msg) {
            console.log("closing comm");
        });
    }

    var startApplicationFromState = async function(mouseEvent) {
        var element = mouseEvent.target;
        // Ensure API is loaded
        await ensureKernelAndAPIAndComm();

        var state = await sparkManagerAPI.getState();
        var cluster = state['cluster'];
        if (cluster) {
            await sparkManagerAPI.setCluster(cluster);
        } else {
            await updateClusterFromSelection();
        }
        state = await sparkManagerAPI.getState();
        var config = state['user_config'];
        if (!config) {
            config = {};
        }
        await sparkManagerAPI.startApplication(cluster, config);
        await updateUIPending();
    }

    var stopApplication = async function() {
        // Ensure API is loaded
        await ensureKernelAndAPIAndComm();
        var status = await sparkManagerAPI.getStatus();
        if (status == "started") {
            await sparkManagerAPI.stopApplication();
            await updateUIPending();
        } else if (status == "stopped") {
            await updateUIStopped();
        } else if (status == "pending") {
            await updateUIPending();
        }
    }

    var clusterSelectHandler = async function(changeEvent) {
        var element = changeEvent.target;
        var cluster = element.value;
        console.log("selected cluster: " + cluster);
        // var state = sparkManagerAPI.getState();
        // state['cluster'] = cluster;
        await sparkManagerAPI.setCluster(cluster);
    }

    var updateUIClusterList = async function() {
        var state = await sparkManagerAPI.getState();
        console.log("got state: ");
        console.log(state);

        var clusters = await sparkManagerAPI.getClusters();
        var cluster = state['cluster'];
                // update the cluster select
        var keys = Object.keys(clusters);
        var options = UI.clusterSelect.options;

        while (options.length > 0) {
            options.remove(0);
        }
        for (var i = 0; i < keys.length; i++) {
            var option = new Option();
            var key = keys[i];
            var clusterName = clusters[key]['name'];
            option.value = key;
            option.text = clusterName;
            options.add(option);
            if (key == cluster) {
                options.selectedIndex =  i;
            }
        }
    }
    
    var updateClusterFromSelection = async function() {
        var options = UI.clusterSelect.options;
        var cluster = options[options.selectedIndex].value;
        await sparkManagerAPI.setCluster(cluster);
    }

    var updateUIClusterResources = async function() {
        var state = await sparkManagerAPI.getState();
        console.log("got state: ");
        console.log(state);
        
        var config = state['config'];
        console.log("got config: ");
        console.log(config);
        
        // Update the cluster status
        if (config) {
            var cores = config['spark.driver.cores'];
            var memory = config['spark.driver.memory'];
            UI.clusterStatusText.innerHTML = `Cores: ${cores} | Memory: ${memory}`;
        } else {
            UI.clusterStatusText.innerHTML = `Cores: N/A | Memory: N/A`;
        }
    }
    
    var enableDashboardLink = async function(port) {
        // Update UI link
        UI.sparkUI.onclick = function(clickEvent) {
            window.open(`${notebookServerURL}proxy/${port}/jobs/`, "_blank");
        };
    }
    var disableDashboardLink = async function(port) {
        UI.sparkUI.onclick = function() {};
    }

    var updateUIStopped = async function() {
        var state = await sparkManagerAPI.getState();
        // enable selecting a cluster
        UI.clusterSelect.disabled = false;
        // enable start/stop
        UI.startButton.disabled = false;
        UI.startButtonText.innerHTML = "Start";
        UI.startButton.onclick = startApplicationFromState;
        await disableDashboardLink();
        await updateClusterFromSelection();
        await updateUIClusterResources();
    }
    var updateUIPending = async function() {
        // disable selecting a cluster
        UI.clusterSelect.disabled = true;
        // disable start/stop
        UI.startButton.disabled = true;
        UI.startButtonText.innerHTML = "Pending";
        await disableDashboardLink();
    }
    var updateUIStarted = async function() {
        var state = await sparkManagerAPI.getState();
        var uiPort = state['uiPort'];
        // disable selecting a cluster
        UI.clusterSelect.disabled = true;
        // enable start/stop
        UI.startButton.disabled = false;
        UI.startButtonText.innerHTML = "Stop";
        UI.startButton.onclick = stopApplication;

        await enableDashboardLink(uiPort);
        await updateUIClusterResources();
    }
    
    var updateFromState = async function() {
        var state = await sparkManagerAPI.getState();
        var status = state['status'];

        // Update the list of clusters
        await updateUIClusterList();

        // Update the UI based on the application status
        if (status == "stopped") {
            await updateUIStopped();
        } else if (status == "pending") {
            await updateUIPending();
        } else if (status == "started") {
            await updateUIStarted();
        }
    }

    var initialize = async function() {
        await ensureKernelAndAPIAndComm();
        UI_Promise.then(
            function(_UI) {
                UI = _UI;
                UI.clusterSelect.onchange = clusterSelectHandler;
                UI.sparkConfig.onclick = async function() {
                    if (UI.configWindow.style.display == "none") {
                        UI.configWindow.style.display = "block";
                    } else {
                        UI.configWindow.style.display = "none";
                    }
                }
                UI.configWindowClose.onclick = async function() {
                    if (UI.configWindow.style.display == "none") {
                        UI.configWindow.style.display = "block";
                    } else {
                        UI.configWindow.style.display = "none";
                    }
                }
            }
        ).then(
            updateFromState
        );
    }

    // will be called when the nbextension is loaded
    function load_extension() {
        Jupyter.notebook.config.loaded.then(initialize);
    };

    // return public methods
    return {
        load_ipython_extension: load_extension,
        load_api: sparkManagerAPI,
    };
});
