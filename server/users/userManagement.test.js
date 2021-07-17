const {setUsersFile, addUser, authenticateUser} = require('./userManagement');
const fs = require('fs');

const usersFile = './test/users.json';
setUsersFile(usersFile);

afterAll(() => {
    if (fs.existsSync(usersFile)) {
        fs.unlinkSync(usersFile);
    }
});

test('Add user', async () => {
    await addUser('test','test');
    expect.anything();
});

// Note: The following tests require 'Add user' to have succeeded.

test('Authenticate user', async () => {
    const result = await authenticateUser('test', 'test');
    expect(result.username).toBe('test');
});

test('Authenticate user - wrong password: must fail', async () => {
    const result = await authenticateUser('test', 'xyz');
    expect(result).toBe(null);
});

test('Authenticate user - wrong username: must fail', async () => {
    const result = await authenticateUser('nobody', 'test');
    expect(result).toBe(null);
});