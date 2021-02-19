import os
import json
from .config import get_cluster_config_files
# from .application import make_conf, start_application, start_sql_application, _sparkmanager_launch_gateway
from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession

from .application import SparkApplication
from .config import _get_conf, _fill_conf, _merge_conf

def shut_down_jvm(gateway):
    proc = gateway.proc

    SparkContext._gateway = None
    SparkContext._jvm = None

    proc.terminate()
    proc.wait()

class SparkManagerContext(SparkContext):
    _cluster = None

    def __init__(self, *args, cluster=None, **kwargs):
        SparkManagerContext._cluster = cluster
        super().__init__(*args, **kwargs)

    def stop(self):
        super().stop()

        gateway = self._gateway
        gateway.close()
        shut_down_jvm(gateway)

    def getOrCreate(self, cluster=None, conf=None):
        SparkManagerContext._cluster = cluster
        if cluster:
            cluster_file = cluster.path
            conf_dir = cluster.conf_dir

            print("Setting SPARK_CONF_DIR to", conf_dir)
            os.environ['SPARK_CONF_DIR'] = conf_dir

        return super().getOrCreate(conf=conf)

class SparkManagerSession(SparkSession):
    def getOrCreate(self, cluster=None):
        SparkManagerContext._cluster = cluster

        sparkConf = SparkConf()
        for key, value in self._options.items():
            sparkConf.set(key, value)
        # This SparkContext may be an existing one.
        sc = SparkManagerContext.getOrCreate(sparkConf)
        self._sc = sc
        return super().getOrCreate()

    def stop(self):
        self._jvm.SparkSession.clearDefaultSession()
        self._jvm.SparkSession.clearActiveSession()
        SparkSession._instantiatedSession = None
        SparkSession._activeSession = None
        self._sc.stop()




class Cluster():
    def __init__(self, path):
        self.path = path
        self.conf_dir = os.path.join(os.path.dirname(self.path), "conf")

    def get_conf(self):
        return _get_conf(self.path)

    def make_application(self, conf=None):
        print("Setting SPARK_CONF_DIR to", self.conf_dir)
        os.environ['SPARK_CONF_DIR'] = self.conf_dir
        cluster_conf = self.get_conf()
        if conf:
            app_conf = _merge_conf(cluster_conf, conf)
        else:
            app_conf = cluster_conf

        spark_app = SparkApplication(conf=app_conf)
        spark_app.start()
        return spark_app

    def start_gateway(self, conf):
        if not self.gateway:
            self.gateway = _sparkmanager_launch_gateway(conf=conf)
        return self.gateway

    def make_sql_application(self, conf=None):
        spark_app = self.make_application(conf=conf)
        sc = spark_app.sc
        spark = SparkSession(sc)
        return spark, sc

def get_clusters():
    cluster_files = get_cluster_config_files()
    clusters = [Cluster(cluster_file) for cluster_file in cluster_files]
    return clusters

def get_cluster(id):
    clusters = get_clusters()