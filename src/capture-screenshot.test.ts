import puppeteer, {Browser, Page} from 'puppeteer';
import {captureScreenshot} from './capture-screenshot';
import {htmlTemplate} from './html-template';
import {performance} from 'perf_hooks';

jest.mock('./html-template');
jest.mock('./check-file-exists-at-url');
jest.mock('perf_hooks', () => {
  return {
    performance: {
      now: jest.fn(),
    },
  };
});
jest.mock('puppeteer', () => {
  const page = {
    on: jest.fn(),
    setContent: jest.fn(),
    evaluate: jest.fn(),
    screenshot: jest.fn(),
  };

  const browser = {
    newPage: jest.fn().mockResolvedValue(page),
    close: jest.fn(),
  };

  return {
    launch: jest.fn().mockResolvedValue(browser),
    mock: {
      page,
      browser,
    },
  };
});

describe('captureScreenshot', () => {
  const modelViewerUrl = 'https://cdn.shopify.com/model-viewer.js';
  const inputPath = 'some/model.glb';
  const outputPath = 'some/image.jpeg';
  const debug = false;
  const disableChromiumSandbox = false;
  const quality = 1;
  const timeout = 60000;
  const width = 1024;
  const height = 768;
  const backgroundColor = '#000000';
  const devicePixelRatio = 1;
  const formatExtension = 'jpeg';
  const defaultParams = {
    modelViewerUrl,
    inputPath,
    outputPath,
    debug,
    disableChromiumSandbox,
    quality,
    timeout,
    width,
    height,
    backgroundColor,
    devicePixelRatio,
    formatExtension,
  };
  const htmlContent = '<div>some html</div>';
  let originalConsoleLog: typeof console.log;
  let mockPage: Page;
  let mockBrowser: Browser;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn();

    mockPage = jest.requireMock('puppeteer').mock.page as Page;
    mockBrowser = jest.requireMock('puppeteer').mock.browser as Browser;

    (mockPage.on as jest.Mock).mockReset();
    (mockPage.setContent as jest.Mock).mockReset().mockResolvedValue(undefined);
    (mockPage.evaluate as jest.Mock)
      .mockReset()
      .mockResolvedValueOnce('ANGLE SwiftShader')
      .mockResolvedValueOnce(undefined);
    (mockPage.screenshot as jest.Mock).mockReset().mockResolvedValue(undefined);
    (mockBrowser.close as jest.Mock).mockReset().mockResolvedValue(undefined);

    (htmlTemplate as jest.Mock).mockReturnValue(htmlContent);
    (performance.now as jest.Mock).mockReturnValue(0);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    jest.clearAllMocks();
  });

  test('launches with sandboxed SwiftShader defaults', async () => {
    await captureScreenshot({...defaultParams});

    expect(puppeteer.launch).toHaveBeenCalledWith({
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--disable-dev-shm-usage',
      ],
      defaultViewport: {
        width,
        height,
        deviceScaleFactor: devicePixelRatio,
      },
      headless: true,
    });
  });

  test('can explicitly disable the Chromium sandbox', async () => {
    await captureScreenshot({
      ...defaultParams,
      disableChromiumSandbox: true,
    });

    expect(puppeteer.launch).toHaveBeenCalledWith({
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      defaultViewport: {
        width,
        height,
        deviceScaleFactor: devicePixelRatio,
      },
      headless: true,
    });
  });

  test('starts maximized in debug mode', async () => {
    await captureScreenshot({
      ...defaultParams,
      debug: true,
    });

    expect(puppeteer.launch).toHaveBeenCalledWith({
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--disable-dev-shm-usage',
        '--start-maximized',
      ],
      defaultViewport: {
        width,
        height,
        deviceScaleFactor: devicePixelRatio,
      },
      headless: false,
    });
  });

  test('loads the model viewer after checking WebGL', async () => {
    await captureScreenshot({...defaultParams});

    expect(mockPage.evaluate).toHaveBeenCalledTimes(2);
    expect(mockPage.evaluate).toHaveBeenNthCalledWith(1, expect.any(Function));
    expect(mockPage.setContent).toHaveBeenCalledWith(htmlContent, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });
  });

  test('logs timing information', async () => {
    const expectedLogs = [
      '🚀  Launched browser (0.00s)',
      '🗺  Loading template to DOMContentLoaded (0.00s)',
      '🖌  Rendering screenshot of model (0.00s)',
      '🖼  Captured screenshot (0.00s)',
    ];

    await captureScreenshot({...defaultParams});

    expect(console.log).toHaveBeenCalledTimes(expectedLogs.length);
    expectedLogs.forEach((log, index) => {
      expect(console.log).toHaveBeenNthCalledWith(index + 1, log);
    });
  });

  test('fails immediately when WebGL is unavailable', async () => {
    (mockPage.evaluate as jest.Mock).mockReset().mockResolvedValue(null);

    await expect(captureScreenshot({...defaultParams})).rejects.toThrow(
      'Unable to create a WebGL context. Chromium was launched with the supported ANGLE SwiftShader driver (--use-gl=angle --use-angle=swiftshader). Verify that Chrome for Testing includes SwiftShader and can start with the configured sandbox.',
    );

    expect(mockPage.setContent).not.toHaveBeenCalled();
    expect(mockPage.screenshot).not.toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  test('fails when the model does not finish rendering', async () => {
    (mockPage.evaluate as jest.Mock)
      .mockReset()
      .mockResolvedValueOnce('ANGLE SwiftShader')
      .mockResolvedValueOnce('Stop capturing screenshot after 60 seconds');

    await expect(captureScreenshot({...defaultParams})).rejects.toThrow(
      'Model rendering failed: Stop capturing screenshot after 60 seconds',
    );

    expect(mockPage.screenshot).not.toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  test('closes the browser when page setup fails', async () => {
    (mockPage.setContent as jest.Mock).mockRejectedValue(
      new Error('page setup failed'),
    );

    await expect(captureScreenshot({...defaultParams})).rejects.toThrow(
      'page setup failed',
    );

    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  test('closes the browser after a successful screenshot', async () => {
    await captureScreenshot({...defaultParams});

    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  test('adds page error and console listeners', async () => {
    await captureScreenshot({...defaultParams});

    const on = mockPage.on as jest.Mock;
    expect(on).toHaveBeenCalledTimes(2);
    expect(on.mock.calls[0][0]).toBe('error');
    expect(on.mock.calls[1][0]).toBe('console');
  });

  test('logs page errors', async () => {
    const error = new Error('some error');
    let errorCallback: (error: Error) => void;

    (mockPage.on as jest.Mock).mockImplementation(
      (event: string, callback: (error: Error) => void) => {
        if (event === 'error') errorCallback = callback;
      },
    );

    await captureScreenshot({...defaultParams});

    errorCallback(error);

    expect(console.log).toHaveBeenCalledWith(`🚨  Page Error: ${error}`);
  });
});
