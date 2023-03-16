import puppeteer from 'puppeteer';
import {AttributesObject, htmlTemplate} from './html-template';
import {logError} from './log-error';
import {timeDelta} from './time-delta';
import {CaptureScreenShotOptions} from './types/CaptureScreenshotOptions';
import {performance} from 'perf_hooks';

interface Args {
  inputPath: string;
  outputPath: string;
  backgroundColor: string;
  modelViewerArgs?: AttributesObject;
  quality: number;
  formatExtension: string;
  modelViewerUrl: string;
  page: puppeteer.Page;
  options: CaptureScreenShotOptions;
}

export async function renderScreenshot({
  inputPath,
  outputPath,
  backgroundColor,
  modelViewerArgs,
  page,
  modelViewerUrl,
  quality,
  formatExtension,
  options,
}: Args) {
  const contentT0 = performance.now();
  const screenshotTimeoutInSec = options.timeout / 1000;

  const data = htmlTemplate({
    ...options,
    backgroundColor,
    inputPath,
    modelViewerUrl,
    modelViewerArgs,
  });
  await page.setContent(data, {
    waitUntil: ['domcontentloaded', 'networkidle0'],
  });

  const contentT1 = performance.now();

  console.log(
    `🗺  Loading template to DOMContentLoaded (${timeDelta(
      contentT0,
      contentT1,
    )}s)`,
  );

  const renderT0 = performance.now();

  const evaluateError = await page.evaluate(async (maxTimeInSec) => {
    const modelBecomesReady = new Promise<void>((resolve, reject) => {
      let timeout;
      if (maxTimeInSec > 0) {
        timeout = setTimeout(() => {
          reject(
            new Error(
              `Stop capturing screenshot after ${maxTimeInSec} seconds`,
            ),
          );
        }, maxTimeInSec * 1000);
      }

      const modelViewer = document.getElementById('snapshot-viewer');
      modelViewer.addEventListener(
        'poster-dismissed',
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
        {once: true},
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
    `🖌  Rendering screenshot of model (${timeDelta(renderT0, renderT1)}s)`,
  );

  if (evaluateError) {
    logError(`Evaluate error: ${evaluateError}`);
    throw new Error(evaluateError);
  }

  const screenshotT0 = performance.now();

  const captureOptions = {
    quality: quality * 100.0,
    type: formatExtension as 'jpeg' | 'png' | 'webp',
    path: outputPath,
    omitBackground: true,
  };

  if (formatExtension === 'png') {
    delete captureOptions.quality;
  }

  const screenshot = await page.screenshot(captureOptions);

  const screenshotT1 = performance.now();

  console.log(
    `🖼  Captured screenshot (${timeDelta(screenshotT0, screenshotT1)}s)`,
  );

  return screenshot;
}
