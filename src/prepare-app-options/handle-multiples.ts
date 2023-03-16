import {CaptureScreenShotOptions} from '../types/CaptureScreenshotOptions';

type MultiplesParams = Pick<
  CaptureScreenShotOptions,
  'inputUrls' | 'outputPaths' | 'backgroundColors' | 'modelViewerArgs'
>;

export function handleMultiples({
  inputUrls,
  outputPaths,
  backgroundColors,
  modelViewerArgs,
}: MultiplesParams) {
  if (backgroundColors.length === 1) {
    backgroundColors.length = inputUrls.length;
    backgroundColors.fill(backgroundColors[0]);
  }

  if (modelViewerArgs.length === 1) {
    modelViewerArgs.length = inputUrls.length;
    modelViewerArgs.fill(modelViewerArgs[0]);
  }

  if (outputPaths.length !== inputUrls.length) {
    throw new Error('Number of output paths must match number of input URLs');
  }

  if (backgroundColors.length !== inputUrls.length) {
    throw new Error(
      'Number of background colors must match number of input URLs',
    );
  }

  if (modelViewerArgs.length && modelViewerArgs.length !== inputUrls.length) {
    throw new Error(
      'Number of model viewer attributes must match number of input URLs',
    );
  }
}
