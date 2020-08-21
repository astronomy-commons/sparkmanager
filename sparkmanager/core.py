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
            """Gets an existing :class:`SparkSession` or, if there is no existing one, creates a
            new one based on the options set in this builder.
            This method first checks whether there is a valid global default SparkSession, and if
            yes, return that one. If no valid global default SparkSession exists, the method
            creates a new SparkSession and assigns the newly created SparkSession as the global
            default.
            >>> s1 = SparkSession.builder.config("k1", "v1").getOrCreate()
            >>> s1.conf.get("k1") == "v1"
            True
            In case an existing SparkSession is returned, the config options specified
            in this builder will be applied to the existing SparkSession.
            >>> s2 = SparkSession.builder.config("k2", "v2").getOrCreate()
            >>> s1.conf.get("k1") == s2.conf.get("k1")
            True
            >>> s1.conf.get("k2") == s2.conf.get("k2")
            True
            """
            with self._lock:
                session = SparkSession._instantiatedSession
                if session is None or session._sc._jsc is None:
                    if self._sc is not None:
                        sc = self._sc
                    else:
                        sparkConf = SparkConf()
                        for key, value in self._options.items():
                            sparkConf.set(key, value)
                        # This SparkContext may be an existing one.
                        sc = SparkContext.getOrCreate(sparkConf, cluster=cluster)
                    # Do not update `SparkConf` for existing `SparkContext`, as it's shared
                    # by all sessions.
                    session = SparkSession(sc)
                for key, value in self._options.items():
                    session._jsparkSession.sessionState().conf().setConfString(key, value)
                return session

        # def getOrCreate(self, cluster=None):
        #     SparkContext._cluster = cluster

        #     sparkConf = SparkConf()
        #     for key, value in self._options.items():
        #         sparkConf.set(key, value)
        #     # This SparkContext may be an existing one.
        #     sc = SparkContext.getOrCreate(sparkConf, cluster=cluster)
        #     self._sc = sc
        #     return super().getOrCreate()
    
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
