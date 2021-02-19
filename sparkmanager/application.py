from .core import SparkContext, SparkCluster
from .config import get_cluster_config_files
from pyspark import SparkConf

def start_application(cluster_file, conf):
    # Give a cluster ID and dictionary of configurations, create a SparkContext
    cluster = SparkCluster(cluster_file)

    if type(conf) == dict:
        spark_conf = SparkConf()
        for key, value in conf.items():
            spark_conf.set(key, value)
        conf = spark_conf

    sc = SparkContext(cluster=cluster, conf=conf)
    return sc
