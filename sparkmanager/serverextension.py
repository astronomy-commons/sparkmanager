from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import os
import json
from jinja2 import Template
import getpass
from . import config

class Config(IPythonHandler):
    def get(self,config_name):
        print(self.request)
        print("config_name")
        print(config_name)
        config_values = {}
        
        cluster_configs = config.get_cluster_configs()
        if config_name in cluster_configs:
            config_values = cluster_configs[config_name]
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
            self.finish({"status": "success"   , "username" : username ,'cluster_data': config_values ,"data": SPARK_TEMPLATE.render(conf=config_values['conf'])})
        else:
            self.finish({"status": "error"})

class UpdateConfig(IPythonHandler):
    def post(self):
        body = json.loads(self.request.body)
        print(body)
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
        self.finish({"status": "success_updated"   , 'cluster_data': body ,"data": SPARK_TEMPLATE.render(conf=body)})


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
        
        cluster_configs = config.get_cluster_configs()
        cluster_names  = list(cluster_configs.keys())
        
        self.finish({"status": "success", "username" : username , "data": cluster_names})

    
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
    update_existing_cluster = url_path_join(
        web_app.settings['base_url'], '/api/update-config')

    web_app.add_handlers(host_pattern, [(show_config_route, Config)])
    web_app.add_handlers(host_pattern, [(add_config_route, ConfigAdd)])
    web_app.add_handlers(host_pattern, [(get_all_config, ConfigAll)])
    web_app.add_handlers(host_pattern, [(update_existing_cluster, UpdateConfig)])


