import {copyFile, rm} from 'fs';

import {FileHandler} from './file-handler';

jest.mock('os', () => {
  return {
    tmpdir: jest.fn(() => '/os-tmp'),
  };
});

jest.mock('fs', () => {
  return {
    rm: jest.fn(),
    copyFile: jest.fn(),
    mkdtempSync: jest.fn((base: string) => `${base}/tmp-folder`),
  };
});

jest.mock('path', () => {
  const path = jest.requireActual('path');

  return {
    ...path,
    resolve: jest.fn((filePath: string) => filePath.replace('.', '/resolved')),
  };
});

afterEach(jest.clearAllMocks);

describe('FileHandler', () => {
  let fileHandler: FileHandler;

  beforeEach(() => {
    fileHandler = new FileHandler();
  });

  it('creates a temp folder', () => {
    expect(fileHandler.fileDirectory).toEqual(
      '/os-tmp/screenshot-glb/tmp-folder',
    );
  });

  it('copies file during add', () => {
    fileHandler.addFile('./some.glb');

    expect(copyFile).toHaveBeenCalledTimes(1);
    expect((copyFile as any as jest.Mock).mock.calls[0][0]).toEqual(
      '/resolved/some.glb',
    );
    expect((copyFile as any as jest.Mock).mock.calls[0][1]).toEqual(
      '/os-tmp/screenshot-glb/tmp-folder/some.glb',
    );
  });

  it('deletes temp folder on stop', () => {
    fileHandler.destroy();

    expect((rm as any as jest.Mock).mock.calls[0][0] as string).toEqual(
      '/os-tmp/screenshot-glb/tmp-folder',
    );
    expect((rm as any as jest.Mock).mock.calls[0][1] as any).toEqual({
      recursive: true,
    });
  });
});
