from pyspark import SparkContext as _SparkContext
from pyspark import SparkConf
from .utils import sparkmanager_launch_gateway

class SparkContext(_SparkContext):
    def __init__(self):
        """
        Create the gateway
        Return SparkContext
        """

# make configuration
sparkmanager.config.make_conf(cluster)
# - opens ${cluster.path}/cluster.json

# make application: 
sparkmanager.application.make_app(cluster)
# - sets configuration directory
# - creates SparkConf using parameters in config directory
# -- conf = sparkmanager.config.make_conf(conf_file)
# - makes gateway
# -- Creates JVM and initializes
# -- gateway sparkmanager.launch_gateway(conf=conf)
# - makes SparkContext
# -- sc = SparkContext(conf=conf, gateway=gateway)
# return sc

# make sql application:
sparkmanager.application.make_sql_app(cluster)
# - makes application
# -- sc = sparkmanager.make_app(cluster)
# - makes SparkSession
# -- spark = SparkSession(sc)
# return spark
