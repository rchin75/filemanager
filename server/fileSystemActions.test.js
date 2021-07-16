import { getMockReq, getMockRes } from '@jest-mock/express'

const fs = require('fs');
const {config} = require('./config');
const {validatePath} = require('./pathValidator');
const {listDirectory, createFolder, createFile} = require('./fileSystemActions');

config.rootFolder = './test/data';
const testFolder = config.rootFolder + '/subFolder';
const testFile1 = config.rootFolder + '/test.txt';

const { res, next, mockClear } = getMockRes();

beforeEach(() => {
    mockClear() // can also use clearMockRes()
});

afterEach( ()=> {
    // Clean up.
    fs.rmdirSync(testFolder, { recursive: true });
    if (fs.existsSync(testFile1)) {
        fs.unlinkSync(testFile1);
    }
});

test('List directory',() => {
    const req = getMockReq({query:{'path':'/'}});
    validatePath(req,res,next);
    listDirectory(req,res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            files: [{
                "name": expect.any(String),
                "type": expect.any(String),
                "size": expect.any(Number),
                "accessed": expect.anything(),
                "changed": expect.anything(),
                "created": expect.anything(),
                "updated": expect.anything(),
                "owner": expect.any(Number)
            }],
            path: []
        })
    );
});

test('Create folder', ()=>{
   const req = getMockReq({
       query:{'path':'/'},
       body: {'folderName':'subFolder'}
   });
   validatePath(req,res,next);
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
    validatePath(req,res,next);
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
    validatePath(req,res,next);
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
    validatePath(req,res,next);
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
    validatePath(req,res,next);
    createFile(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid filename.'
        })
    );
});