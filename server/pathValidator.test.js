import { getMockReq, getMockRes } from '@jest-mock/express'

const {getFullPath, validatePath} = require('./pathValidator');
const {config} = require('./config');

config.rootFolder = './test';

const { res, next, mockClear } = getMockRes();


beforeEach(() => {
    mockClear() // can also use clearMockRes()
});

test('Full path is ./test/subPath', () => {
    const fullPath = getFullPath('subPath');
    expect(fullPath).toBe(config.rootFolder + '/subPath');
});

test('Validate path: with a valid path', () => {
    const req = getMockReq({query:{'path':'subFolder'}});
    validatePath(req, res, next);
    expect(req.selectedPath).toBe('./test/subFolder');
    expect(next).toBeCalled();
});

test('Validate path: with invalid characters in path', () => {
    const req = getMockReq({query:{'path':'sub%Folder'}});
    validatePath(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid path'
        }),
    );
    expect(res.status).toHaveBeenCalledWith('404');
    expect(next).toBeCalledTimes(0);
});

test('Validate path: with an invalid path containing ../', () => {
    const req = getMockReq({query:{'path':'../subFolder'}});
    validatePath(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid path'
        }),
    );
    expect(res.status).toHaveBeenCalledWith('404');
    expect(next).toBeCalledTimes(0);
});

test('Validate path: with a missing path', () => {
    const req = getMockReq();
    validatePath(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Expected a path parameter'
        }),
    );
    expect(res.status).toHaveBeenCalledWith('404');
    expect(next).toBeCalledTimes(0);
});

