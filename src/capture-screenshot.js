const puppeteer = require('puppeteer');
const {performance} = require('perf_hooks');

const devicePixelRatio = 1.0;
const maxTimeInSec = 30;

const timeDelta = (start, end) => {
  return ((end - start) / 1000).toPrecision(3);
}

const htmlTemplate = (options) => {
  const {width, height, inputPath, libPort, backgroundColor} = options;
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale="${devicePixelRatio}">
        <script type="module"
          src="http://localhost:${libPort}/model-viewer.js">
        </script>
        <style>
          body {
            margin: 0;
          }
          model-viewer {
            --progress-bar-color: transparent;
            width: ${width};
            height: ${height};
          }
        </style>
      </head>
      <body>
        <model-viewer
          style="background-color: ${backgroundColor};"
          background-color=""
          id="snapshot-viewer"
          interaction-prompt="none"
          src="${inputPath}" />
      </body>
    </html>
  `
}

const captureScreenshot = async function (options) {
  const browserT0 = performance.now();
  const {width, height, outputPath, debug, quality, timeout} = options;

  let screenshotTimeoutInSec = maxTimeInSec;

  if (timeout) {
    screenshotTimeoutInSec = timeout / 1000;
  }

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
    ],
    defaultViewport: {
      width,
      height,
      deviceScaleFactor: devicePixelRatio,
    },
    headless: !debug,
  });

  const page = await browser.newPage();

  page.on('error', (error) => {
    console.log(`🚨 ${error}`);
  });

  page.on('console', async (message) => {
    const args =
        await Promise.all(message.args().map((arg) => arg.jsonValue()));

    if (args.length) {
      console.log(`➡️`, ...args);
    }
  });

  const browserT1 = performance.now()

  console.log(`🚀 Launched browser (${timeDelta(browserT0, browserT1)}s)`);

  const contentT0 = performance.now();

  const data = htmlTemplate(options);
  await page.setContent(data, {waitUntil: 'domcontentloaded'});

  const contentT1 = performance.now();

  console.log(`🗺  Loading template to DOMContentLoaded (${timeDelta(contentT0, contentT1)}s)`);

  const renderT0 = performance.now();

  const evaluateError = await page.evaluate(async (maxTimeInSec) => {
    const modelBecomesReady = new Promise((resolve, reject) => {
      let timeout;
      if (maxTimeInSec > 0) {
        timeout = setTimeout(() => {
          reject(new Error(
              `Stop capturing screenshot after ${maxTimeInSec} seconds`));
        }, maxTimeInSec * 1000);
      }

      const modelViewer = document.getElementById('snapshot-viewer');
      modelViewer.addEventListener('poster-dismissed', () => {
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
            requestAnimationFrame(()=>{
              if (maxTimeInSec > 0) {
                clearTimeout(timeout);
              }
              resolve();
            })
          })
        });
      }, {once: true});
    });

    try {
      await modelBecomesReady;
      return null;
    } catch (error) {
      return error.message;
    }
  }, screenshotTimeoutInSec);

  const renderT1 = performance.now();
  console.log(`🖌  Rendering screenshot of model (${timeDelta(renderT0, renderT1)}s)`);

  if (evaluateError) {
    console.log(evaluateError);
    await browser.close();
    throw new Error(evaluateError);
  }

  const screenshotT0 = performance.now();

  const type = 'jpeg';
  if (type === 'image/png') {
    type = 'png';
  }

  const screenshot =
      await page.screenshot({
        quality: quality * 100.0,
        type,
        path: outputPath,
        omitBackground: true
      });

  const screenshotT1 = performance.now();

  console.log(`🖼  Captured screenshot (${timeDelta(screenshotT0, screenshotT1)}s)`);

  await browser.close();

  return screenshot;
}

module.exports = captureScreenshot;