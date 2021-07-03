require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
const {listDirectory, downloadFile, saveFile, createFile, createFolder, deleteFile, uploadFile, renameFile, pasteFile} = require('./fileSystemActions');
const {validatePathExists} = require('./pathValidator');
const {config} = require('./config');

const {passport, isLoggedIn, getUser} = require('./authentication');

app.use(fileUpload());
app.use(express.json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Authentication actions.
app.post('/api/login',
    passport.authenticate('local', {  }),
    function(req, res) {
        res.json({user: req.user});
    }
);

app.post('/api/logout', function(req, res){
    req.logout();
    res.json({user: null});
});

app.get('/api/user', isLoggedIn, getUser);

// System settings.
app.get('/api/settings', (req,res) => {
    res.json({
        'baseURL': config.baseURL,
        'hostRootFolder': config.hostRootFolder
    });
})

// File actions.
app.get('/api/files', isLoggedIn, validatePathExists, listDirectory);
app.get('/api/download', isLoggedIn, validatePathExists, downloadFile);
app.post('/api/save', isLoggedIn, validatePathExists, saveFile);
app.post('/api/create', isLoggedIn, validatePathExists, createFile);
app.post('/api/createFolder', isLoggedIn, validatePathExists, createFolder);
app.delete('/api/delete', isLoggedIn, validatePathExists, deleteFile);
app.post('/api/upload', isLoggedIn, validatePathExists, uploadFile);
app.post('/api/rename', isLoggedIn, validatePathExists, renameFile);
app.post('/api/paste', isLoggedIn, validatePathExists, pasteFile);

app.use(express.static(path.join(__dirname, '../dist')));

if (config.hostRootFolder) {
    if (config.requireLogin) {
        app.use('/public', isLoggedIn, express.static(config.rootFolder));
        console.log('Hosting: ' + config.rootFolder + ' as /public (secured).');
    } else {
        app.use('/public', express.static(config.rootFolder));
        console.log('Hosting: ' + config.rootFolder + ' as /public. (not secured)');
    }
}

app.listen(config.port, () => console.log('Server listening on port ' + config.port + '!'));