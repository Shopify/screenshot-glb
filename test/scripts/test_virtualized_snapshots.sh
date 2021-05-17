#!/bin/bash

docker build -t test_snapshot test/images/.

# 70% CPU efficiency to slow down the headless browser
docker run --cpu-quota=70000 -d -v $(pwd):/app --name snapshot_container -it test_snapshot:latest /bin/bash
docker exec -w /app snapshot_container "yarn"
docker exec -w /app snapshot_container "./test/scripts/race_test.sh"
docker stop $(docker ps -a -q)
docker container rm snapshot_container