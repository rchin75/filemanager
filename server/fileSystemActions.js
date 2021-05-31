const path = require('path');
const fs = require('fs');
const {config} = require('./config');

console.log('Managed folder = ' + config.rootFolder);

/**
 * Resolves the file type from the filename.
 * @param {string} file The filename.
 * @returns {null|*} The file type.
 */
function resolveFileType(file) {
    const extension = file.split('.').pop();
    if (Object.prototype.hasOwnProperty.call(config.allowedFileTypes, extension)) {
        return config.allowedFileTypes[extension];
    }
    return null;
}

/**
 * Resolves the path.
 * @param {string} currentDir Current directory (full path on the disk).
 * @returns {string[]} The path array.
 */
function resolvePath(currentDir) {
    const folderPath = currentDir.substring(config.rootFolder.length);
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
 * Lists a directory contents.
 * @param req Request.
 * @param res Response.
 */
module.exports.listDirectory = function(req, res) {
    const currentDir = req.selectedPath;

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
 * @param req Request.
 * @param res Response.
 */
module.exports.downloadFile = function(req, res) {
    const filePath = req.selectedPath;

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