# sparkmanager
Spark Manager python package

## Installation

```
# Install Python module
# get code
git clone https://github.com/astronomy-commons/sparkmanager.git
cd sparkmanager
# install python package
python -m pip install .

# Install as extension to Jupyter
# copy front end javascript and assets to correct location
jupyter nbextension install sparkmanager --py --sys-prefix
# tell jupyter to load frontend module when starting notebook (js: import sparkmanager/main)
jupyter nbextension enable sparkmanager --py --sys-prefix
# tell jupyter to load backend module when starting server (python: import sparkmanager)
jupyter serverextension enable sparkmanager --py --sys-prefix

# Install as extension to IPython kernel
# tell IPython kernel to load the kernel extension (python: import sparkmanager)
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

## Development

When you make changes, you can update the extension in Jupyter by re-running
```
cd sparkmanager
# installs this extension as a python module
python -m pip install .
```
for changes to the kernel extension or server extension, and by re-runnning
```
cd sparkmanager
# installs this extension as a python module
python -m pip install .
# re-copies notebook extension javascript/assets to the correct location
jupyter nbextension install sparkmanager --py --sys-prefix
```

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
