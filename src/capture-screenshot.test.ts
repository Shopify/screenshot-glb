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
    setContent: jest.fn().mockResolvedValue(undefined),
    evaluate: jest.fn().mockResolvedValue(undefined),
    screenshot: jest.fn().mockResolvedValue(undefined),
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
  const quality = 1;
  const timeout = 60000;
  const width = 1024;
  const height = 768;
  const backgroundColor = '#000000';
  const devicePixelRatio = 1;
  const formatExtension = 'jpeg';
  const defaultParams = {
    modelViewerUrl,
    inputUrls: [inputPath],
    outputPaths: [outputPath],
    backgroundColors: [backgroundColor],
    modelViewerArgs: [],
    debug,
    quality,
    timeout,
    width,
    height,
    devicePixelRatio,
    formatExtension,
  };
  const htmlContent = '<div>some html</div>';
  let originalConsoleLog: typeof console.log;
  let mockPage;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn();

    mockPage = jest.requireMock('puppeteer').mock.page as Page;

    (htmlTemplate as jest.Mock).mockReturnValue(htmlContent);
    (performance.now as jest.Mock).mockReturnValue(0);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    jest.clearAllMocks();
  });

  test('calls with correct args', async () => {
    await captureScreenshot({
      ...defaultParams,
    });

    expect(puppeteer.launch).toHaveBeenCalledWith({
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-zygote',
        '--single-process',
      ],
      defaultViewport: {
        width,
        height,
        deviceScaleFactor: devicePixelRatio,
      },
      headless: !debug,
    });
  });

  test('calls with correct args in debug', async () => {
    await captureScreenshot({
      ...defaultParams,
      debug: true,
    });

    expect(puppeteer.launch).toHaveBeenCalledWith({
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-zygote',
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

  test('calls setContent', async () => {
    await captureScreenshot({
      ...defaultParams,
    });

    expect(mockPage.setContent).toHaveBeenCalledWith(htmlContent, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
    });
  });

  test('logs out correctly', async () => {
    const expectedLogs = [
      '🚀  Launched browser (0.00s)',
      '🗺  Loading template to DOMContentLoaded (0.00s)',
      '🖌  Rendering screenshot of model (0.00s)',
      '🖼  Captured screenshot (0.00s)',
      '🪂  Closed browser (0.00s)',
    ];

    await captureScreenshot({
      ...defaultParams,
    });

    expectedLogs.forEach((log, i) => {
      expect(console.log).toHaveBeenNthCalledWith(i + 1, log);
    });
    expect(console.log).toHaveBeenCalledTimes(expectedLogs.length);
  });

  test('handles evaluate error', async () => {
    const error = new Error('some error');
    const expectedLogs = [
      '🚀  Launched browser (0.00s)',
      '🗺  Loading template to DOMContentLoaded (0.00s)',
      '🖌  Rendering screenshot of model (0.00s)',
      '❌  Evaluate error: Error: some error',
      '❌  Closing browser because of error',
      '🪂  Closed browser (0.00s)',
    ];

    mockPage.evaluate.mockResolvedValue(error);

    await captureScreenshot({
      ...defaultParams,
    });

    expectedLogs.forEach((log, i) => {
      expect(console.log).toHaveBeenNthCalledWith(i + 1, log);
    });
    expect(console.log).toHaveBeenCalledTimes(expectedLogs.length);

    expect(mockPage.screenshot).not.toHaveBeenCalled();

    mockPage.evaluate.mockResolvedValue(undefined);
  });

  test('adds correct listeners to page', async () => {
    await captureScreenshot({
      ...defaultParams,
    });

    const on = mockPage.on as jest.Mock;
    expect(on).toHaveBeenCalledTimes(2);
    expect(on.mock.calls[0][0]).toBe('error');
    expect(on.mock.calls[1][0]).toBe('console');
  });

  test('handles page error', async () => {
    const error = new Error('some error');
    let errorCallback;

    (mockPage.on as jest.Mock).mockImplementation(
      (event: string, callback: (error: Error) => void) => {
        if (event === 'error') errorCallback = callback;
      },
    );

    await captureScreenshot({
      ...defaultParams,
    });

    errorCallback(error);

    expect(console.log).toHaveBeenCalledWith(`🚨  Page Error: ${error}`);
  });
});
