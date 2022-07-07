import {checkFileExistsAtUrl} from './check-file-exists-at-url';
import http from 'http';
import https from 'https';

describe('checkFileExistsAtUrl', () => {
  const urlExists =
    'https://cdn.shopify.com/shopifycloud/model-viewer/model-viewer.js';
  const urlDoesNotExist =
    'https://cdn.shopify.com/shopifycloud/dog-viewer/dog-viewer.js';
  const urlExistsHTTP =
    'http://cdn.shopify.com/shopifycloud/model-viewer/model-viewer.js';

  afterEach(jest.clearAllMocks);

  it('should find the file', async () => {
    await expect(checkFileExistsAtUrl(urlExists)).resolves.toEqual(true);
  });

  it('should not find the file', async () => {
    await expect(checkFileExistsAtUrl(urlDoesNotExist)).resolves.toEqual(false);
  });

  it('should use http when protocol is http', async () => {
    jest.spyOn(http, 'get').mockImplementation(() => {
      return {
        on: jest.fn(),
        end: jest.fn(),
      } as any as http.ClientRequest;
    });
    jest.spyOn(https, 'get').mockImplementation(() => {
      return {
        on: jest.fn(),
        end: jest.fn(),
      } as any as http.ClientRequest;
    });

    checkFileExistsAtUrl(urlExistsHTTP);
    expect(http.get).toHaveBeenCalled();
    expect(https.get).not.toHaveBeenCalled();
  });

  it('should use https when protocol is https', async () => {
    jest.spyOn(http, 'get').mockImplementation(() => {
      return {
        on: jest.fn(),
        end: jest.fn(),
      } as any as http.ClientRequest;
    });
    jest.spyOn(https, 'get').mockImplementation(() => {
      return {
        on: jest.fn(),
        end: jest.fn(),
      } as any as http.ClientRequest;
    });

    checkFileExistsAtUrl(urlExists);
    expect(http.get).not.toHaveBeenCalled();
    expect(https.get).toHaveBeenCalled();
  });
});
