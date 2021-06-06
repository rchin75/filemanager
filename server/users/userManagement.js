const bcrypt = require('bcryptjs');
const fs = require('fs');

const saltRounds = 10;
const usersFile = './users.json';

/**
 * Adds a user.
 * @param username Username.
 * @param password Password.
 * @return {Promise<void>}
 */
module.exports.addUser = async function(username, password) {

    let users = [];
    if (fs.existsSync(usersFile)) {
        const contents = fs.readFileSync(usersFile);
        users = JSON.parse(contents);
    }

    const hashed = await bcrypt.hash(password, saltRounds);
    const user = getUser(username, users)
    if (user) {
        user.password = hashed;
    } else {
        users.push({
            username,
            password: hashed
        })
    }

    const json = JSON.stringify(users, null, 4);
    fs.writeFileSync(usersFile, json);
}

/**
 * Authenticates the user and gets the user object if valid.
 * @param username
 * @return {Promise<void>}
 */
module.exports.authenticateUser = async function(username, password) {
    if (!fs.existsSync(usersFile)) {
        console.log('No valid users specified! Cannot find users.json. Run server/bin/main.js -add-user to solve this.')
        return null;
    }

    const contents = fs.readFileSync(usersFile);
    const users = JSON.parse(contents.toString());
    const user = getUser(username, users);
    if (!user) {
        console.log('No user with this name exists:' + username);
        return null;
    }

    const success = await bcrypt.compare(password, user.password);
    if (success) {
        return user;
    } else {
        return null;
    }
}

/**
 * Gets the specified user.
 * @param {string} username A username.
 * @param {Object[]} users An array of users.
 * @return {Object}
 */
function getUser(username, users) {
    for (let i=0; i<users.length; i++) {
        if (users[i].username === username) {
            return users[i];
        }
    }
    return null;
}