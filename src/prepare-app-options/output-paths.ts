import {parseOutputPathAndFormat} from '../parse-output-path-and-format';
import {REGEX_PARAM_SEPARATOR} from './param-separator';

interface ReturnValue {
  outputPaths: string[];
  format: string;
  formatExtension: string;
}

export function outputPaths(
  outputs: string,
  image_format: string,
): ReturnValue {
  let format: string | undefined;
  let formatExtension: string | undefined;

  const outputPaths = outputs.split(REGEX_PARAM_SEPARATOR).map((output) => {
    const [outputPath, parsedFormat, parsedFormatExtension] =
      parseOutputPathAndFormat(output, image_format);

    format ||= parsedFormat;
    formatExtension ||= parsedFormatExtension;

    if (format !== parsedFormat) {
      throw new Error(
        'Output types must be the same format. Choose all outputs to be either jpg or png',
      );
    }

    return outputPath;
  });

  return {
    outputPaths,
    format,
    formatExtension,
  };
}
