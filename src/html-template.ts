export interface TemplateRenderOptions {
  width: number;
  height: number;
  inputPath: string;
  libPort: number;
  backgroundColor: string;
  devicePixelRatio: number;
}

export function htmlTemplate({
  width,
  height,
  inputPath,
  libPort,
  backgroundColor,
  devicePixelRatio,
}: TemplateRenderOptions): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=${devicePixelRatio}">
        <script type="module"
          src="http://localhost:${libPort}/model-viewer.js">
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
          style="background-color: ${backgroundColor};"
          id="snapshot-viewer"
          interaction-prompt="none"
          src="${inputPath}"
        />
      </body>
    </html>
  `;
}
