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
 * Validates a filename or foldername.
 * @param filename Filename
 * @return {boolean}
 */
function validateFilename(filename) {
    const invalidCharacters = /[`!@#$%^&*()+={};':"\\|,<>?~]/;
    if (!filename || (filename.length < 1)) {
        return false;
    } else if (invalidCharacters.test(filename)) {
        return false;
    } else if ((filename.indexOf('/') !== -1) || (filename.indexOf('..') !== -1)) {
        return false;
    } else if ((filename.startsWith(' ')) || (filename.endsWith(' ')) || (filename.startsWith('.'))) {
        return false;
    }
    return true;
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

/**
 * Saves a text file.
 * @param req Request.
 * @param res Response.
 */
module.exports.saveFile = function(req, res) {
    const filePath = req.selectedPath;
    if (req.body && req.body.contents) {
        fs.writeFileSync(filePath, req.body.contents);
        res.json({saved:true});
    } else {
        res.status(400).json({error:'Cannot save text file. Invalid file contents'})
    }
}

/**
 * Creates a text file.
 * @param req Request.
 * @param res Response.
 */
module.exports.createFile = function(req, res) {
    const filePath = req.selectedPath;
    const filename = req.body.filename;
    const type = resolveFileType(filename);
    if (type === null) {
        res.status(400).json({error: 'Invalid file type.'});
        return;
    } else if (!validateFilename(filename)) {
        res.status(400).json({error: 'Invalid filename.'});
        return;
    }

    const file = path.join(filePath, filename);
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '');
        res.json({saved:true});
    } else {
        res.status(400).json({error: 'File already exists.'});
    }
}

/**
 * Creates a folder.
 * @param req Request.
 * @param res Response.
 */
module.exports.createFolder = function(req, res) {
    const filePath = req.selectedPath;
    const folderName = req.body.folderName;

    if (!validateFilename(folderName)) {
        res.status(400).json({error: 'Invalid folder name.'});
    }

    const folder = path.join(filePath, folderName);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
        res.json({saved:true});
    } else {
        res.status(400).json({error: 'Folder already exists.'});
    }
}

/**
 * Deletes a file or folder.
 * @param req Request.
 * @param res Response.
 */
module.exports.deleteFile = function(req, res) {
    const filePath = req.selectedPath;
    const stat = fs.statSync(filePath);

    try {
        if (stat.isFile()) {
            // Note: nodejs 12 does not have fs.rmSync.
            fs.unlinkSync(filePath);
            res.json({deleted: filePath});
        } else if (stat.isDirectory()) {
            fs.rmdirSync(filePath);
            res.json({deleted: filePath});
        }
    } catch (ex) {
        console.log('Failed to delete file or folder', ex);
        res.status('400').json({error: 'Failed to delete file or folder'});
    }
}

/**
 * Uploads a file.
 * @param req Request.
 * @param res Response.
 */
module.exports.uploadFile = function(req, res) {
    // The target folder.
    const folderPath = req.selectedPath;

    // see: https://github.com/richardgirges/express-fileupload/tree/master/example#basic-file-upload

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({error: 'No files were uploaded.'});
    }

    const theFile = req.files.theFile;

    // Only upload allowed file types.
    if (!resolveFileType(theFile.name)) {
        return res.status(400).json({error: 'Invalid file type.'});
    }

    const uploadPath = path.join(folderPath , theFile.name);
    if (fs.existsSync(uploadPath)) {
        return res.status(400).json({error: 'File already exists.'});
    }

    // Use the mv() method to place the file somewhere on the server
    theFile.mv(uploadPath, function(err) {
        if (err) {
            return res.status(500).json({error: err});
        }
        res.json({result: 'File uploaded!'});
    });

}

/**
 * Renames a file.
 * @param req Request.
 * @param res Response.
 */
module.exports.renameFile = function(req, res) {
    // The target file.
    const filePath = req.selectedPath;
    const oldName = filePath.split('/').pop();
    const newName = req.body.newName;
    const folderPath = filePath.substring(0, filePath.length - oldName.length);
    const stat = fs.statSync(filePath);
    const isFile = stat.isFile();

    // First validate the new file name.
    if (!validateFilename(newName)) {
        return res.status(400).json({error: 'Invalid new filename.'});
    } else if (oldName === newName) {
        return res.status(400).json({error: 'No new file name provided.'})
    } else if (isFile && !resolveFileType(newName)) {
        return res.status(400).json({error: 'Invalid new filename extension.'});
    }

    fs.renameSync(filePath, folderPath + newName);
    res.json({result: newName});

}