module.exports = async (page, {glbPath, outputPath, format, quality, timeout}) => {
  return new Promise(async (resolve, reject) => {
    page.exposeFunction('resolvePromise', resolve);
    page.exposeFunction('rejectPromise', reject);
    await page.evaluate(async (browser_glbPath, browser_outputPath, browser_format, browser_quality, timeout) => {
      var startTime = Number(new Date());
      var endTime = startTime + timeout;

      const isTimedOut = function() {
        const currentTime = Number(new Date());
        if (currentTime < endTime) {
          window.logInfo(`--- Waited ${currentTime - startTime}ms for model to render. ${endTime - currentTime}ms left until timeout.`);
        } else {
          window.rejectPromise('Waited until timeout');
        }
      }

      modelViewer = document.getElementById('snapshot-viewer');
      timeoutSet = setInterval(isTimedOut, 1000);

      modelViewer.addEventListener('model-visibility', function(){
        const visible = event.detail.visible;
        if(visible){
          window.saveDataUrl(
            modelViewer.toDataURL(browser_format, browser_quality),
            browser_outputPath,
          );
          clearTimeout(timeoutSet);
          window.resolvePromise();
        }
      });
      modelViewer.src = browser_glbPath;
    }, glbPath, outputPath, format, quality, timeout);
  });
}
