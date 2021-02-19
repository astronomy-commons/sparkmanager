docker build . -t sparkmanager:test
docker run --name sparkmanager-test -p 8888:8888 \
    -v $PWD/..:/home/jovyan \
    sparkmanager:test
docker container rm sparkmanager-test