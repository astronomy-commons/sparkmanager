from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import os
import json
from jinja2 import Template
import getpass
config = []
# default_file_path = "/usr/local/Cellar/apache-spark/2.4.5/libexec/conf/spark-defaults.conf"
default_file_path = "/home/bisso/.sparkmanager/clusters/"

SPARK_MANAGER_DIR = os.environ.get("SPARK_MANAGER_DIR", None)
if SPARK_MANAGER_DIR:
    MANAGER_PATH = SPARK_MANAGER_DIR
else:
    MANAGER_PATH = os.path.join(*[os.environ['HOME'], ".sparkmanager"])

CLUSTER_PATH = os.path.join(MANAGER_PATH, "clusters")

defaultConfig = []

class Config(IPythonHandler):
    def get(self,config_name):
        print(self.request)
        print("config_name")
        print(config_name)
        list_of_cluster_dirs = os.listdir(CLUSTER_PATH)
        config_values = {}
        if config_name in list_of_cluster_dirs:
            config_file_path = os.path.join(CLUSTER_PATH, config_name, "cluster.json")
            print(os.listdir(CLUSTER_PATH))
            print(config_file_path)
            with open(config_file_path, 'r') as config_file:
                config_values = json.load(config_file)
                print (config_values['conf'])
                SPARK_TEMPLATE = Template("""import pyspark
spark = (
    pyspark
    .sql
    .SparkSession
    .builder
    {%- for key, value in conf.items() %}
    .config("{{ key }}", "{{ value }}")
    {%- endfor %}
    .getOrCreate()
)
sc = spark.sparkContext
""")
            username = getpass.getuser()
            self.finish({"status": "success"   , "username" : username , "data": SPARK_TEMPLATE.render(conf=config_values['conf'])})

        else:
            self.finish({"status": "error"})


class ConfigAdd(IPythonHandler):
    def get(self):

        key = json.loads(self.request.body)["id"]
        configObject = {}
        configObject[key] = json.loads(self.request.body)
        config.append(configObject)
        self.finish({"status": "Added successfully", "data": configObject})


class ConfigAll(IPythonHandler):
    def get(self):
        username = getpass.getuser()
        list_of_cluster_dirs = os.listdir(CLUSTER_PATH)
        self.finish({"status": "success", "username" : username , "data": list_of_cluster_dirs})

    
def load_jupyter_server_extension(nb_server_app):
    print("Hello world from backend")
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    # pass
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    show_config_route = url_path_join(
        web_app.settings['base_url'], '/api/show-config/([^/]+)?')
    add_config_route = url_path_join(
        web_app.settings['base_url'], '/add-config')
    get_all_config = url_path_join(
        web_app.settings['base_url'], '/api/all-config')

    web_app.add_handlers(host_pattern, [(show_config_route, Config)])
    web_app.add_handlers(host_pattern, [(add_config_route, ConfigAdd)])
    web_app.add_handlers(host_pattern, [(get_all_config, ConfigAll)])

