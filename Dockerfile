FROM astronomycommons/ztf-hub-notebook:spark_extension_test

USER root

RUN mkdir -p /opt/sparkmanager \
 && chown -R $NB_UID:$NB_GID /opt/sparkmanager

USER $NB_UID

ENV SPARK_MANAGER_DIR /opt/sparkmanager
RUN git clone https://github.com/stevenstetzler/sparkmanager.git $SPARK_MANAGER_DIR \
 && cd $SPARK_MANAGER_DIR \
 && python -m pip install .

ENV IPYTHONDIR /opt/conda/etc/ipython

RUN jupyter nbextension install sparkmanager --py --sys-prefix \
 && jupyter nbextension enable sparkmanager --py --sys-prefix \
 && jupyter serverextension enable sparkmanager --py --sys-prefix \
 && ipython profile create && echo "c.InteractiveShellApp.extensions.append('sparkmanager.kernelextension')" >>  $(ipython profile locate default)/ipython_kernel_config.py

RUN jupyter nbextension list \
 && jupyter serverextension list

#COPY local_cluster $SPARK_MANAGER_DIR/clusters/Local/.
#COPY kube_cluster $SPARK_MANAGER_DIR/clusters/AWS/.
