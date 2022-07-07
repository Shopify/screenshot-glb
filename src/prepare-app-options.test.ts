import {prepareAppOptions} from './prepare-app-options';
import {CaptureScreenShotOptions} from './types/CaptureScreenshotOptions';
import {checkFileExistsAtUrl} from './check-file-exists-at-url';

jest.mock('./check-file-exists-at-url');

const modelPort = 8081;
const debug = false;

const defaultPreparedOptions: CaptureScreenShotOptions = {
  backgroundColor: 'rgba(255, 255, 255, 0)',
  debug: false,
  width: 1024,
  height: 1024,
  inputPath: 'http://localhost:8081/some_model.glb',
  outputPath: './some_image.png',
  quality: 0.92,
  timeout: 10000,
  modelViewerUrl:
    'https://cdn.shopify.com/shopifycloud/model-viewer/model-viewer.js',
  formatExtension: 'png',
  devicePixelRatio: 1,
};

function getArgv(optionalAndOverrides = {}) {
  const required = {
    input: './some_model.glb',
    output: './some_image.png',
    image_format: 'image/png',
    width: 1024,
    height: 1024,
    image_quality: 0.92,
    timeout: 10000,
  };

  return {
    ...required,
    ...optionalAndOverrides,
  };
}

beforeEach(() => {
  (checkFileExistsAtUrl as jest.Mock).mockResolvedValue(true);
});

test('handles args', async () => {
  const argv = getArgv({
    width: 2048,
    height: 2048,
    timeout: 2000,
    image_quality: 1,
    color: 'rgba(255, 0, 255, 0)',
  });

  await expect(prepareAppOptions({modelPort, debug, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    backgroundColor: 'rgba(255, 0, 255, 0)',
    width: 2048,
    height: 2048,
    quality: 1,
    timeout: 2000,
  });
});

test('handles jpg format', async () => {
  const argv = getArgv({
    output: './some_image.jpg',
    image_format: 'image/jpeg',
  });

  await expect(prepareAppOptions({modelPort, debug, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    outputPath: './some_image.jpg',
    formatExtension: 'jpeg',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  });
});

test('handles jpg with color override', async () => {
  const argv = getArgv({
    output: './some_image.jpg',
    image_format: 'image/jpeg',
    color: 'rgba(255, 0, 255, 1)',
  });

  await expect(prepareAppOptions({modelPort, debug, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    outputPath: './some_image.jpg',
    formatExtension: 'jpeg',
    backgroundColor: 'rgba(255, 0, 255, 1)',
  });
});

test('handles model viewer attributes', async () => {
  const argv = getArgv({
    model_viewer_attributes: 'exposure=10&camera-orbit=45deg 55deg 2.5m',
  });
  await expect(prepareAppOptions({modelPort, debug, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    modelViewerArgs: {
      'camera-orbit': '45deg 55deg 2.5m',
      exposure: '10',
    },
  });
});

test('handles model viewer version', async () => {
  const argv = getArgv({
    model_viewer_version: '1.10',
  });

  await expect(prepareAppOptions({modelPort, debug, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    modelViewerUrl:
      'https://cdn.shopify.com/shopifycloud/model-viewer/v1.10/model-viewer.js',
  });
});

test('handles no url for model viewer', async () => {
  (checkFileExistsAtUrl as jest.Mock).mockResolvedValue(false);

  const argv = getArgv({
    model_viewer_version: undefined,
  });

  await expect(prepareAppOptions({modelPort, debug, argv})).rejects.toEqual(
    new Error(
      'Unfortunately Model Viewer undefined cannot be used to render a screenshot',
    ),
  );
});
