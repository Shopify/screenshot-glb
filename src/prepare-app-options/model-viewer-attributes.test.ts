import {modelViewerAttributes} from './model-viewer-attributes';

describe('modelViewerAttributes', () => {
  const attributes =
    'exposure=0.92&camera-orbit=88.59deg+59.01deg+0.24m&camera-target=0.06m+0.04m+0m&environment-image=neutral exposure=0.92&camera-orbit=88.59deg+59.01deg+0.24m&camera-target=0.02m+0.01m+0m&environment-image=neutral';
  const expectedAttributes = {
    'camera-orbit': '88.59deg 59.01deg 0.24m',
    'camera-target': '0.02m 0.01m 0m',
    'environment-image': 'neutral',
    exposure: '0.92',
  };

  it('can parse without modelviewer attributes', () => {
    expect(modelViewerAttributes()).toEqual([]);
  });

  it('can parse with modelviewer attributes', () => {
    expect(modelViewerAttributes(attributes)).toEqual([expectedAttributes]);
  });

  it('can parse with two sets of model viewer attributes', () => {
    expect(modelViewerAttributes(`${attributes},${attributes}`)).toEqual([
      expectedAttributes,
      expectedAttributes,
    ]);
  });
});
