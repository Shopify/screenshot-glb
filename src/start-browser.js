const puppeteer = require('puppeteer');
const fs = require('fs');

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
          src="http://localhost:${libPort}/model-viewer.min.js">
        </script>
        <style>
          #snapshot-viewer {
            width: ${width};
            height: ${height};
          }
          model-viewer {
           background-color: #70BCD1;
         }
        </style>
      </head>
      <body>
        <model-viewer shadow-intensity="1" id="snapshot-viewer" />
      </body>
    </html>
  `
}

module.exports = async ({width, height, libPort}) => {
  const browser = await puppeteer.launch({
    args: [
      '--disable-web-security', 
      '--user-data-dir', 
      '--no-sandbox',
    ],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width, 
    height,
    deviceScaleFactor: 2,
  });

  const data = htmlTemplate({width, height, libPort});

  await page.setContent(data);


/*   await page.evaluate(async () => {
      const modelBecomesReady = self.modelLoaded ?
          Promise.resolve() :
          new Promise((resolve, reject) => {
            const timeout = setTimeout(reject, 6000);

            self.addEventListener('model-ready', () => {
              clearTimeout(timeout);
              resolve();
            }, {once: true});
          });

      await modelBecomesReady;
    });

    console.log(`🖼  Capturing screenshot`);

    try {
      await fs.mkdir(this.outputDirectory);
    } catch (e) {
      // Ignored...
    }

    const screenshot = await page.screenshot({path: outputPath});

    await browser.close()
*/

  page.exposeFunction('saveDataUrl', async (dataUrl, outputPath) => {
    const buffer = parseDataUrl(dataUrl);
    fs.writeFileSync(outputPath, buffer, 'base64');
  });

  page.exposeFunction('shutdown', async () => {
    await browser.close();
  });

  return {page, browser};
}
