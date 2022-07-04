import {checkFileExistsAtUrl} from './check-file-exists-at-url';

describe('checkFileExistsAtUrl', () => {
  const urlExists =
    'https://cdn.shopify.com/shopifycloud/model-viewer/model-viewer.js';
  const urlDoesNotExist =
    'https://cdn.shopify.com/shopifycloud/dog-viewer/dog-viewer.js';

  it('should find the file', async () => {
    await expect(checkFileExistsAtUrl(urlExists)).resolves.toEqual(true);
  });

  it('should not find the file', async () => {
    await expect(checkFileExistsAtUrl(urlDoesNotExist)).resolves.toEqual(false);
  });
});
