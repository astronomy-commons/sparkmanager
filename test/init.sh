cd ~
python -m pip install -e .
jupyter nbextension install --sys-prefix --py sparkmanager
jupyter nbextension enable --sys-prefix --py sparkmanager
mkdir -p .sparkmanager
# ln -s $HOME/test/clusters .sparkmanager/clusters