#!/usr/bin/env node

import path from "path";
import fs from "fs";

import { FileServer } from "./file-server";
import { prepareAppOptions } from "./prepare-app-options";
import { captureScreenshot } from "./capture-screenshot";

const argv = require("yargs")
  .alias("i", "input")
  .alias("o", "output")
  .alias("c", "color")
  .alias("w", "width")
  .alias("h", "height")
  .alias("f", "image_format")
  .alias("q", "image_quality")
  .alias("t", "timeout")
  .alias("d", "debug")
  .count("verbose")
  .alias("v", "verbose")
  .describe("i", "Input glTF 2.0 binary (GLB) filepath")
  .describe("o", "Output screenshot filepath")
  .describe("w", "Output image width")
  .describe("h", "Output image height")
  .describe("f", "Output image format (defaults to 'image/png')")
  .describe("q", "Quality of the output image (defaults to 0.92)")
  .describe(
    "c",
    "Output image background color (defaults to transparent, accepts HEX or RGB)"
  )
  .describe("t", "Timeout length")
  .describe("v", "Enable verbose logging")
  .describe("d", "Enable Debug Mode")
  .demandOption(["i", "o"]).argv;

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
