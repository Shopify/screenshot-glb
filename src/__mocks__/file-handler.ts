import path from 'path';

function FileHandler() {}

FileHandler.prototype = {
  addFile: jest.fn().mockImplementation((filePath: string) => {
    return Promise.resolve(path.basename(filePath));
  }),
  stop: jest.fn(),
};

Object.defineProperty(FileHandler.prototype, 'fileDirectory', {
  get: jest.fn().mockReturnValue('/tmp'),
});

export {FileHandler};
