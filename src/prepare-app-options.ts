import {CaptureScreenShotOptions} from './types/CaptureScreenshotOptions';
import {getModelViewerUrl} from './get-model-viewer-url';
import {checkFileExistsAtUrl} from './check-file-exists-at-url';
import {getLocalUrl} from './get-local-url';
import {FileHandler} from './file-handler';
import {AttributesObject} from './html-template';
import {backgroundColors as parseBackgroundColors} from './prepare-app-options/background-color';
import {inputUrls as parseInputUrls} from './prepare-app-options/input-urls';
import {outputPaths as parseOutputPaths} from './prepare-app-options/output-paths';
import {modelViewerAttributes} from './prepare-app-options/model-viewer-attributes';
import {handleMultiples} from './prepare-app-options/handle-multiples';

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
    color,
    model_viewer_attributes,
    model_viewer_version,
    model_viewer_path,
  } = argv;
  const inputUrls = await parseInputUrls(fileHandler, input, localServerPort);

  const {outputPaths, format, formatExtension} = parseOutputPaths(
    output,
    image_format,
  );

  const backgroundColors = parseBackgroundColors(format, color);
  const modelViewerArgs: AttributesObject[] = modelViewerAttributes(
    model_viewer_attributes,
  );

  handleMultiples({
    inputUrls,
    outputPaths,
    backgroundColors,
    modelViewerArgs,
  });

  if (model_viewer_version && model_viewer_path) {
    throw new Error(
      'Please pass only Model Viewer Version or Model Viewer Path not both',
    );
  }

  let modelViewerUrl: string = getModelViewerUrl(model_viewer_version);

  if (model_viewer_path) {
    const modelViewerFileName = await fileHandler.addFile(model_viewer_path);

    modelViewerUrl = getLocalUrl({
      port: localServerPort,
      fileName: modelViewerFileName,
    });
  }

  const modelViewerUrlExists = await checkFileExistsAtUrl(modelViewerUrl);

  if (!modelViewerUrlExists) {
    throw new Error(
      `Unfortunately Model Viewer ${model_viewer_version} cannot be used to render a screenshot`,
    );
  }

  return {
    modelViewerUrl,
    inputUrls,
    outputPaths,
    backgroundColors,
    modelViewerArgs,
    quality,
    timeout,
    height,
    width,
    debug,
    formatExtension,
    devicePixelRatio: 1,
  };
}
