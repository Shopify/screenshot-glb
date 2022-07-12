import path from 'path';

import {parseOutputPathAndFormat} from './parse-output-path-and-format';
import {colors} from './colors';
import {CaptureScreenShotOptions} from './types/CaptureScreenshotOptions';
import {getModelViewerUrl} from './get-model-viewer-url';
import {checkFileExistsAtUrl} from './check-file-exists-at-url';
import {getLocalUrl} from './get-local-url';
import {FileHandler} from './file-handler';

export interface Argv {
  input: string;
  output: string;
  debug?: boolean;
  image_format: string;
  image_quality: number;
  timeout: number;
  width: number;
  height: number;
  color?: string;
  model_viewer_path?: string;
  model_viewer_version?: string;
  model_viewer_attributes?: string;
}

export interface PrepareAppOptionsArgs {
  localServerPort: number;
  fileHandler: FileHandler;
  argv: Argv;
  debug?: boolean;
}

export async function prepareAppOptions({
  localServerPort,
  fileHandler,
  debug,
  argv,
}: PrepareAppOptionsArgs): Promise<CaptureScreenShotOptions> {
  const {
    input,
    output,
    image_format,
    image_quality: quality,
    timeout,
    height,
    width,
    color: backgroundColor,
    model_viewer_attributes,
    model_viewer_version: modelViewerVersion,
    model_viewer_path: modelViewerPath,
  } = argv;
  const model3dFileName = await fileHandler.addFile(input);
  const inputPath = getLocalUrl({
    port: localServerPort,
    fileName: model3dFileName,
  });
  const [outputPath, format, formatExtension] = parseOutputPathAndFormat(
    output,
    image_format,
  );
  const defaultBackgroundColor =
    format === 'image/jpeg' ? colors.white : colors.transparent;
  let modelViewerArgs: {[key: string]: string} = undefined;

  if (model_viewer_attributes) {
    modelViewerArgs = {};

    const params = new URLSearchParams(model_viewer_attributes);
    params.forEach((value, key) => {
      modelViewerArgs[key] = value;
    });
  }

  if (modelViewerVersion && modelViewerPath) {
    throw new Error(
      'Please pass only Model Viewer Version or Model Viewer Path not both',
    );
  }

  let modelViewerUrl: string = getModelViewerUrl(modelViewerVersion);

  if (modelViewerPath) {
    const modelViewerFileName = await fileHandler.addFile(modelViewerPath);

    modelViewerUrl = getLocalUrl({
      port: localServerPort,
      fileName: modelViewerFileName,
    });
  }

  const modelViewerUrlExists = await checkFileExistsAtUrl(modelViewerUrl);

  if (!modelViewerUrlExists) {
    throw new Error(
      `Unfortunately Model Viewer ${modelViewerVersion} cannot be used to render a screenshot`,
    );
  }

  return {
    modelViewerUrl,
    backgroundColor: backgroundColor || defaultBackgroundColor,
    quality,
    timeout,
    height,
    width,
    debug,
    inputPath,
    outputPath,
    formatExtension,
    modelViewerArgs,
    devicePixelRatio: 1,
  };
}
