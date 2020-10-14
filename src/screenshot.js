const colors = require('./colors')
const fs = require('fs');

const parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (matches.length !== 3) {
    throw new Error('Could not parse data Url.');
  }

  return Buffer.from(matches[2], 'base64');
};

const saveDataUrl = function(dataUrl, outputPath){
  const buffer = parseDataUrl(dataUrl);
  fs.writeFileSync(outputPath, buffer, 'base64');
}

const evaluatePage = function({options, colors}){ 

  const modelViewerCanvas = function(srcCanvas){
    return new Promise(async (resolve) => {
      const {width, height, backgroundColor} = options;
      if(backgroundColor === colors.transparent){
        resolve(srcCanvas);
      }
      const destinationCanvas = document.createElement("canvas");
      destinationCanvas.width = width;
      destinationCanvas.height = height;

      const destCtx = destinationCanvas.getContext('2d');
      destCtx.fillStyle = backgroundColor;
      destCtx.fillRect(0,0,width,height);
      
      destCtx.drawImage(srcCanvas, 0, 0);
      
      resolve(destinationCanvas);
    });
  };

  const takeScreenshot = function (srcCanvas, timeout){
    return new Promise(async (resolve) => {
      const {outputPath, format, quality} = options;
      let t0 = Number(new Date());
      const updatedCanvas = await modelViewerCanvas(srcCanvas, options);
      window.saveDataUrl(
        updatedCanvas.toDataURL(format, quality),
        outputPath,
      );

      let t1 = Number(new Date());
      window.logInfo(`--- Waited ${t1 - t0}ms for saveDataUrl to finish.`);
      clearTimeout(timeout);
      resolve('takeScreenshot Success')
    });
  };

  return new Promise(async (resolve, reject) => {
    const {timeout} = options;
    const startTime = Number(new Date());
    let endTime = startTime + timeout;

    const isTimedOut = function() {
      const currentTime = Number(new Date());
      if (currentTime < endTime) {
        window.logInfo(`--- Waited ${currentTime - startTime}ms for model to render. ${endTime - currentTime}ms left until timeout.`);
      } else {
        reject('Waited until timeout');
      }
    }
    const modelViewer = document.getElementById('snapshot-viewer');
    const srcCanvas = modelViewer.shadowRoot.getElementById("webgl-canvas");
    timeoutSet = setInterval(isTimedOut, 1000);
    timeoutSet = 'nil';
    await takeScreenshot(srcCanvas, timeoutSet);
    resolve('evaluatePage Success')
  });
}

const screenshot = async function(puppeteerPage, options){

  puppeteerPage.exposeFunction('saveDataUrl', saveDataUrl);

  const modelViewerId = 'snapshot-viewer';
  await puppeteerPage.waitForSelector(`#${modelViewerId}`)
  await puppeteerPage.waitForFunction(modelViewerId => document.getElementById(modelViewerId).modelIsVisible, {}, modelViewerId);
  await puppeteerPage.waitForFunction(modelViewerId => !!document.getElementById(modelViewerId).shadowRoot, {}, modelViewerId);
  await puppeteerPage.waitForFunction(modelViewerId => !!document.getElementById(modelViewerId).shadowRoot.getElementById('webgl-canvas'), {}, modelViewerId);

  const result = await puppeteerPage.evaluate(evaluatePage, {options, colors});
  return result;
}

module.exports = screenshot