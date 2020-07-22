import socket
import logging
import os
from threading import Thread
from ipykernel.comm import Comm
from jinja2 import Template
import json
import threading


# this function gets imported and executed when the IPython kernel is started

def load_ipython_extension(ipython):
    # The `ipython` argument is the currently active `InteractiveShell`
    # instance, which can be used in any way. This allows you to register
    # new magics or aliases, for example.

    def create_cluster_func(comm, open_msg):
        # comm is the kernel Comm instance
        # msg is the comm_open message
        # Register handler for later messages
        @comm.on_msg
        def _recv(msg):
            print("RECEIVED")
            print(msg)
            # try:
            #     sparkExist = ipython.ev('spark')
            #     ipython.ex("spark.stop()")
            # except:
            #     print("spark does not exist")


            ipython.ex('clusterConfig = ' + str(msg['content']['data']['cluster_data']))
            # ipython.ex(SPARK_TEMPLATE.render())
            ipython.ex(msg['content']['data']['data'])
            sparkUiUrl = ipython.ev("sc.uiWebUrl")
            comm.send({'data': msg['content']['data'] , 'status' : 'created_success' , 'sparkUiPort' : sparkUiUrl[-4:]})
        # Send data to the frontend on creation

    def update_cluster_func(comm, open_msg):
        # comm is the kernel Comm instance
        # msg is the comm_open message
        # Register handler for later messages
        @comm.on_msg
        def _recv(msg):
            print("RECEIVED UPDATE REQ")
            print(msg)
            ipython.ex('clusterConfig = ' + str(msg['content']['data']['cluster_data']))
            ipython.ex("spark.stop()")
            ipython.ex(msg['content']['data']['data'])
            comm.send({'status' : 'updated_success' , 'cluster_data' : msg['content']['data']['cluster_data']})
            ipython.ex("test = 10")
            
    def get_cluster_config_func(comm, open_msg):
        @comm.on_msg
        def _recv(msg):
            try:
                clusterConfig = ipython.ev('clusterConfig')
            except:
                clusterConfig = ''
            comm.send({'status' : 'config_fetched_success' , 'clusterConfig' : clusterConfig})
    def fetch_logs(comm):
        f = open("log.file", "r")
        logs = f.read()
        comm.send({'status' : 'log_fetched_success' , 'log' : logs})
        if (ipython.ev('shouldFetchLog')):
            threading.Timer(2.0,fetch_logs, [comm]).start()
         
    def get_kernel_logs_func(comm, open_msg):
        @comm.on_msg
        def _recv(msg):
            ipython.ex('shouldFetchLog = True')
            thread = threading.Timer(2.0,fetch_logs, [comm])
            thread.start()
    def stop_kernel_logs_func(comm, open_msg):
        @comm.on_msg
        def _recv(msg):
            ipython.ex('shouldFetchLog = False')
            comm.send({'status' : 'log_fetched_cancelled' })
                
    get_ipython().kernel.comm_manager.register_target('create_cluster', create_cluster_func)
    get_ipython().kernel.comm_manager.register_target('update_cluster', update_cluster_func)
    get_ipython().kernel.comm_manager.register_target('get_cluster_config', get_cluster_config_func)
    get_ipython().kernel.comm_manager.register_target('get_kernel_logs', get_kernel_logs_func)
    get_ipython().kernel.comm_manager.register_target('stop_kernel_logs', stop_kernel_logs_func)


    




def unload_ipython_extension(ipython):
    # If you want your extension to be unloadable, put that logic here.
	pass