import {AttributesObject, TemplateRenderOptions} from '../html-template';

export interface CaptureScreenShotOptions
  extends Omit<
    TemplateRenderOptions,
    'inputPath' | 'backgroundColor' | 'modelViewerArgs' | 'backgroundColor'
  > {
  inputUrls: string[];
  outputPaths: string[];
  backgroundColors: string[];
  modelViewerArgs: AttributesObject[];
  debug: boolean;
  quality: number;
  timeout: number;
  formatExtension: string;
}
