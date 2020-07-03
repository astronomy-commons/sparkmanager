# sparkmanager
Spark Manager python package

## installation

```
# get code
git clone https://github.com/stevenstetzler/sparkmanager.git
cd sparkmanager
# install python package
python -m pip install .
# add frontend javascript files to jupyter extension
jupyter nbextension install sparkmanager --py --sys-prefix
# tell jupyter to load frontend module when starting notebook
jupyter nbextension enable sparkmanager --py --sys-prefix
# tell jupyter to load backend module when starting server
jupyter serverextension enable sparkmanager --py --sys-prefix
# tell IPython kernel to load the kernel extension
ipython profile create && echo "c.InteractiveShellApp.extensions.append('sparkmanager.kernelextension')" >>  $(ipython profile locate default)/ipython_kernel_config.py
```

To find configuration paths for Jupyter, use the command
```
jupyter --paths
```
Use the command
```
ipython --debug -c 'exit()'
```
to find configuration paths for the IPython kernel.

## Docker

You can build a docker image to test the extension with
```
docker build . -t sparkmanager
```
See the `Dockerfile` for the build instructions.

Run the docker image with
```
docker run -p 8888:8888 sparkmanager
```
