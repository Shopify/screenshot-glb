import path from "path";

import { scrubOutput } from "./scrub-output";
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
  } = argv;
  const inputPath = `http://localhost:${modelPort}/${path.basename(input)}`;
  const [outputPath, format] = scrubOutput(output, image_format);
  const defaultBackgroundColor =
    format === "image/jpeg" ? colors.white : colors.transparent;

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
  };
}
