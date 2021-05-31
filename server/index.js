require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const {listDirectory, downloadFile} = require('./fileSystemActions');
const {validatePathExists} = require('./pathValidator');

app.get('/files', validatePathExists, listDirectory);
app.get('/download', validatePathExists, downloadFile);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => console.log('Server listening on port 3000!'));