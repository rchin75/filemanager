/**
 * App configuration.
 * @type {{rootFolder: *}}
 */
module.exports.config = {
    port : process.env.PORT ? parseInt(process.env.PORT) : 3000,
    rootFolder : process.env.MANAGED_FOLDER ? process.env.MANAGED_FOLDER : './',
    hostRootFolder : process.env.HOST_MANAGED_FOLDER === 'true',
    // Just for testing purposes, do not use in production (create users.json instead):
    username: process.env.USERNAME ? process.env.USERNAME : null,
    password: process.env.PASSWORD ? process.env.PASSWORD : null,
    allowedFileTypes : {
        'txt' : 'text/plain',
        'md' : 'text/markdown',
        'html' : 'text/html',
        'jpg' : 'image/jpeg',
        'jpeg' : 'image/jpeg',
        'png' : 'image/jpeg',
        'gif' : 'image/gif',
        'js' : 'text/javascript',
        'csv' : 'text/csv',
        'json' : 'text/json',
        'pdf' : 'application/pdf',
        'doc' : 'application/msword',
    }
};
