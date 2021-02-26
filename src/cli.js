#!/usr/bin/env node

const path = require('path');
const { performance } = require('perf_hooks');
const fs = require('fs');

const FileServer = require('./file-server');
const prepareAppOptions = require('./prepare-app-options');
const startBrowser = require('./start-browser')
const screenshot = require('./screenshot');


const argv = require('yargs')
  .alias('i', 'input')
  .alias('o', 'output')
  .alias('c', 'color')
  .alias('w', 'width')
  .alias('h', 'height')
  .alias('f', 'image_format')
  .alias('q', 'image_quality')
  .alias('t', 'timeout')
  .alias('d', 'debug')
  .count('verbose')
  .alias('v', 'verbose')
  .describe('i', 'Input glTF 2.0 binary (GLB) filepath')
  .describe('o', 'Output screenshot filepath')
  .describe('w', 'Output image width')
  .describe('h', 'Output image height')
  .describe('f', 'Output image format (defaults to \'image/png\')')
  .describe('q', 'Quality of the output image (defaults to 0.92)')
  .describe('c', 'Output image background color (defaults to transparent, accepts HEX or RGB)')
  .describe('t', 'Timeout length')
  .describe('v', 'Enable verbose logging')
  .describe('d', 'Enable Debug Mode')
  .demandOption(['i', 'o'])
  .argv;

let DEBUG = false;
let VERBOSE_LEVEL = 0;
if(argv.debug) {
  DEBUG = true;
  VERBOSE_LEVEL = 1;
}else{
  VERBOSE_LEVEL = argv.verbose
}

function INFO() { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments); }

const timeDelta = (start, end) => {
  return ((end - start) / 1000).toPrecision(3);
}

function copyModelViewer(){
  const dir = path.resolve(__dirname, '../lib');

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

  const modelViewerDirectory = path.dirname(path.dirname(require.resolve('@google/model-viewer')));
  const srcFile = path.resolve(modelViewerDirectory, 'dist/model-viewer.js');
  const destFile = path.resolve(__dirname, '../lib/model-viewer.js');  
  
  fs.copyFile(srcFile, destFile, (err) => {
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

  const options = prepareAppOptions({
    libPort: libServer.port,
    modelPort: modelServer.port,
    debug: DEBUG,
    argv,
  });
  const {page, browser} = await startBrowser(options);

  const t2 = performance.now();
  INFO("--- Started puppeteer browser", `(${timeDelta(t1, t2)} s)`);

  page.exposeFunction('logInfo', (message) => {
    INFO(message)
  });

  page.on('console', msg => INFO("--- Console output: ", msg.text()));
  
  let t3 = performance.now();

  process_status = 0;

  try {
    await screenshot(page, options);
    t3 = performance.now();
    INFO("--- Took snapshot of", argv.input, `(${timeDelta(t2, t3)} s)`);
  } catch (err) {
    t3 = performance.now();
    INFO("--- Failed to take snapshot of", argv.input, `(${timeDelta(t2, t3)} s)`);
    INFO("--- Error Info Start")
    INFO(err);
    INFO("--- Error Info End")
    process_status = 1;
  }

  await browser.close();
  await libServer.stop();
  await modelServer.stop();

  const t4 = performance.now();
  INFO("--- Stopped local file servers", `(${timeDelta(t3, t4)} s)`);
  INFO(`--- DONE. Exiting with status=${process_status}`);

  process.exit(process_status);
})();
