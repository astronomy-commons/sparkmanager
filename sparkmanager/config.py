from jupyter_core.paths import jupyter_config_path
import os
from glob import glob
import json

def sparkmanager_config_path():
    """
    Gets all paths on the system that could store configuration files. 
    These paths are derived from those used by jupyter in addition to the module path 
    """
    module_path = os.path.dirname(os.path.abspath(__file__))
    jupyter_paths = jupyter_config_path()
    sparkmanager_paths = [c.replace("jupyter", "sparkmanager") for c in jupyter_paths] + [module_path]
    return sparkmanager_paths

def get_cluster_config_paths():
    """
    Appends "clusters" to the sparkmanager configuration paths
    """
    paths = sparkmanager_config_path()
    cluster_paths = [os.path.join(path, "clusters") for path in paths]
    return cluster_paths

def get_cluster_config_files():
    """
    Searches for JSON files in the clusters directories in the sparkmanager configuration directories 
    """
    paths = get_cluster_config_paths()

    cluster_configs = []

    for path in paths:
        clusters = glob(os.path.join(path, "*"))
        for cluster in clusters:
            json_path = os.path.join(cluster, "cluster.json")
            if os.path.exists(json_path):
                print("found cluster:", json_path)
                cluster_configs.append(json_path)
    
    return cluster_configs

def get_cluster_configs():
    """
    Loads the cluster configuration JSON files into memory
    """
    configs = {}
    cluster_config_files = get_cluster_config_files()
    for path in cluster_config_files:
        with open(path, "r") as f:
            config_values = json.load(f)
        name = config_values.get('name')
        configs[name] = config_values
    return configs
