define([
    'base/js/namespace',
    './utils'
], function (
    Jupyter,
    utils
) {
    var sparkManagerAPI = {
        iopubCallback : function(iopubOutput) {
            var content = iopubOutput['content'];
            console.log("iopub output");
            console.log(iopubOutput);
            
            var result = "";
            if (iopubOutput['msg_type'] == "stream") {
                result = content['text'];
            } else if (iopubOutput['msg_type'] == "error") {
                var ename = content['ename'];
                var evalue = content['evalue'];
                result = `${ename}: ${evalue}`;
            }
            sparkManagerAPI.execute.iopubOutputResult = result
            sparkManagerAPI.execute.iopubOutputDone = true;
        },
        iopubClearOutputCallback : function(output) {
            console.log("iopub clear output");
            console.log(output);
            sparkManagerAPI.execute.done = true;
        },
        shellReplyCallback : function(output) {
            console.log("shell reply");
            console.log(output);
            var content = output['content'];
            var status = content['status'];

            var result = "";
            if (status == "error") {
                var ename = content['ename'];
                var evalue = content['evalue'];
                result = `${ename}: ${evalue}`;
            }

            sparkManagerAPI.execute.status = status;
            sparkManagerAPI.execute.shellReplyResult = result;
            sparkManagerAPI.execute.shellReplyDone = true;
        },
        shellPayloadCallback : function(output) {
            console.log("shell payload");
            console.log(output);
            sparkManagerAPI.execute.done = true;
        },
        inputCallback : function(output) {
            console.log("input");
            console.log(output);
            sparkManagerAPI.execute.done = true;
        },
        execute : {
            result : "none",
            status : "ok",
            shellReplyDone : false,
            iopubOutputDone : false,
            done : false,
            init : function() {
                sparkManagerAPI.execute.result = "none";
                sparkManagerAPI.execute.status = "ok";
                sparkManagerAPI.execute.shellReplyDone = false;
                sparkManagerAPI.execute.shellReplyResult = "";
                sparkManagerAPI.execute.iopubOutputDone = false;
                sparkManagerAPI.execute.ioputOutputResult = "";
            },  
            withReply : async function(cmd) {
                sparkManagerAPI.execute.init();
                console.log("executing with reply: " + cmd);
                var msg_id = Jupyter.notebook.kernel.execute(
                    cmd, 
                    {
                        shell : {
                            reply: sparkManagerAPI.shellReplyCallback
                        },
                        iopub : {
                            output : sparkManagerAPI.iopubCallback
                        }
                    }
                )
                while ( 
                    (! sparkManagerAPI.execute.shellReplyDone)
                    ||
                    (! sparkManagerAPI.execute.iopubOutputDone)
                ) {
                    console.log("sleeping 100 ms...");
                    await utils.sleep(100);
                }
                var result = sparkManagerAPI.execute.iopubOutputResult;
                if (sparkManagerAPI.execute.status == 'ok') {
                    return {
                        status : sparkManagerAPI.execute.status,
                        result : result
                    };
                } else {
                    throw "error in sparkManagerAPI.withReply: " + result;
                }
            },
            noReply : async function(cmd) {
                sparkManagerAPI.execute.init();
                console.log("executing without reply: " + cmd);
                var msg_id = Jupyter.notebook.kernel.execute(
                    cmd, 
                    {
                        shell : {
                            reply : sparkManagerAPI.shellReplyCallback
                        }
                    }
                )
                while ( 
                    (! sparkManagerAPI.execute.shellReplyDone)
                ) {
                    console.log("sleeping 100 ms...");
                    await utils.sleep(100);
                }
                var result = sparkManagerAPI.execute.shellReplyResult;

                if (sparkManagerAPI.execute.status == 'ok') {
                    return {
                        status : sparkManagerAPI.execute.status,
                        result : result
                    };
                } else {
                    throw "error in sparkManagerAPI.noReply:" + result;
                }
            }
        },
        init : async function() {
            var reply = await sparkManagerAPI.execute.noReply(
                "import sparkmanager;\
                sparkmanager.nbextension.init(locals())"
            );
        },
        getClusters : async function(tries=0) {
            var reply = await sparkManagerAPI.execute.withReply(
                "sparkmanager.nbextension.getClusters()"
            );
            try {
                var clusters = JSON.parse(reply['result']);
                return clusters;
            } catch(e) {
                if (tries < 3) {
                    return await sparkManagerAPI.getClusters(tries + 1);
                } else {
                    throw e;
                }
            }
        },
        setCluster : async function(cluster) {
            var cmd = `sparkmanager.nbextension.setCluster('${cluster}')`;
            var reply = await sparkManagerAPI.execute.noReply(cmd);
        },
        startApplication : async function(cluster, config) {
            var config_string = JSON.stringify(config);
            var cmd = `sparkmanager.nbextension.startApplication(locals(), '${cluster}', '${config_string}')`;
            var reply = await sparkManagerAPI.execute.noReply(cmd);
        },
        stopApplication : async function() {
            var cmd = 'sparkmanager.nbextension.stopApplication(locals());';
            var reply = await sparkManagerAPI.execute.noReply(cmd);
            // 
            // var state = sparkManagerAPI.getStatus();
            // await sparkManagerAPI.setState()
        },
        getStatus : async function() {
            var state = await sparkManagerAPI.getState();
            return state['status'];
        },
        setStatus : async function(status) {
            return await sparkManagerAPI.updateState({"status": status});
        },
        getState : async function(tries=0) {
            var cmd = "sparkmanager.nbextension.getState()";
            var reply = await sparkManagerAPI.execute.withReply(cmd);
            console.log("get state: result = " + reply['result']);
            
            try {
                var state = JSON.parse(reply['result']);
                return state;
            } catch(e) {
                if (tries < 3) {
                    return await sparkManagerAPI.getState(tries + 1);
                } else {
                    throw e;
                }
            }
        },
        setState : async function(state) {
            var state_string = JSON.stringify(state);
            var cmd = `sparkmanager.nbextension.setState('${state_string}')`;
            var reply = await sparkManagerAPI.execute.noReply(cmd);
        },
        updateState : async function(state) {
            var state_string = JSON.stringify(state);
            var cmd = `sparkmanager.nbextension.updateState('${state_string}')`;
            var reply = await sparkManagerAPI.execute.noReply(cmd);
        }
    }

    return sparkManagerAPI;
});
