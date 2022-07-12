import os from 'os';
import path from 'path';
import {copyFile as copyFileNode, rm as rmNode, mkdtempSync} from 'fs';
import {promisify} from 'util';

const copyFile = promisify(copyFileNode);
const rm = promisify(rmNode);

export class FileHandler {
  get fileDirectory(): string {
    return this._fileDirectory;
  }

  private _fileDirectory: string;

  constructor() {
    this._fileDirectory = mkdtempSync(path.join(os.tmpdir(), 'screenshot-glb'));
  }

  async addFile(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);
    await copyFile(
      path.resolve(filePath),
      path.join(this._fileDirectory, fileName),
    );
    return fileName;
  }

  async destroy() {
    await rm(this._fileDirectory, {recursive: true});
  }
}
