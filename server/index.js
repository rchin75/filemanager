require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const {listDirectory, downloadFile} = require('./fileSystemActions');
const {validatePathExists} = require('./pathValidator');
const {config} = require('./config');

const {passport, isLoggedIn} = require('./authentication');

app.use(express.json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.post('/login',
    passport.authenticate('local', {  }),
    function(req, res) {
        //res.redirect('/');
        res.json({user: req.user});
    }
);

app.post('/logout', function(req, res){
    req.logout();
    res.json({user: null});
});

app.get('/files', isLoggedIn, validatePathExists, listDirectory);
app.get('/download', isLoggedIn, validatePathExists, downloadFile);

if (config.hostRootFolder) {
    app.use(express.static(path.join(__dirname, '../' + config.rootFolder)));
} else {
    app.use(express.static(path.join(__dirname, 'public')));
}

app.listen(3000, () => console.log('Server listening on port 3000!'));