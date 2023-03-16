import {FileHandler} from '../file-handler';
import {getLocalUrl} from '../get-local-url';
import {REGEX_PARAM_SEPARATOR} from './param-separator';

export async function inputUrls(
  fileHandler: FileHandler,
  input: string,
  localServerPort: number,
) {
  const inputs = input.split(REGEX_PARAM_SEPARATOR);

  return Promise.all(
    inputs.map(async (input) => {
      const model3dFileName = await fileHandler.addFile(input);

      return getLocalUrl({
        port: localServerPort,
        fileName: model3dFileName,
      });
    }),
  );
}
