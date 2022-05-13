import puppeteer from "puppeteer";
import { performance } from "perf_hooks";
import { htmlTemplate, TemplateRenderOptions } from "./html-template";
import {getModelViewerUrl} from "./get-model-viewer-url";
import {checkFileExistsAtUrl} from "./check-file-exists-at-url";

const timeDelta = (start, end) => {
  return ((end - start) / 1000).toPrecision(3);
};

interface CaptureScreenShotOptions extends Omit<TemplateRenderOptions, 'modelViewerUrl'> {
  modelViewerVersion: string;
  outputPath: string;
  debug: boolean;
  quality: number;
  timeout: number;
}

export async function captureScreenshot(options: CaptureScreenShotOptions) {
  const browserT0 = performance.now();
  const {
    modelViewerVersion,
    width,
    height,
    outputPath,
    debug,
    quality,
    timeout,
    devicePixelRatio,
  } = options;
  const screenshotTimeoutInSec = timeout / 1000;

  const headless = !debug;
  const args = [
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--single-process',
    '--no-zygote',
  ];

  if (headless) {
    args.push('--single-process');
  } else {
    args.push('--start-maximized');
  }

  const browser = await puppeteer.launch({
    args,
    defaultViewport: {
      width,
      height,
      deviceScaleFactor: devicePixelRatio,
    },
    headless,
  });

  const page = await browser.newPage();

  page.on("error", (error) => {
    console.log(`🚨 ${error}`);
  });

  page.on("console", async (message) => {
    const args = await Promise.all(
      message.args().map((arg) => arg.jsonValue())
    );

    if (args.length) {
      console.log(`➡️`, ...args);
    }
  });

  const browserT1 = performance.now();

  console.log(`🚀 Launched browser (${timeDelta(browserT0, browserT1)}s)`);

  const contentT0 = performance.now();

  const modelViewerUrl = getModelViewerUrl(modelViewerVersion);
  const modelViewerUrlExists = await checkFileExistsAtUrl(modelViewerUrl);

  if (!modelViewerUrlExists) {
    throw new Error(
      `Unfortunately Model Viewer ${modelViewerVersion} cannot be used to render a screenshot`
    );
  }

  const data = htmlTemplate({...options, modelViewerUrl});
  await page.setContent(data, { waitUntil: ["domcontentloaded"] });

  const contentT1 = performance.now();

  console.log(
    `🗺  Loading template to DOMContentLoaded (${timeDelta(
      contentT0,
      contentT1
    )}s)`
  );

  const renderT0 = performance.now();

  const evaluateError = await page.evaluate(async (maxTimeInSec) => {
    const modelBecomesReady = new Promise<void>((resolve, reject) => {
      let timeout;
      if (maxTimeInSec > 0) {
        timeout = setTimeout(() => {
          reject(
            new Error(`Stop capturing screenshot after ${maxTimeInSec} seconds`)
          );
        }, maxTimeInSec * 1000);
      }

      const modelViewer = document.getElementById("snapshot-viewer");
      modelViewer.addEventListener(
        "poster-dismissed",
        () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (maxTimeInSec > 0) {
                  clearTimeout(timeout);
                }
                resolve();
              });
            });
          });
        },
        { once: true }
      );
    });

    try {
      await modelBecomesReady;
      return null;
    } catch (error) {
      return error.message;
    }
  }, screenshotTimeoutInSec);

  const renderT1 = performance.now();
  console.log(
    `🖌  Rendering screenshot of model (${timeDelta(renderT0, renderT1)}s)`
  );

  if (evaluateError) {
    console.log(evaluateError);
    await browser.close();
    throw new Error(evaluateError);
  }

  const screenshotT0 = performance.now();

  const screenshot = await page.screenshot({
    quality: quality * 100.0,
    type: "jpeg",
    path: outputPath,
    omitBackground: true,
  });

  const screenshotT1 = performance.now();

  console.log(
    `🖼  Captured screenshot (${timeDelta(screenshotT0, screenshotT1)}s)`
  );

  await browser.close();

  return screenshot;
}
