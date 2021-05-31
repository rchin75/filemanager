const fs = require('fs');
const rootFolder = process.env.MANAGED_FOLDER ? process.env.MANAGED_FOLDER : './';

/**
 * Validates the provided path (req.query.path).
 * @param req
 * @param res
 * @param next
 */
module.exports.validatePath = function(req, res, next) {
    validate(req, res, next, false);
}

module.exports.validatePathExists = function(req, res, next) {
    validate(req, res, next, true);
}

/**
 * Validates the provided path (req.query.path).
 * @param req
 * @param res
 * @param next
 */
function validate(req, res, next, mustExist) {
    const path = req.query.path;
    if (!path) {
        res.status('404').json({error: 'Expected a path parameter'});
    } else if ((path.indexOf('..') !== -1) || (path.indexOf('./') !== -1) || (path.indexOf('\\') !== -1)) {
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
 * @return {null} Full path or null.
 */
function getFullPath(subPath) {
    let fullPath = null;
    if (subPath) {
        let folderPath = subPath;
        if (!folderPath.startsWith('/')) {
            folderPath = '/' + folderPath;
        }
        fullPath = rootFolder + folderPath;
    }
    return fullPath;
}