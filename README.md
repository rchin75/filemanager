# filemanager

Playing with Vue JS, Framework7 and Node JS to make an online file manager.

This file manager runs as a NodeJS web app and is accessible through a web browser.

## Features ##
- Specify a local root folder to manage (config parameter)
- Browse files and folders
- Upload and download files
- Create new text files (txt, html, css, js, md, csv)
- Create sub-folders
- Rename files and folders
- Delete selected files and folders
- Copy-Cut-Paste files and folders
- Preview text files, images, and webpages (html files).
- Edit text files with a build-in editor.
- Host the root folder as static content
- Password protection and (very) basic user management

## Disclaimers ## 
- This is not a product, just me playing around.
- Use at your own risk. This software comes without any warranties whatsoever.
- Running the filemanager means that its server will access your file system.
This includes its ability to add, permanently delete, and modify files & folders.
- This software may have bugs and security flaws.
- This software was only tested on a Mac, no idea if it behaves the same on e.g. Windows or Linux.

---

To run make sure you run both the frontend and the server.

## Project setup
```
npm install
```
### Compiles and hot-reloads for development
This will run the frontend for development. Make sure the server is also running.
```
npm run serve
```
### Run server
This will run the backend, and the compiled frontend build in the /dist folder.
By default, the server runs on port 3000. You can change this by specifying PORT in a .env file.
```
npm run server
```
### Compiles and minifies for production
This will create the compiled frontend build in the /dist folder.
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Create an executable version ###
This will create and executable version in /dist-server.
This executable contains both the server and the compiled frontend in the /dist folder.
Make sure to run npm run build first, if you want the latest frontend to be included.

Note that currently only an executable will be created for a Mac.

To run the executable make sure to add a .env file with config settings in the same folder.
```
npm run pkg
```
This will create an executable called 'filemanager'.
Simply run it from a terminal by entering ./filemanager.
Please note that a .env file and users.json are required to configure the app. See below.

### About the .env file ###
A .env file is required to specify customized configuration parameters.
Example of a .env file's contents:
```
# The port on which the server should run. Default is 3000.
PORT=3000

# The folder on the server that should be made shown and managed in the browser (inlc sub-folders).
# If not specified the current folder will be used. 
# It is highly recommended to specify another folder than the app's current folder.
MANAGED_FOLDER=./folder_with_the_files_to_manage

# If true then the managed folder will also be hosted as static content.
HOST_MANAGED_FOLDER=true

# Additional settings for then hosting the managed folder:

# True if the content in the hosted managed folder should be password protected.
REQUIRE_LOGIN=true

# The base URL is used to link to static content in the hosted managed folder.
BASE_URL=http://localhost:3000
```

### About adding and managing user accounts ###
Before you can login to this app, you need to add user accounts.

To add a user run this from the project's root folder:
```
node server/bin/main.js -add-user
```
This will create a file 'users.json' in the root folder, which contains users and their hashed passwords.

When using the executable version the same can be achieved by running:
```
./filemanager -add-user
```


### Customize Vue JS configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
