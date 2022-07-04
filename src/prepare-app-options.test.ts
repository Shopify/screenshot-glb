import {prepareAppOptions} from './prepare-app-options';

const modelPort = 8081;
const debug = false;

const defaultPreparedOptions = {
  backgroundColor: 'rgba(255, 255, 255, 0)',
  debug: false,
  format: 'image/png',
  formatExtension: 'png',
  width: 1024,
  height: 1024,
  inputPath: 'http://localhost:8081/some_model.glb',
  outputPath: './some_image.png',
  quality: 0.92,
  timeout: 10000,
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

test('handles args', () => {
  const argv = getArgv({
    width: 2048,
    height: 2048,
    timeout: 2000,
    image_quality: 1,
    color: 'rgba(255, 0, 255, 0)',
  });

  expect(prepareAppOptions({modelPort, debug, argv})).toEqual({
    ...defaultPreparedOptions,
    backgroundColor: 'rgba(255, 0, 255, 0)',
    width: 2048,
    height: 2048,
    quality: 1,
    timeout: 2000,
  });
});

test('handles jpg format', () => {
  const argv = getArgv({
    output: './some_image.jpg',
    image_format: 'image/jpeg',
  });

  expect(prepareAppOptions({modelPort, debug, argv})).toEqual({
    ...defaultPreparedOptions,
    outputPath: './some_image.jpg',
    format: 'image/jpeg',
    formatExtension: 'jpeg',
    backgroundColor: 'rgba(255, 255, 255, 1)',
  });
});

test('handles jpg with color override', () => {
  const argv = getArgv({
    output: './some_image.jpg',
    image_format: 'image/jpeg',
    color: 'rgba(255, 0, 255, 1)',
  });

  expect(prepareAppOptions({modelPort, debug, argv})).toEqual({
    ...defaultPreparedOptions,
    outputPath: './some_image.jpg',
    format: 'image/jpeg',
    formatExtension: 'jpeg',
    backgroundColor: 'rgba(255, 0, 255, 1)',
  });
});

test('handles model viewer attributes', () => {
  const argv = getArgv({
    model_viewer_attributes: 'exposure=10&camera-orbit=45deg 55deg 2.5m',
  });
  expect(prepareAppOptions({modelPort, debug, argv})).toEqual({
    ...defaultPreparedOptions,
    modelViewerArgs: {
      'camera-orbit': '45deg 55deg 2.5m',
      exposure: '10',
    },
  });
});
