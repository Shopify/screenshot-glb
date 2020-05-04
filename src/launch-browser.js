const puppeteer = require('puppeteer');
const fs = require('fs');


async function exitHandler(options, exitCode) {
  console.log("\nShutting down...")
  try {
    fs.unlinkSync(options.outputPath)
    console.log(`--- deleted ${options.outputPath}`)
  } catch(err) {
    console.log(`--- failed to delete ${options.outputPath}`)
  }
  console.log("Done.")
}

module.exports = async ({outputPath}) => {
  const browser = await puppeteer.launch({
    args: [
      '--disable-web-security', 
      '--user-data-dir', 
      '--no-sandbox',
    ],
  });

  process.stdin.resume();

  // src: https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
  // do something when app is closing
  process.on('exit', exitHandler.bind(null, { outputPath: outputPath }));

  //catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { outputPath: outputPath }));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { outputPath: outputPath }));
  process.on('SIGUSR2', exitHandler.bind(null, { outputPath: outputPath }));

  //catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { outputPath: outputPath }));

  browserWSEndpoint = browser.wsEndpoint();
  try {
    await fs.writeFileSync(outputPath, browserWSEndpoint);
    console.log(`Successfully wrote connection details to ${outputPath}`);
    console.log(`Browser is running at ${browserWSEndpoint}`);
  } catch (err) {
    await browser.close();
    console.log(`Failed to write to ${outputPath}`);
    throw err;
  }  
}
