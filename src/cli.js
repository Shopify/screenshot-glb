#!/usr/bin/env node

const path = require('path');
const { performance } = require('perf_hooks');
var fs = require('fs');

const FileServer = require('./file-server');

const startBrowser = require('./start-browser');
const launchBrowser = require('./launch-browser');

const loadGLBAndScreenshot = require('./load-glb-and-screenshot');

const argv = require('yargs')
  .boolean("launcher-mode")
  .boolean("connect-mode")
  .alias('po', 'path_output')
  .alias('pi', 'path_input')
  .alias('i', 'input')
  .alias('o', 'output')
  .alias('w', 'width')
  .alias('h', 'height')
  .alias('f', 'image_format')
  .alias('q', 'image_quality')
  .alias('t', 'timeout')
  .count('verbose')
  .alias('v', 'verbose')
  .describe('launcher-mode', 'Launches and keeps the browser open for connections.')
  .describe('po', 'Launcher will save connection details to the path_output')
  .describe('connect-mode', 'Connect to the existing browser specified by path_input')
  .describe('pi', 'Input file containing details of an existing connection')
  .describe('i', 'Input glTF 2.0 binary (GLB) filepath')
  .describe('o', 'Output PNG screenshot filepath')
  .describe('w', 'Output image width')
  .describe('h', 'Output image height')
  .describe('f', 'Output image format (defaults to \'image/png\')')
  .describe('q', 'Quality of the output image (defaults to 0.92)')
  .describe('t', 'Timeout length')
  .describe('v', 'Enable verbose logging')
  // .demandOption(['i', 'o'])
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

  const modelViewerDirectory = path.dirname(path.dirname(require.resolve('@google/model-viewer')));
  const srcFile = path.resolve(modelViewerDirectory, 'dist/model-viewer.js');
  const destFile = path.resolve(__dirname, '../lib/model-viewer.js');  
  
  fs.copyFile(srcFile, destFile, (err) => {
    if (err) throw err;
  });
}  

(async () => {
  if (argv['launcher-mode'] && argv.po) {
    await launchBrowser({outputPath: argv.po});
    return;
  }

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
  const timeout = argv.timeout || 10000;

  var wsEndpoint = null;

  if (argv['connect-mode'] && argv.pi) {
    try {
      wsEndpoint = fs.readFileSync(argv.pi);
    } catch (err) {
      // todo do something
      console.log(`Failed to read ${argv.pi}`);      
    }
  }

  const {page, browser} = await startBrowser({width, height, libPort: libServer.port, wsEndpoint});

  const t2 = performance.now();
  INFO("--- Started puppeteer browser", `(${timeDelta(t1, t2)} s)`);

  page.exposeFunction('logInfo', (message) => {
    INFO(message)
  });

  page.on('console', msg => INFO("--- Console output: ", msg.text()));
  
  let t3 = performance.now();
  await loadGLBAndScreenshot(page, {
    glbPath,
    outputPath: argv.output,
    format,
    quality,
    timeout,
  }).then(()=>{
    t3 = performance.now();
    INFO("--- Took snapshot of", argv.input, `(${timeDelta(t2, t3)} s)`);
  }).catch(()=>{
    t3 = performance.now();
    INFO("--- Failed to take snapshot of", argv.input, `(${timeDelta(t2, t3)} s)`);
  });

  if (argv['connect-mode'] && argv.pi) {
    await browser.disconnect();
  }  else {
    await browser.close();
  }
  
  await libServer.stop();
  await modelServer.stop();

  const t4 = performance.now();
  INFO("--- Stopped local file servers", `(${timeDelta(t3, t4)} s)`);
  INFO("--- DONE");
})()
