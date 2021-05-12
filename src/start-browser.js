const puppeteer = require('puppeteer');

const htmlTemplate = (options) => {
  const {width, height, inputPath, libPort} = options;
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
        <model-viewer id="snapshot-viewer" src="${inputPath}" />
      </body>
    </html>
  `
}

const startBrowser = async function(options){
  return new Promise(async (resolve) => {
    const {width, height, debug} = options;
    const browser = await puppeteer.launch({
      headless: !debug,
      args: [
        '--no-sandbox',
      ],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1,
    });

    const data = htmlTemplate(options);

    await page.setContent(data);

    page.exposeFunction('shutdown', async () => {
      await browser.close();
    });

    resolve({page, browser});
  });
}

module.exports = startBrowser
