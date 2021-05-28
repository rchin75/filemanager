const path = require('path');
const fs = require('fs');

console.log('Managed folder = ' + process.env.MANAGED_FOLDER);

const rootFolder = process.env.MANAGED_FOLDER ? process.env.MANAGED_FOLDER : './';
let currentDir = rootFolder;

const allowedFileTypes = {
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

/**
 * Resolves the file type from the filename.
 * @param file The filename.
 * @returns {null|*}
 */
function resolveFileType(file) {
    const extension = file.split('.').pop();
    if (Object.prototype.hasOwnProperty.call(allowedFileTypes, extension)) {
        return allowedFileTypes[extension];
    }
    return null;
}

/**
 * Resolves the path.
 * @param currentDir Current directory (full path on the disk).
 * @returns {string[]}
 */
function resolvePath(currentDir) {
    const folderPath = currentDir.substring(rootFolder.length);
    const elements = folderPath.split('/');
    const resolvedPath = [];
    elements.forEach(element => {
        if (element.trim() !== '') {
            resolvedPath.push(element);
        }
    })
    return resolvedPath;
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
        // Validate
        if ((folderPath.indexOf('..') !== -1) || (folderPath.indexOf('./') !== -1)) {
            folderPath = '';
        }
        fullPath = rootFolder + folderPath;
    }
    return fullPath;
}

/**
 * Lists a directory contents.
 * @param req
 * @param res
 */
module.exports.listDirectory = function(req, res) {
    currentDir = getFullPath(req.query.path);
    if (!currentDir) {
        currentDir = rootFolder;
    }
    if (!fs.existsSync(currentDir)) {
        res.status(404).send({error : 'Invalid path'});
        return;
    }

    fs.readdir(currentDir,(err, files) => {
        const filesList = [];
        if (!files) {
            res.status(404).send({error : 'No files found'});
            return;
        }
        files.forEach(file => {
            const filePath = path.join(currentDir, file);
            const stat = fs.statSync(filePath);

            const fileInfo = {
                name:file,
                size:stat.size,
                created: stat.birthtime, // Creation time.
                updated: stat.mtime, // Updated time: the file was modified.
                accessed: stat.atime, // Accessed time: when it was last accessed.
                changed: stat.ctime, // Changed time: file properties changed.
                owner: stat.uid // User ID
            };

            if (stat.isFile()) {
                fileInfo.type = resolveFileType(file);
                if (fileInfo.type) {
                    filesList.push(fileInfo);
                }
            } else if (stat.isDirectory()) {
                fileInfo.type = 'folder';
                filesList.push(fileInfo);
            } // Ignore files that are no directory or file (symlinks, sockets etc)

        });
        res.send({
            path: resolvePath(currentDir),
            files: filesList
        });
    });
}

/**
 * Downloads a file.
 * @param req
 * @param res
 */
module.exports.downloadFile = function(req, res) {
    const filePath = getFullPath(req.query.path);
    if (!filePath || !fs.existsSync(filePath)) {
        res.status(404).send({error : 'Invalid file path'});
        return;
    }

    // Determine the headers
    const stat = fs.statSync(filePath);
    const file = filePath.split('/').pop();
    const type = resolveFileType(file);
    if (type === null) {
        // This happens when the file type is not supported, see allowedFileTypes.
        res.status(404).send({error : 'Invalid file path'});
        return;
    }
    res.set({
        'Content-Type': type,
        'Content-Length': stat.size,
        'Content-Disposition': 'attachment; filename="' + file +'";'
    })

    // Code snipped from: https://nodejs.org/en/knowledge/advanced/streams/how-to-use-fs-create-read-stream/

    // This line opens the file as a readable stream
    const readStream = fs.createReadStream(filePath);

    // This will wait until we know the readable stream is actually valid before piping
    readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readStream.pipe(res);
    });

    // This catches any errors that happen while creating the readable stream (usually invalid names)
    readStream.on('error', function(err) {
        res.end(err);
    });
}