/**
 * App configuration.
 * @type {{rootFolder: *}}
 */
module.exports.config = {
    rootFolder : process.env.MANAGED_FOLDER ? process.env.MANAGED_FOLDER : './',
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
