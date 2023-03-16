import {prepareAppOptions, PrepareAppOptionsArgs} from './prepare-app-options';
import {CaptureScreenShotOptions} from './types/CaptureScreenshotOptions';
import {checkFileExistsAtUrl} from './check-file-exists-at-url';
import {copyFile} from 'fs';
import {FileHandler} from './file-handler';

jest.mock('./check-file-exists-at-url');
jest.mock('./file-handler');

const fileHandler = new FileHandler();
const localServerPort = 8081;
const debug = false;
const defaultArgs = {
  fileHandler,
  localServerPort,
  debug,
};

const defaultPreparedOptions: CaptureScreenShotOptions = {
  inputUrls: ['./some-glb/some_model.glb'],
  outputPaths: ['./some_image.png'],
  backgroundColors: ['rgba(255, 255, 255, 0)'],
  modelViewerArgs: [],
  debug: false,
  width: 1024,
  height: 1024,
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

afterEach(jest.clearAllMocks);

test('handles args', async () => {
  const argv = getArgv({
    width: 2048,
    height: 2048,
    timeout: 2000,
    image_quality: 1,
    color: 'rgba(255, 0, 255, 0)',
  });

  await expect(prepareAppOptions({...defaultArgs, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    inputUrls: ['http://localhost:8081/some_model.glb'],
    backgroundColors: ['rgba(255, 0, 255, 0)'],
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

  await expect(prepareAppOptions({...defaultArgs, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    inputUrls: ['http://localhost:8081/some_model.glb'],
    outputPaths: ['./some_image.jpg'],
    backgroundColors: ['rgba(255, 255, 255, 1)'],
    formatExtension: 'jpeg',
  });
});

test('handles jpg with color override', async () => {
  const argv = getArgv({
    output: './some_image.jpg',
    image_format: 'image/jpeg',
    color: 'rgba(255, 0, 255, 1)',
  });

  await expect(prepareAppOptions({...defaultArgs, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    inputUrls: ['http://localhost:8081/some_model.glb'],
    outputPaths: ['./some_image.jpg'],
    backgroundColors: ['rgba(255, 0, 255, 1)'],
    formatExtension: 'jpeg',
  });
});

test('copies glb to server folder', async () => {
  const argv = getArgv();
  await expect(prepareAppOptions({...defaultArgs, argv}));

  expect(fileHandler.addFile).toBeCalledTimes(1);
  expect(fileHandler.addFile).toHaveBeenCalledWith(argv.input);
});

test('handles model viewer attributes', async () => {
  const argv = getArgv({
    model_viewer_attributes: 'exposure=10&camera-orbit=45deg 55deg 2.5m',
  });
  await expect(prepareAppOptions({...defaultArgs, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    inputUrls: ['http://localhost:8081/some_model.glb'],
    modelViewerArgs: [
      {
        'camera-orbit': '45deg 55deg 2.5m',
        exposure: '10',
      },
    ],
  });
});

test('handles model viewer version', async () => {
  const argv = getArgv({
    model_viewer_version: '1.10',
  });

  await expect(prepareAppOptions({...defaultArgs, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    inputUrls: ['http://localhost:8081/some_model.glb'],
    modelViewerUrl:
      'https://cdn.shopify.com/shopifycloud/model-viewer/v1.10/model-viewer.js',
  });
});

test('handles no url for model viewer', async () => {
  (checkFileExistsAtUrl as jest.Mock).mockResolvedValue(false);

  const argv = getArgv({
    model_viewer_version: undefined,
  });

  await expect(prepareAppOptions({...defaultArgs, argv})).rejects.toEqual(
    new Error(
      'Unfortunately Model Viewer undefined cannot be used to render a screenshot',
    ),
  );
});

test('errors if local model viewer path + version are passed', async () => {
  const argv = getArgv({
    model_viewer_path: './model-viewer.js',
    model_viewer_version: '1.1',
  });

  await expect(prepareAppOptions({...defaultArgs, argv})).rejects.toEqual(
    new Error(
      'Please pass only Model Viewer Version or Model Viewer Path not both',
    ),
  );
});

test('handles local model viewer path for model viewer', async () => {
  const modelViewerPath = './model-viewer.js';
  const argv = getArgv({
    model_viewer_path: modelViewerPath,
  });

  await expect(prepareAppOptions({...defaultArgs, argv})).resolves.toEqual({
    ...defaultPreparedOptions,
    inputUrls: ['http://localhost:8081/some_model.glb'],
    modelViewerUrl: 'http://localhost:8081/model-viewer.js',
  });

  expect(fileHandler.addFile).toBeCalledTimes(2);
  expect(fileHandler.addFile).toHaveBeenCalledWith(argv.input);
  expect(fileHandler.addFile).toHaveBeenCalledWith(modelViewerPath);
});
