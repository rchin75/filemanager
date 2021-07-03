/**
 * App configuration.
 * @type {{rootFolder: *}}
 */
module.exports.config = {
    port : process.env.PORT ? parseInt(process.env.PORT) : 3000,
    baseURL: process.env.BASE_URL ? process.env.BASE_URL : null,
    rootFolder : process.env.MANAGED_FOLDER ? process.env.MANAGED_FOLDER : './',
    hostRootFolder : process.env.HOST_MANAGED_FOLDER === 'true',
    // True if the hosted root folder requires the user to be logged in first.
    requireLogin : process.env.REQUIRE_LOGIN === 'true',
    // Just for testing purposes, do not use in production (create users.json instead):
    username: process.env.USERNAME ? process.env.USERNAME : null,
    password: process.env.PASSWORD ? process.env.PASSWORD : null,
    allowedFileTypes : {
        'txt' : 'text/plain',
        'md' : 'text/markdown',
        'html' : 'text/html',
        'css' : 'text/css',
        'jpg' : 'image/jpeg',
        'jpeg' : 'image/jpeg',
        'png' : 'image/jpeg',
        'gif' : 'image/gif',
        'js' : 'text/javascript',
        'csv' : 'text/csv',
        'json' : 'text/json',
        'pdf' : 'application/pdf',
        'doc' : 'application/msword',
        'docx' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xlsx' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'pptx' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'zip' : 'application/zip',
        'mp4' : 'video/mp4',
        'mp3' : 'audio/mpeg'
    }
};
