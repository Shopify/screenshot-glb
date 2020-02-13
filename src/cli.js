#!/usr/bin/env node

const path = require('path');
const { performance } = require('perf_hooks');
var fs = require('fs');

const FileServer = require('./file-server');

const startBrowser = require('./start-browser')
const loadGLBAndScreenshot = require('./load-glb-and-screenshot');

const argv = require('yargs')
  .alias('i', 'input')
  .alias('o', 'output')
  .alias('w', 'width')
  .alias('h', 'height')
  .alias('f', 'image_format')
  .alias('q', 'image_quality')
  .count('verbose')
  .alias('v', 'verbose')
  .describe('i', 'Input glTF 2.0 binary (GLB) filepath')
  .describe('o', 'Output PNG screenshot filepath')
  .describe('w', 'Output image width')
  .describe('h', 'Output image height')
  .describe('f', 'Output image format (defaults to \'image/png\')')
  .describe('q', 'Quality of the output image (defaults to 0.92)')
  .describe('v', 'Enable verbose logging')
  .demandOption(['i', 'o'])
  .argv;

const VERBOSE_LEVEL = argv.verbose;

function INFO() { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments); }

const timeDelta = (start, end) => {
  return ((end - start) / 1000).toPrecision(3);
}

function copyModelViewer(){
  const dir = path.resolve(__dirname, '../lib');

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  fs.copyFile(path.resolve(__dirname, '../node_modules/@google/model-viewer/dist/model-viewer.js'), 
    path.resolve(__dirname, '../lib/model-viewer.js'), (err) => {
      if (err) throw err;
  });
}


(async () => {
  copyModelViewer()

  const t0 = performance.now();
  const libServer = new FileServer(path.resolve(__dirname, '../lib'))
  const modelServer = new FileServer(path.dirname(argv.input))

  await libServer.start()
  await modelServer.start()

  const t1 = performance.now();
  INFO("--- Started local file servers", `(${timeDelta(t0, t1)} s)`);

  const glbPath = `http://localhost:${modelServer.port}/${path.basename(argv.input)}`;

  const width = argv.width || 1024;
  const height = argv.height || 1024;
  const format = argv.image_format || 'image/png';
  const quality = argv.image_quality || 0.92;

  const {page, browser} = await startBrowser({width, height, libPort: libServer.port});

  const t2 = performance.now();
  INFO("--- Started puppeteer browser", `(${timeDelta(t1, t2)} s)`);

  await loadGLBAndScreenshot(page, {
    glbPath,
    outputPath: argv.output,
    format,
    quality,
  });

  const t3 = performance.now();
  INFO("--- Took snapshot of", argv.input, `(${timeDelta(t2, t3)} s)`);

  await browser.close();
  await libServer.stop();
  await modelServer.stop();

  const t4 = performance.now();
  INFO("--- Stopped local file servers", `(${timeDelta(t3, t4)} s)`);
  INFO("--- DONE");
})()
