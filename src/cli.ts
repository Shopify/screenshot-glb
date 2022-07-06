#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs/yargs';

import {FileServer} from './file-server';
import {prepareAppOptions} from './prepare-app-options';
import {captureScreenshot} from './capture-screenshot';
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  DEFAULT_FORMAT,
  DEFAULT_QUALITY,
  DEFAULT_TIMEOUT_MILLISECONDS,
  DEFAULT_DEBUG,
  DEFAULT_VERBOSE_LOGGING,
} from './defaults';
import {logUnhandledError} from './log-error';

const argv = yargs(process.argv.slice(2)).options({
  input: {
    type: 'string',
    alias: 'i',
    describe: 'Input glTF 2.0 binary (GLB) filepath',
    demandOption: true,
  },
  output: {
    type: 'string',
    alias: 'o',
    describe: 'Output screenshot filepath',
    demandOption: true,
  },
  color: {
    type: 'string',
    alias: 'c',
    describe:
      'Output image background color (defaults to transparent, accepts HEX or RGB)',
  },
  width: {
    type: 'number',
    alias: 'w',
    describe: 'Output image width',
    default: DEFAULT_WIDTH,
  },
  height: {
    type: 'number',
    alias: 'h',
    describe: 'Output image height',
    default: DEFAULT_HEIGHT,
  },
  image_format: {
    type: 'string',
    alias: 'f',
    describe: "Output image format (defaults to 'image/png')",
    default: DEFAULT_FORMAT,
  },
  image_quality: {
    type: 'number',
    alias: 'q',
    describe: 'Quality of the output image',
    default: DEFAULT_QUALITY,
  },
  timeout: {
    type: 'number',
    alias: 't',
    describe: 'Timeout length in milliseconds',
    default: DEFAULT_TIMEOUT_MILLISECONDS,
  },
  debug: {
    type: 'boolean',
    alias: 'd',
    describe: 'Enable Debug Mode',
    default: DEFAULT_DEBUG,
  },
  verbose: {
    type: 'boolean',
    alias: 'v',
    describe: 'Enable verbose logging',
    default: DEFAULT_VERBOSE_LOGGING,
  },
  model_viewer_version: {
    type: 'string',
    alias: '@',
    describe:
      'Model viewer version to be used. If nothing is passed defaults to latest',
  },
  model_viewer_attributes: {
    type: 'string',
    alias: 'm',
    describe:
      'Set <model-viewer> attributes by passing them as url params eg. exposure=2&environment-image=neutral',
  },
}).argv;

(async () => {
  const modelServer = new FileServer(path.dirname(argv.input));

  await modelServer.start();

  const options = prepareAppOptions({
    modelPort: modelServer.port,
    argv,
  });

  let processStatus = 0;
  try {
    await captureScreenshot(options);
  } catch (err) {
    logUnhandledError(err);
    processStatus = 1;
  }

  await modelServer.stop();

  process.exit(processStatus);
})();
