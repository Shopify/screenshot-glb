import path from "path";

import { parseOutputPathAndFormat } from "./parse-output-path-and-format";
import { colors } from "./colors";

interface Argv {
  input: string;
  output: string;
  image_format: string;
  image_quality: number;
  timeout: number;
  width: number;
  height: number;
  color?: string;
  model_viewer_attributes?: string;
}

interface Props {
  libPort: number;
  modelPort: number;
  argv: Argv;
  debug?: boolean;
}

export function prepareAppOptions({ libPort, modelPort, debug, argv }: Props) {
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
  } = argv;
  const inputPath = `http://localhost:${modelPort}/${path.basename(input)}`;
  const [outputPath, format] = parseOutputPathAndFormat(output, image_format);
  const defaultBackgroundColor =
    format === "image/jpeg" ? colors.white : colors.transparent;
  let modelViewerArgs: { [key: string]: string } = undefined;

  if (model_viewer_attributes) {
    modelViewerArgs = {};

    const params = new URLSearchParams(model_viewer_attributes);
    params.forEach((value, key) => {
      modelViewerArgs[key] = value;
    });
  }

  return {
    backgroundColor: backgroundColor || defaultBackgroundColor,
    quality,
    timeout,
    height,
    width,
    debug,
    inputPath,
    outputPath,
    format,
    libPort,
    modelViewerArgs,
  };
}
