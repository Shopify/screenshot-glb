import {TemplateRenderOptions} from '../html-template';

export interface CaptureScreenShotOptions
  extends Omit<TemplateRenderOptions, 'modelViewerUrl'> {
  modelViewerVersion?: string;
  outputPath: string;
  debug: boolean;
  quality: number;
  timeout: number;
  formatExtension: string;
}
