#!/usr/bin/env node

const path = require('path');

const createFileServer = require('./create-file-server');
const startBrowser = require('./start-browser')
const loadGLBAndScreenshot = require('./load-glb-and-screenshot');

const MODEL_SERVER_PORT = 8125;
const LIB_SERVER_PORT = 8126;

const argv = require('yargs')
  .alias('i', 'input')
  .alias('o', 'output')
  .alias('w', 'width')
  .alias('h', 'height')
  .describe('i', 'Input glTF 2.0 binary (GLB) filepath')
  .describe('o', 'Output PNG screenshot filepath')
  .describe('w', 'Output image width')
  .describe('h', 'Output image height')
  .demandOption(['i', 'o'])
  .argv;

const serveFolder = (path, port) => {
  const server = createFileServer(path);
  server.listen(port);
  return server;
};

(async () => {
  const glbPath = `http://localhost:${MODEL_SERVER_PORT}/${path.basename(argv.input)}`;
  const libServer = serveFolder(path.resolve(__dirname, '../lib'), LIB_SERVER_PORT);
  const modelServer = serveFolder(path.dirname(argv.input), MODEL_SERVER_PORT);

  const width = argv.width || 1024;
  const height = argv.height || 1024;

  const {page, browser} = await startBrowser({width, height, libPort: LIB_SERVER_PORT});

  await loadGLBAndScreenshot(page, glbPath, argv.output);

  await browser.close();

  libServer.close();
  modelServer.close();
})()
