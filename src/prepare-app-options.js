const path = require('path');

const scrubOutput = require('./scrub-output');
const colors = require('./colors.js');

module.exports = function prepareBrowserOptions({libPort, modelPort, debug, argv}) {
  const inputPath = `http://localhost:${modelPort}/${path.basename(argv.input)}`;
  const [outputPath, format] = scrubOutput(argv.output, argv.image_format);
  const defaultBackgroundColor = (format === 'image/jpeg' ? colors.white : colors.transparent);

  return {
    backgroundColor: argv.color || defaultBackgroundColor,
    quality: argv.image_quality || 0.92,
    timeout: argv.timeout || 10000,
    height: argv.height || 1024,
    width: argv.width || 1024,
    inputPath,
    outputPath,
    format,
    libPort,
    debug,
  };
}
