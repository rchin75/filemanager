/**
 * App configuration.
 * @type {{rootFolder: *}}
 */
module.exports.config = {
    rootFolder : process.env.MANAGED_FOLDER ? process.env.MANAGED_FOLDER : './'
};
