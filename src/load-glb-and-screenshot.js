module.exports = async (page, {glbPath, outputPath, format, quality, timeout}) => {
  return new Promise((resolve, reject) => {
    page.exposeFunction('resolvePromise', resolve);
    page.exposeFunction('rejectPromise', reject);
    page.evaluate(async (browser_glbPath, browser_outputPath, browser_format, browser_quality, timeout) => {
      var endTime = Number(new Date()) + timeout;

      const isTimedOut = function() {
        const currentTime = Number(new Date())
        if (currentTime < endTime) {
          window.logInfo(`Waiting ${endTime - currentTime}ms for model to render...`);
        }else{
          window.rejectPromise('Waited until timeout');
        }
      }

      modelViewer = document.getElementById('snapshot-viewer');
      modelViewer.addEventListener('model-visibility', function(){
        const visible = event.detail.visible;
        if(visible){
          window.saveDataUrl(
            modelViewer.toDataURL(browser_format, browser_quality),
            browser_outputPath,
          );
          window.resolvePromise();
        }
        setInterval(isTimedOut, 1000);
      });
      modelViewer.src = browser_glbPath;
    }, glbPath, outputPath, format, quality, timeout);
  });
}
