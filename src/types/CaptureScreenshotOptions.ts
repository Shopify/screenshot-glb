import {TemplateRenderOptions} from '../html-template';

export interface CaptureScreenShotOptions extends TemplateRenderOptions {
  outputPath: string;
  debug: boolean;
  disableChromiumSandbox: boolean;
  quality: number;
  timeout: number;
  formatExtension: string;
}
