import {AttributesObject} from '../html-template';
import {REGEX_PARAM_SEPARATOR} from './param-separator';

export function modelViewerAttributes(
  model_viewer_attributes?: string,
): AttributesObject[] {
  if (!model_viewer_attributes) {
    return [];
  }

  const modelViewerAttributes = model_viewer_attributes.split(
    REGEX_PARAM_SEPARATOR,
  );

  return modelViewerAttributes.map((attributes) => {
    const modelViewerArgs = {};

    const params = new URLSearchParams(attributes);

    params.forEach((value, key) => {
      modelViewerArgs[key] = value;
    });

    return modelViewerArgs;
  });
}
