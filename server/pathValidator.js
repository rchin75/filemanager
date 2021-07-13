const fs = require('fs');
const {config} = require('./config');

/**
 * Validates the provided path (req.query.path).
 * @param req Request.
 * @param res Response.
 * @param next Next.
 */
module.exports.validatePath = function(req, res, next) {
    validate(req, res, next, false);
}

/**
 * Validates the provided path and checks if it exists.
 * @param req Request.
 * @param res Response.
 * @param next Next.
 */
module.exports.validatePathExists = function(req, res, next) {
    validate(req, res, next, true);
}

/**
 * Gets the full path.
 * @param subPath Sub path.
 * @return {string} The full path.
 */
module.exports.getFullPath = function(subPath){
    return getFullPath(subPath);
}

/**
 * Validates the provided path (req.query.path).
 * @param req Request.
 * @param res Response.
 * @param next Next.
 * @param {boolean} mustExist True if the path must exist.
 */
function validate(req, res, next, mustExist) {
    const path = req.query.path;
    // All the characters we do not allow in a path.
    // Note: spaces, forward slashes, underscores, minuses, and dots are allowed, only not in certain combinations, hence the extra if.
    const invalidCharacters = /[`!@#$%^&*()+={};':"\\|,<>?~]/;
    if (!path) {
        res.status('404').json({error: 'Expected a path parameter'});
    } else if ((path.indexOf('..') !== -1) || (path.indexOf('./') !== -1) || (path.indexOf('\\') !== -1)) {
        res.status('404').json({error: 'Invalid path'});
    } else if (invalidCharacters.test(path)) {
        res.status('404').json({error: 'Invalid path'});
    } else {
        // The valid selected full path is added to the request.
        req.selectedPath = getFullPath(path);
        if (mustExist && !fs.existsSync(req.selectedPath)) {
            res.status('404').json({error: 'Invalid path'});
        } else {
            next();
        }
    }
}

/**
 * Gets the full path.
 * @param {string} subPath A sub path.
 * @return {null|string} Full path or null.
 */
function getFullPath(subPath) {
    let fullPath = null;
    if (subPath) {
        let folderPath = subPath;
        if (!folderPath.startsWith('/')) {
            folderPath = '/' + folderPath;
        }
        fullPath = config.rootFolder + folderPath;
    }
    return fullPath;
}