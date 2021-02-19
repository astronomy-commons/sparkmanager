FROM jupyter/all-spark-notebook:6d42503c684f

USER $NB_USER
RUN python -m pip install jupyter-server-proxy

USER root
COPY sparkmanager /home/jovyan/work/sparkmanager/sparkmanager
COPY setup.py /home/jovyan/work/sparkmanager
RUN chown -R $NB_USER:$NB_GID /home/jovyan/work/sparkmanager

USER $NB_USER
RUN cd work/sparkmanager \
 && python -m pip install . 
    # jupyter-server-proxy

# ENV IPYTHONDIR /home/jovyan/.ipython

RUN jupyter nbextension install sparkmanager --py --sys-prefix \
 && jupyter nbextension enable sparkmanager --py --sys-prefix
#  && jupyter serverextension enable sparkmanager --py --sys-prefix \
#  && ipython profile create && echo "c.InteractiveShellApp.extensions.append('sparkmanager.kernelextension')" >>  $(ipython profile locate default)/ipython_kernel_config.py

# RUN jupyter nbextension list 
#  && jupyter serverextension list

COPY local_cluster /home/jovyan/.sparkmanager/clusters/Local/.
COPY kube_cluster /home/jovyan/.sparkmanager/clusters/AWS/.
