import http from 'http';
import fs from 'fs';
import path from 'path';
import {AddressInfo} from 'net';

const createFileServer = (mountDirectory) => {
  return http.createServer((request, response) => {
    const normalizedFilePath = path
      .normalize(request.url)
      .replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.join(mountDirectory, normalizedFilePath);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.glb': 'application/gltf-binary',
      '.js': 'application/javascript',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';
    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    };

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code == 'ENOENT') {
          response.writeHead(404, headers);
          response.end('File not found', 'utf-8');
        } else {
          response.writeHead(500);
          response.end(
            'Sorry, check with the site admin for error: ' +
              error.code +
              ' ..\n',
          );
        }
      } else {
        response.writeHead(200, headers);
        response.end(content, 'utf-8');
      }
    });
  });
};

export class FileServer {
  port: number;
  mountDirectory: string;
  private server: http.Server;

  constructor(mountDirectory: string) {
    this.mountDirectory = mountDirectory;
    this.server = null;
  }

  async start() {
    const server = createFileServer(this.mountDirectory);

    return new Promise<number>((resolve) => {
      server.listen(0, () => {
        resolve((server.address() as AddressInfo).port);
      });
    }).then((port) => {
      this.port = port;
      this.server = server;
    });
  }

  async stop() {
    return new Promise<void>((resolve) => {
      this.server.close(() => {
        resolve();
      });
    }).then(() => {
      this.server = null;
      this.port = null;
    });
  }
}
