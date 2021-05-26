const path = require('path');
const fs = require('fs');

const testFolder = './testFolder';
const rootFolder = testFolder;
let currentDir = testFolder;

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
 * Lists a directory contents.
 * @param req
 * @param res
 */
module.exports.listDirectory = function(req, res) {
    if (req.query.path) {
        let folderPath = req.query.path;
        if (!folderPath.startsWith('/')) {
            folderPath = '/' + folderPath;
        }
        // Validate
        if ((folderPath.indexOf('..') !== -1) || (folderPath.indexOf('./') !== -1)) {
            folderPath = '';
        }
        currentDir = rootFolder + folderPath;
    } else {
        currentDir = rootFolder;
    }

    fs.readdir(currentDir,(err, files) => {
        const filesList = [];
        if (!files) {
            res.send({
                path: [],
                files: [],
                error: 'No files found.'
            });
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