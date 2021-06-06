const path = require('path');
const prompt = require('prompt');
const {addUser} = require('../users/userManagement');

const args = process.argv.slice(2);
const appPath = path.join(__dirname, '../index');

// Configure Prompt.
const properties = [
    {
        name: 'username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username must be only letters, spaces, or dashes'
    },
    {
        name: 'password',
        hidden: true
    }
];
function onErr(err) {
    console.log(err);
    return 1;
}

if (args.length === 0) {
    // node server/bin/main.js
    require(appPath);
} else {
    switch (args[0]) {
        case '-add-user': {
            // node server/bin/main.js -add-user
            prompt.start();
            prompt.get(properties, function (err, result) {
                if (err) { return onErr(err); }
                addUser(result.username, result.password).then(()=> {
                    console.log('User added to users.json.')
                });
            });
            break;
        }
        default:
            // node server/bin/main.js
            require(appPath);
    }
}


