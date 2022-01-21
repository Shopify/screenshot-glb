#!/usr/bin/env node

import path from "path";
import fs from "fs";
import yargs from "yargs/yargs";

import { FileServer } from "./file-server";
import { prepareAppOptions } from "./prepare-app-options";
import { captureScreenshot } from "./capture-screenshot";
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  DEFAULT_FORMAT,
  DEFAULT_QUALITY,
  DEFAULT_TIMEOUT_MILLISECONDS,
  DEFAULT_DEBUG,
  DEFAULT_VERBOSE_LOGGING,
} from "./defaults";

const argv = yargs(process.argv.slice(2)).options({
  input: {
    type: "string",
    alias: "i",
    describe: "Input glTF 2.0 binary (GLB) filepath",
    demandOption: true,
  },
  output: {
    type: "string",
    alias: "o",
    describe: "Output screenshot filepath",
    demandOption: true,
  },
  color: {
    type: "string",
    alias: "c",
    describe:
      "Output image background color (defaults to transparent, accepts HEX or RGB)",
  },
  width: {
    type: "number",
    alias: "w",
    describe: "Output image width",
    default: DEFAULT_WIDTH,
  },
  height: {
    type: "number",
    alias: "h",
    describe: "Output image height",
    default: DEFAULT_HEIGHT,
  },
  image_format: {
    type: "string",
    alias: "f",
    describe: "Output image format (defaults to 'image/png')",
    default: DEFAULT_FORMAT,
  },
  image_quality: {
    type: "number",
    alias: "q",
    describe: "Quality of the output image",
    default: DEFAULT_QUALITY,
  },
  timeout: {
    type: "number",
    alias: "t",
    describe: "Timeout length in milliseconds",
    default: DEFAULT_TIMEOUT_MILLISECONDS,
  },
  debug: {
    type: "boolean",
    alias: "d",
    describe: "Enable Debug Mode",
    default: DEFAULT_DEBUG,
  },
  verbose: {
    type: "boolean",
    alias: "v",
    describe: "Enable verbose logging",
    default: DEFAULT_VERBOSE_LOGGING,
  },
}).argv;

function copyModelViewer() {
  const dir = path.resolve(__dirname, "../lib");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const modelViewerDirectory = path.dirname(
    path.dirname(require.resolve("@google/model-viewer"))
  );
  const srcFile = path.resolve(modelViewerDirectory, "dist/model-viewer.js");
  const destFile = path.resolve(__dirname, "../lib/model-viewer.js");

  fs.copyFile(srcFile, destFile, (err) => {
    if (err) throw err;
  });
}

(async () => {
  copyModelViewer();

  const libServer = new FileServer(path.resolve(__dirname, "../lib"));
  const modelServer = new FileServer(path.dirname(argv.input));

  await libServer.start();
  await modelServer.start();

  const options = prepareAppOptions({
    libPort: libServer.port,
    modelPort: modelServer.port,
    argv,
  });

  let processStatus = 0;
  try {
    await captureScreenshot({ ...options, devicePixelRatio: 1.0 });
  } catch (err) {
    console.log(`❌ ERROR: ${err}`);
    processStatus = 1;
  }

  await libServer.stop();
  await modelServer.stop();

  process.exit(processStatus);
})();
