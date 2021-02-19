from .config import get_cluster_configs
from .core import SparkCluster, SparkContext, SparkSession
from pyspark import SparkConf
import json
import threading

__version__ = "0.1"

state = {
    'status' : "stopped", # can be stopped, pending, or running
    'cluster' : None, # the 'cluster' file
    'default_config' : None, # the default config from the cluster file
    'user_config' : None, # the config from the UI
    'config' : None, # the result of merge(user_config, default_config)
    'uiPort' : None, # the port for accessing the Spark Application UI
}

ipython = None
comm = None

def init(namespace):
    global ipython
    ipython = namespace['get_ipython']()
    
    def _callback(_comm, msg):
        print("got open message:", msg)
        global comm
        comm = _comm
    
    ipython.kernel.comm_manager.register_target("kernelCallback", _callback)

def getClusters():
    clusters = get_cluster_configs()
    clusters_str = json.dumps(clusters)
    print(clusters_str)
    return clusters_str

def setCluster(cluster):
    updateState(json.dumps({"cluster": cluster}))
    clusters = get_cluster_configs()
    config = clusters[cluster]['conf']
    updateState(json.dumps({"default_config": config}))

def startApplication(namespace, cluster, config_string):
    def _f(namespace, cluster, config_string):
        cluster = SparkCluster(cluster)

        conf = SparkConf()
        # get cluster default configuration
        clusters = get_cluster_configs()
        default_config = clusters[cluster.path]['conf']
        for key, value in default_config.items():
            conf.set(key, value)

        # update with user configuration
        user_config = json.loads(config_string)
        for key, value in user_config.items():
            conf.set(key, value)
        
        sc = SparkContext(cluster=cluster, conf=conf)
        spark = SparkSession(sc)

        namespace['sc'] = sc
        namespace['spark'] = spark

        conf = sc.getConf().getAll()
        conf_dict = {k: v for k, v in conf}

        try:
            uiPort = sc.uiWebUrl.split(":")[-1]
        except:
            uiPort = None


        updateState(json.dumps({"config": conf_dict}))
        updateState(json.dumps({"uiPort": uiPort}))
        updateState(json.dumps({"status": "started"}))

        global comm
        if comm:
            comm.send({"update": "please"})

    updateState(json.dumps({"status": "pending"}))
    return threading.Thread(target=_f, args=(namespace, cluster, config_string)).start()

def stopApplication(namespace):
    namespace['spark'].stop()
    del namespace['spark']
    del namespace['sc']
    updateState(json.dumps({"config": None}))
    updateState(json.dumps({"uiPort": None}))
    updateState(json.dumps({"status": "stopped"}))
    global comm
    if comm:
        comm.send({"update": "please"})

def test(_json_str):
    print(_json_str)

def setState(_json_str):
    global state
    state = json.loads(_json_str)
    return json.dumps(state)

def updateState(_json_str):
    global state
    _update = json.loads(_json_str)
    state.update(_update)
    return json.dumps(state)

def getState():
    _json_str = json.dumps(state)
    print(_json_str)
    return json.dumps(state)