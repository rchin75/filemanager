# Docker Howto #

This is a short description of how to run the filemanager using docker.
This requires docker to be installed on your machine.

First make sure the frontend is build:

```
nom install
npm run build
```

Create the docker image:

```
docker build . -t rchin75/filemanager
```

List docker images:

```
docker images
```

Run the docker image:

```
docker run -p 3001:3000 -d rchin75/filemanager
```

Check if it's running:

```
docker ps
```

Login to the running container's terminal:

```
docker exec -it [container-id] /bin/bash
```

Stop the container:

```
docker stop [container-id]
```

Clean up stopped containers:

```
docker system prune
```