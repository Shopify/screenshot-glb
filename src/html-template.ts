import {getModelViewerUrl} from './get-model-viewer-url';

type AttributesObject = {[key: string]: any};

export interface TemplateRenderOptions {
  modelViewerUrl: string;
  width: number;
  height: number;
  inputPath: string;
  backgroundColor: string;
  devicePixelRatio: number;
  modelViewerArgs?: AttributesObject;
}

function toHTMLAttributeString(args: AttributesObject | undefined) {
  if (!args) return '';

  return Object.entries(args)
    .map(([key, value]) => {
      return `${key}="${value}"`;
    })
    .join('\n');
}

const errorMessagesForAttributeKey = {
  src: '`src` cannot be ovewritten pass the source via -i instead',
  'interaction-prompt':
    '`interaction-prompt` cannot be passed since it would cause unexpected renders',
  style: '`style` cannot be passed since it would cause unexpected renders',
  id: '`id` cannot be passed since it would cause the renderer to break',
};

function validateCustomAttributes(
  defaultAttributes: AttributesObject,
  customAttributes: AttributesObject | undefined,
) {
  if (!customAttributes) {
    return;
  }

  Object.keys(defaultAttributes).forEach((defaultAttributeKey) => {
    if (customAttributes[defaultAttributeKey] !== undefined) {
      if (errorMessagesForAttributeKey[defaultAttributeKey]) {
        throw new Error(errorMessagesForAttributeKey[defaultAttributeKey]);
      }

      throw new Error(`You cannot pass \`${defaultAttributeKey}\``);
    }
  });
}

export function htmlTemplate({
  modelViewerUrl,
  width,
  height,
  inputPath,
  backgroundColor,
  devicePixelRatio,
  modelViewerArgs,
}: TemplateRenderOptions): string {
  const defaultAttributes = {
    id: 'snapshot-viewer',
    style: `background-color: ${backgroundColor};`,
    'interaction-prompt': 'none',
    src: inputPath,
  };

  validateCustomAttributes(defaultAttributes, modelViewerArgs);

  const defaultAttributesString = toHTMLAttributeString(defaultAttributes);
  const modelViewerArgsString = toHTMLAttributeString(modelViewerArgs);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=${devicePixelRatio}">
        <script type="module"
          src="${modelViewerUrl}">
        </script>
        <style>
          body {
            margin: 0;
          }
          model-viewer {
            --progress-bar-color: transparent;
            width: ${width}px;
            height: ${height}px;
          }
        </style>
      </head>
      <body>
        <model-viewer
          ${defaultAttributesString}
          ${modelViewerArgsString}
        />
      </body>
    </html>
  `;
}
