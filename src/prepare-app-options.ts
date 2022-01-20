import path from "path";

import { scrubOutput } from "./scrub-output";
import { colors } from "./colors";

interface Argv {
  input: string;
  output: string;
  image_format: string;
  color?: string;
  image_quality?: number;
  timeout?: number;
  width?: number;
  height?: number;
}

interface Props {
  libPort: number;
  modelPort: number;
  argv: Argv;
  debug?: boolean;
}

export function prepareAppOptions({ libPort, modelPort, debug, argv }: Props) {
  const inputPath = `http://localhost:${modelPort}/${path.basename(
    argv.input
  )}`;
  const [outputPath, format] = scrubOutput(argv.output, argv.image_format);
  const defaultBackgroundColor =
    format === "image/jpeg" ? colors.white : colors.transparent;

  return {
    backgroundColor: argv.color || defaultBackgroundColor,
    quality: argv.image_quality || 0.92,
    timeout: argv.timeout || 10000,
    height: argv.height || 1024,
    width: argv.width || 1024,
    debug: debug || false,
    inputPath,
    outputPath,
    format,
    libPort,
  };
}
