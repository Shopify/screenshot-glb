const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (matches.length !== 3) {
    throw new Error('Could not parse data Url.');
  }

  return Buffer.from(matches[2], 'base64');
};

const htmlTemplate = ({width, height, libPort}) => {
  return `
    <html>
      <head>
        <script type="module"
          src="http://localhost:${libPort}/model-viewer.js">
        </script>
        <style>
          #snapshot-viewer {
            width: ${width};
            height: ${height};
          }
        </style>
      </head>
      <body>
        <model-viewer id="snapshot-viewer" />
      </body>
    </html>
  `
}

module.exports = async ({width, height, libPort}) => {
  const browserWSEndpointFilename = "/tmp/screenshot-glb-browserWSEndpoint";

  let browserWSEndpoint = null;
  try {
    browserWSEndpoint = fs.readFileSync(browserWSEndpointFilename, 'utf8');
  } catch (err) {
  }

  if (!browserWSEndpoint) {
    console.log('no endpoint file available, launching...');

    let browser = await puppeteer.launch({
      args: [
        '--disable-web-security',
        '--user-data-dir',
        '--no-sandbox',
      ],
    });

    browserWSEndpoint = browser.wsEndpoint();

    browser.disconnect();
  } else {
    console.log('endpoint file found, trying to connect', browserWSEndpoint);
  }

  fs.writeFile(browserWSEndpointFilename, browserWSEndpoint, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log('writing endpoint file');
  });

  browser = await puppeteer.connect({
    browserWSEndpoint,
  }).catch(e => {
    console.log('error on connect');
    console.log(e);
  });

  const page = await browser.newPage();

  await page.setViewport({
    width,
    height,
    deviceScaleFactor: 1,
  });

  const data = htmlTemplate({width, height, libPort});

  await page.setContent(data);

  page.exposeFunction('saveDataUrl', async (dataUrl, outputPath) => {
    const buffer = parseDataUrl(dataUrl);
    fs.writeFileSync(outputPath, buffer, 'base64');
  });

  page.exposeFunction('shutdown', async () => {
    await browser.disconnect();
  });

  return {page, browser};
}
