module.exports = (page, {glbPath, outputPath, format, quality, timeout}) => {
  return page.evaluate((browser_glbPath, browser_outputPath, browser_format, browser_quality, timeout) => {
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

      modelViewer = document.getElementById('snapshot-viewer');
      timeoutSet = setInterval(isTimedOut, 1000);

      modelViewer.addEventListener('model-visibility', function(){
        try {
          const visible = event.detail.visible;
          if(visible){
            let t0 = Number(new Date());
            window.saveDataUrl(
              modelViewer.toDataURL(browser_format, browser_quality),
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
      });
      modelViewer.src = browser_glbPath;
    });
  }, glbPath, outputPath, format, quality, timeout);
}
