export function getModelViewerUrl(version?: string) {
  if (!version) {
    return 'https://cdn.shopify.com/shopifycloud/model-viewer/model-viewer.js';
  }

  const regexGetVersion = /(\d+\.\d+)(\.\d+)?/;

  const result = regexGetVersion.exec(version);

  if (!result) {
    throw new Error(`"${version}" was not valid version. Example version: 1.10`);
  }

  const majorMinor = result[1];

  return `https://cdn.shopify.com/shopifycloud/model-viewer/v${majorMinor}/model-viewer.js`;
}
