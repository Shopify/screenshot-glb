import puppeteer from 'puppeteer';
import {performance} from 'perf_hooks';
import {htmlTemplate, TemplateRenderOptions} from './html-template';
import {CaptureScreenShotOptions} from './types/CaptureScreenshotOptions';

const timeDelta = (start, end) => {
  return ((end - start) / 1000).toPrecision(3);
};

export async function captureScreenshot(options: CaptureScreenShotOptions) {
  const browserT0 = performance.now();
  const {
    modelViewerUrl,
    width,
    height,
    outputPath,
    debug,
    disableChromiumSandbox,
    quality,
    timeout,
    devicePixelRatio,
    formatExtension,
  } = options;
  const screenshotTimeoutInSec = timeout / 1000;

  const headless = !debug;
  const args = [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--disable-dev-shm-usage',
  ];

  if (disableChromiumSandbox) {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  if (!headless) {
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

  try {
    const page = await browser.newPage();

    page.on('error', (error) => {
      console.log(`🚨  Page Error: ${error}`);
    });

    page.on('console', async (message) => {
      const args = await Promise.all(
        message.args().map((arg) => arg.jsonValue()),
      );

      if (args.length) {
        console.log(`➡️`, ...args);
      }
    });

    const browserT1 = performance.now();

    console.log(`🚀  Launched browser (${timeDelta(browserT0, browserT1)}s)`);

    const webGLRenderer = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');

      if (!context) return null;

      const debugInfo = context.getExtension('WEBGL_debug_renderer_info');
      return debugInfo
        ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : context.getParameter(context.RENDERER);
    });

    if (!webGLRenderer) {
      throw new Error(
        'Unable to create a WebGL context. Chromium was launched with the supported ANGLE SwiftShader driver (--use-gl=angle --use-angle=swiftshader). Verify that Chrome for Testing includes SwiftShader and can start with the configured sandbox.',
      );
    }

    const contentT0 = performance.now();

    const data = htmlTemplate({...options, modelViewerUrl});
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
      throw new Error(`Model rendering failed: ${evaluateError}`);
    }

    const screenshotT0 = performance.now();

    const captureOptions = {
      quality: quality * 100.0,
      type: formatExtension as 'jpeg' | 'png' | 'webp',
      path: outputPath as `${string}.jpeg` | `${string}.png` | `${string}.webp`,
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
  } finally {
    await browser.close();
  }
}
