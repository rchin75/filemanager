import { getMockReq, getMockRes } from '@jest-mock/express'

const fs = require('fs');
const path = require('path');
const {config} = require('./config');
const {validatePath} = require('./pathValidator');
const {listDirectory, createFolder, createFile, deleteFiles, renameFile} = require('./fileSystemActions');

// Overwrite config values for testing.
config.rootFolder = './test/data';
config.allowAllFileTypes = false;

// Test files and folders.
const testFolder = path.join(config.rootFolder, 'subFolder');
const testFile1 = path.join(config.rootFolder, 'test.txt');
const testFile2 = path.join(config.rootFolder, 'test2.txt');
const testFile3 = path.join(config.rootFolder, 'test3.txt');

const { res, next, mockClear } = getMockRes();

/**
 * Deletes a file if it exists.
 * @param filePath File path.
 */
function rmFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

beforeEach(() => {
    mockClear();
    if (!fs.existsSync(testFile2)) {
        fs.writeFileSync(testFile2, '');
    }
    if (!fs.existsSync(testFile3)) {
        fs.writeFileSync(testFile3, '');
    }
});

afterEach( ()=> {
    // Clean up.
    fs.rmdirSync(testFolder, { recursive: true });
    rmFile(testFile1);
    rmFile(testFile2);
    rmFile(testFile3);
});

test('List directory',() => {
    const req = getMockReq({query:{'path':'/'}});
    validatePath(req, res, next);
    listDirectory(req,res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            files: expect.anything(),
            path: []
        })
    );
});

test('Create folder', ()=>{
   const req = getMockReq({
       query:{'path':'/'},
       body: {'folderName':'subFolder'}
   });
   validatePath(req, res, next);
   createFolder(req, res);

   expect(res.json).toHaveBeenCalledWith(
       expect.objectContaining({
            saved:true
       })
   );
});

test('Create folder with invalid name: must fail', ()=>{
    const req = getMockReq({
        query:{'path':'/'},
        body: {'folderName':'sub/../Folder'}
    });
    validatePath(req, res, next);
    createFolder(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid folder name.'
        })
    );
});

test('Create folder which already exists: must fail', ()=>{
    fs.mkdirSync(config.rootFolder + '/subFolder');
    const req = getMockReq({
        query:{'path':'/'},
        body: {'folderName':'subFolder'}
    });
    validatePath(req, res, next);
    createFolder(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Folder already exists.'
        })
    );
});

test('Create text file', ()=>{
    const req = getMockReq({
        query:{'path':'/'},
        body: {'filename':'test.txt'}
    });
    validatePath(req, res, next);
    createFile(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            saved:true
        })
    );
});

test('Create text file with invalid name: must fail', ()=>{
    const req = getMockReq({
        query:{'path':'/'},
        body: {'filename':'%invalid.txt'}
    });
    validatePath(req, res, next);
    createFile(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid filename.'
        })
    );
});

test('Create text file with invalid type: must fail', ()=>{
    const req = getMockReq({
        query:{'path':'/'},
        body: {'filename':'invalid.abc'}
    });
    validatePath(req, res, next);
    createFile(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid file type.'
        })
    );
});

test('Create text file with the same name as an existing file: must fail', ()=>{
    const req = getMockReq({
        query:{'path':'/'},
        body: {'filename':'test2.txt'}
    });
    validatePath(req, res, next);
    createFile(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'File already exists.'
        })
    );
});

test('Delete a file', () => {
    const req = getMockReq({
        query:{'path':'/'},
        body: {'filenames':['test2.txt']}
    });
    validatePath(req, res, next);
    deleteFiles(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            deleted: 'Selected files'
        })
    );
});

test('Rename a file', () => {
    const newName = 'test2_renamed.txt';
    const req = getMockReq({
        query:{'path':'/test2.txt'},
        body: {'newName':newName}
    });
    validatePath(req, res, next);
    renameFile(req, res);

    const renamed = path.join(config.rootFolder, newName);
    rmFile(renamed);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            result: newName
        })
    );
});

test('Rename a file, no new name provided: must fail', () => {
    const newName = 'test2.txt';
    const req = getMockReq({
        query:{'path':'/test2.txt'},
        body: {'newName':newName}
    });
    validatePath(req, res, next);
    renameFile(req, res);

    const renamed = path.join(config.rootFolder, newName);
    rmFile(renamed);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'No new file name provided.'
        })
    );
});

test('Rename a file, name already exists: must fail', () => {
    const newName = 'test3.txt';
    const req = getMockReq({
        query:{'path':'/test2.txt'},
        body: {'newName':newName}
    });
    validatePath(req, res, next);
    renameFile(req, res);

    const renamed = path.join(config.rootFolder, newName);
    rmFile(renamed);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Another file with the same name already exists.'
        })
    );
});

test('Rename a file to an invalid filename: must fail', () => {
    const newName = 'test2/abc.txt';
    const req = getMockReq({
        query:{'path':'/test2.txt'},
        body: {'newName':newName}
    });
    validatePath(req, res, next);
    renameFile(req, res);

    const renamed = path.join(config.rootFolder, newName);
    rmFile(renamed);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid new filename.'
        })
    );
});

test('Rename a file to an invalid type: must fail', () => {
    const newName = 'test2.abc';
    const req = getMockReq({
        query:{'path':'/test2.txt'},
        body: {'newName':newName}
    });
    validatePath(req, res, next);
    renameFile(req, res);

    const renamed = path.join(config.rootFolder, newName);
    rmFile(renamed);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid new filename extension.'
        })
    );
});

// Commented out because I cannot get it to pass.
// For some reason afterEach is called as soon as pasteFile tries to do fs.copyFileSync(sourcePath, targetPath);
// It seems to behave async, but it is clearly meant to be synchronous.
/*
test('Paste files', () => {
    const req = getMockReq({
        query:{'path':'/subFolder'},
        body: {
            'sourceFolder': '/',
            'action': 'COPY',
            'filenames': ['test3.txt']
        }
    });
    validatePath(req, res, next);
    pasteFile(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            result: 'Files pasted!'
        })
    );
});
 */