from pyspark import SparkContext as _SparkContext, SparkConf
from pyspark.sql import SparkSession as _SparkSession
import os
from .config import get_cluster_config_files

def shut_down_jvm():
    # get Java process, a subprocess.Popen object
    proc = _SparkContext._gateway.proc

    # remove the py4j gateway and JVM objects in Spark
    _SparkContext._gateway = None
    _SparkContext._jvm = None
    _SparkSession._jvm = None

    # send SIGTERM
    proc.terminate()
    # wait for process to return exit code, reaps zombie process
    proc.wait()

class SparkCluster():
    def __init__(self, path):
        self.path = path
        self.conf_dir = os.path.join(os.path.dirname(self.path), "conf")

class SparkContext(_SparkContext):
    _cluster = None

    def __init__(self, cluster=None, **kwargs):
        SparkContext._cluster = cluster
        if cluster:
            cluster_file = cluster.path
            conf_dir = cluster.conf_dir

            print("Setting SPARK_CONF_DIR to", conf_dir)
            os.environ['SPARK_CONF_DIR'] = conf_dir

        super().__init__(**kwargs)

    def stop(self):
        # call _SparkContext.stop()
        super().stop()

        # get Spark py4j gateway
        gateway = _SparkContext._gateway
        # close the py4j gateway connections
        gateway.close()
        # shut down JVM
        shut_down_jvm()
    
    @classmethod
    def getOrCreate(cls, conf=None, cluster=None):
        """
        Get or instantiate a SparkContext and register it as a singleton object.
        :param conf: SparkConf (optional)
        """
        with SparkContext._lock:
            if SparkContext._active_spark_context is None:
                SparkContext(conf=conf or SparkConf(), cluster=cluster)
            return SparkContext._active_spark_context

class SparkSession(_SparkSession):
    class Builder(_SparkSession.Builder):
        def getOrCreate(self, cluster=None):
            SparkContext._cluster = cluster

            sparkConf = SparkConf()
            for key, value in self._options.items():
                sparkConf.set(key, value)
            # This SparkContext may be an existing one.
            sc = SparkContext.getOrCreate(sparkConf, cluster=cluster)
            self._sc = sc
            return super().getOrCreate()
    
    builder = Builder()
    
    def stop(self):
        self._jvm.SparkSession.clearDefaultSession()
        self._jvm.SparkSession.clearActiveSession()
        SparkSession._instantiatedSession = None
        SparkSession._activeSession = None
        self._sc.stop()

def get_clusters():
    cluster_files = get_cluster_config_files()
    clusters = [SparkCluster(cluster_file) for cluster_file in cluster_files]
    return clusters
