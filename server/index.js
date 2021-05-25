const express = require('express');
const app = express();
const path = require('path');
const fileSystemActions = require('./fileSystemActions');

app.get('/files', fileSystemActions.listDirectory);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => console.log('Server listening on port 3000!'));