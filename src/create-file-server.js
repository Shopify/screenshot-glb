const http = require('http');
const fs = require('fs');
const path = require('path');

module.exports = (mountDirectory) => {
  return http.createServer((request, response) => {
    const filePath = path.join(mountDirectory, request.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.glb': 'application/gltf-binary',
      '.js': 'application/javascript',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if(error.code == 'ENOENT') {
          response.writeHead(404, { 'Content-Type': contentType });
          response.end('File not found', 'utf-8');
        } else {
          response.writeHead(500);
          response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
        }
      } else {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(content, 'utf-8');
      }
    });
  });
}
