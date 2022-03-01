import {getModelViewerUrl} from './get-model-viewer-url';

describe('getModelViewerUrl', () => {
  it('handles default', () => {
    expect(getModelViewerUrl()).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/model-viewer.js');
  });

  it('handles passing version', () => {
    expect(getModelViewerUrl('1.9')).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/v1.9/model-viewer.js');
  });

  it('handles passing full version', () => {
    expect(getModelViewerUrl('1.9.1')).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/v1.9/model-viewer.js');
  });

  it('handles passing with v', () => {
    expect(getModelViewerUrl('v1.9')).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/v1.9/model-viewer.js');
  });

  it('handles passing with v and full version', () => {
    expect(getModelViewerUrl('v1.9.1')).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/v1.9/model-viewer.js');
  });

  it('handles multi digit', () => {
    expect(getModelViewerUrl('11.99.1')).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/v11.99/model-viewer.js');
  });

  it('handles passing with v', () => {
    expect(getModelViewerUrl('v11.99')).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/v11.99/model-viewer.js');
  });

  it('handles passing with v and full version', () => {
    expect(getModelViewerUrl('v11.99.1')).toBe('https://cdn.shopify.com/shopifycloud/model-viewer/v11.99/model-viewer.js');
  });

  it('handles no version', () => {
    expect(() => getModelViewerUrl('dogs.are.cool')).toThrow('"dogs.are.cool" was not valid version. Example version: 1.10');
  });
});
