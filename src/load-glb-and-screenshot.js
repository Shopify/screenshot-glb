module.exports = (page, {glbPath, outputPath, backgroundColor, format, quality, timeout}) => {
  return page.evaluate((browser_glbPath, browser_outputPath, backgroundColor, browser_format, browser_quality, timeout) => {
    return new Promise((resolve, reject) => {
      var startTime = Number(new Date());
      var endTime = startTime + timeout;

      const isTimedOut = function() {
        const currentTime = Number(new Date());
        if (currentTime < endTime) {
          window.logInfo(`--- Waited ${currentTime - startTime}ms for model to render. ${endTime - currentTime}ms left until timeout.`);
        } else {
          reject('Waited until timeout');
        }
      }

      const rafAsync = function() {
        return new Promise(resolve => {
            requestAnimationFrame(resolve);
        });
      }

      const checkElementExists = async function(element) {
        while (element === null) {
            await rafAsync()
        }
        return querySelector;
      }  

      const modelViewerCanvas = async function(resolveCanvas){
        checkElementExists(modelViewer.shadowRoot)
        const srcCanvas = modelViewer.shadowRoot.getElementById('webgl-canvas');
        checkElementExists(srcCanvas)
        if(backgroundColor === 'transparent'){
          resolveCanvas(srcCanvas);
        }
        const destinationCanvas = document.createElement("canvas");
        destinationCanvas.width = srcCanvas.width;
        destinationCanvas.height = srcCanvas.height;

        const destCtx = destinationCanvas.getContext('2d');
        destCtx.fillStyle = backgroundColor;
        destCtx.fillRect(0,0,srcCanvas.width,srcCanvas.height);
        
        destCtx.drawImage(srcCanvas, 0, 0);

        
        resolveCanvas(destinationCanvas);
      }

      const modelViewerVisibleCallback = async function (event){
        try {
          const visible = event.detail.visible;
          if(visible){
            let t0 = Number(new Date());
            const canvas = await new Promise(modelViewerCanvas)
            window.saveDataUrl(
              canvas.toDataURL(browser_format, browser_quality),
              browser_outputPath,
            );

            let t1 = Number(new Date());

            clearTimeout(timeoutSet);

            window.logInfo(`--- Waited ${t1 - t0}ms for saveDataUrl to finish.`);

            resolve("Success");
          }
        } catch(err) {
          reject(err);
        }
      }

      modelViewer = document.getElementById('snapshot-viewer');
      timeoutSet = setInterval(isTimedOut, 1000);

      modelViewer.addEventListener('model-visibility', modelViewerVisibleCallback)
      modelViewer.src = browser_glbPath;
    });
  }, glbPath, outputPath, backgroundColor, format, quality, timeout);
}
