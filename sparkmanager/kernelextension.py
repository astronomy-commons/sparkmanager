import socket
import logging
import os
from threading import Thread
from ipykernel.comm import Comm
from jinja2 import Template
import json


# this function gets imported and executed when the IPython kernel is started


def load_ipython_extension(ipython):
    # The `ipython` argument is the currently active `InteractiveShell`
    # instance, which can be used in any way. This allows you to register
    # new magics or aliases, for example.

    def target_func(comm, open_msg):
        # comm is the kernel Comm instance
        # msg is the comm_open message
        # Register handler for later messages
        @comm.on_msg
        def _recv(msg):
            print("RECEIVED")
            print(msg)
            # ipython.ex(SPARK_TEMPLATE.render())
            ipython.ex(msg['content']['data']['data'])
            sparkUiUrl = ipython.ev("sc.uiWebUrl")
            comm.send({'data': msg['content']['data'] , 'status' : 'success' , 'sparkUiPort' : sparkUiUrl[-4:]})
        # Send data to the frontend on creation
        comm.send({'message':  "CREATED SUCCESSFULLY"})
    get_ipython().kernel.comm_manager.register_target('my_comm_target', target_func)


def unload_ipython_extension(ipython):
    # If you want your extension to be unloadable, put that logic here.
	pass