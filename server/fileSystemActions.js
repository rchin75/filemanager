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
    // A filename must be at least one character and not start with a dot (hidden files).
    if ((file.length < 1) || (file.indexOf('.') === 0)){
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(config.allowedFileTypes, extension)) {
        // A valid file type was found.
        return config.allowedFileTypes[extension];
    } else if (config.allowAllFileTypes) {
        // For all unknown filetypes we assume octet-stream.
        // Hidden files will not be allowed (starting with a dot).
        return 'application/octet-stream';
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
    const embedded = req.query.embedded === 'true';

    // Determine the headers
    const stat = fs.statSync(filePath);
    const file = filePath.split('/').pop();
    const type = resolveFileType(file);
    if (type === null) {
        // This happens when the file type is not supported, see allowedFileTypes.
        res.status(404).send({error : 'Invalid file path'});
        return;
    }
    if (!embedded) {
        res.set({
            'Content-Type': type,
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="' + file +'";'
        })
    } else {
        res.set({
            'Content-Type': type,
            'Content-Length': stat.size,
            'Content-Disposition': 'inline'
        })
    }

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
 * Deletes multiple files or folders.
 * @param req Request.
 * @param res Response.
 */
module.exports.deleteFiles = function(req, res) {
    const folderPath = req.selectedPath;
    const filenames = req.body.filenames;
    try {
        filenames.forEach(filename => {
            if (validateFilename(filename)) {
                const filePath = path.join(folderPath, filename);
                const stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    // Note: nodejs 12 does not have fs.rmSync.
                    fs.unlinkSync(filePath);
                } else if (stat.isDirectory()) {
                    fs.rmdirSync(filePath, { recursive: true });
                }  
            }
        });
        res.json({deleted: 'Selected files'});
    } catch (ex) {
        console.log('Failed to delete files or folders', ex);
        res.status('400').json({error: 'Failed to delete files or folders'});
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

/**
 * Moves or copies a file.
 * @param req Request.
 * @param res Response.
 */
module.exports.pasteFile = function(req, res) {
    const targetFolder = req.selectedPath;
    let sourceFolder = req.body.sourceFolder;
    const action = req.body.action;
    const filenames = req.body.filenames;

    if (!filenames || filenames.length === 0) {
        return res.status('400').json({error: 'No files to paste'});
    }

    // Validate the source folder.
    // This contains duplicate code from pathValidator. Needs optimization later.
    const invalidCharacters = /[`!@#$%^&*()+={};':"\\|,<>?~]/;
    if ((!sourceFolder) || (sourceFolder.indexOf('..') !== -1) || (sourceFolder.indexOf('./') !== -1) || (sourceFolder.indexOf('\\') !== -1)) {
        return res.status('404').json({error: 'Invalid source folder'});
    } else if (invalidCharacters.test(sourceFolder)) {
        return res.status('404').json({error: 'Invalid source folder'});
    }
    sourceFolder = path.join(config.rootFolder , sourceFolder);
    if (!fs.existsSync(sourceFolder)) {
        return res.status('404').json({error: 'Invalid source folder'});
    }

    const errors = [];
    filenames.forEach(filename => {
        if (validateFilename(filename)) {
            const sourcePath = path.join(sourceFolder, filename);
            const stat = fs.statSync(sourcePath);
            const targetPath = path.join(targetFolder, filename);

            if (fs.existsSync(targetPath)) {
                errors.push(filename);
            }

            if (stat.isFile()) {
                if (action === 'CUT') {
                    fs.copyFileSync(sourcePath, targetPath);
                    fs.unlinkSync(sourcePath);
                } else {
                    fs.copyFileSync(sourcePath, targetPath);
                }
            } else if (stat.isDirectory()) {
                // See below for the implementation of copyFolderSync.
                copyFolderSync(sourcePath, targetPath);
                if (action === 'CUT') {
                    // Delete the original folder.
                    fs.rmdirSync(sourcePath, { recursive: true });
                }
            } else {
                console.log('Invalid file type. Cannot paste: ' + sourcePath);
            }
        }
    });

    if (errors.length > 0) {
        return res.status('400').json({error: 'Could not paste: ' + errors.join(',')});
    }
    res.json({result: 'File pasted!'});
}

/**
 * Copies a folder recursively.
 * @param {string} from Source folder.
 * @param {string} to Target folder.
 */
function copyFolderSync(from, to) {
    // Source: https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to);
    }
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}