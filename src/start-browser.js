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
    deviceScaleFactor: 1,
  });

  const data = htmlTemplate({width, height, libPort});

  await page.setContent(data);

  page.exposeFunction('saveDataUrl', async (dataUrl, outputPath) => {
    const buffer = parseDataUrl(dataUrl);
    fs.writeFileSync(outputPath, buffer, 'base64');
  });

  page.exposeFunction('shutdown', async () => {
    await browser.close();
  });

  return {page, browser};
}
