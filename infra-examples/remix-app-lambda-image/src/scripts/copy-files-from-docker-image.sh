#!/bin/bash
rm -rf public && 
echo "imageUri: $1"
docker rm -f temp-container 2> /dev/null
docker create --name temp-container $1
docker cp temp-container:/var/task/deployed-workspace/public ./public
docker rm -f temp-container
echo "copy successful."