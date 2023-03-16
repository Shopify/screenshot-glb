import {AttributesObject} from '../html-template';
import {handleMultiples} from './handle-multiples';

describe('handleMultiples', () => {
  let inputUrls: string[];
  let outputPaths: string[];
  let backgroundColors: string[];
  let modelViewerArgs: AttributesObject[];

  beforeEach(() => {
    inputUrls = ['model1.glb', 'model2.glb', 'model3.glb'];
    outputPaths = ['model1.png', 'model2.png', 'model3.png'];
    backgroundColors = ['#FF00FF', '#FACE00', '#CAFE00'];
    modelViewerArgs = [{exposure: 0.1}, {exposure: 0.2}, {exposure: 0.3}];
  });

  it('does nothing when everything is valid', () => {
    const expectedInputUrls = [...inputUrls];
    const expectedOutputPaths = [...outputPaths];
    const expectedBackgroundColors = [...backgroundColors];
    const expectedAllModelViewerArgs = [...modelViewerArgs];

    handleMultiples({
      inputUrls,
      outputPaths,
      backgroundColors,
      modelViewerArgs,
    });

    expect(inputUrls).toEqual(expectedInputUrls);
    expect(outputPaths).toEqual(expectedOutputPaths);
    expect(backgroundColors).toEqual(expectedBackgroundColors);
    expect(modelViewerArgs).toEqual(expectedAllModelViewerArgs);
  });

  it('fills in missing background colors', () => {
    const backgroundColors = ['#00FFCC'];

    const expectedInputUrls = [...inputUrls];
    const expectedOutputPaths = [...outputPaths];
    const expectedBackgroundColors = ['#00FFCC', '#00FFCC', '#00FFCC'];
    const expectedAllModelViewerArgs = [...modelViewerArgs];

    handleMultiples({
      inputUrls,
      outputPaths,
      backgroundColors,
      modelViewerArgs,
    });

    expect(inputUrls).toEqual(expectedInputUrls);
    expect(outputPaths).toEqual(expectedOutputPaths);
    expect(backgroundColors).toEqual(expectedBackgroundColors);
    expect(modelViewerArgs).toEqual(expectedAllModelViewerArgs);
  });

  it('fills in model viewer args', () => {
    const modelViewerArgs = [{exposure: 0.1}];

    const expectedInputUrls = [...inputUrls];
    const expectedOutputPaths = [...outputPaths];
    const expectedBackgroundColors = [...backgroundColors];
    const expectedAllModelViewerArgs = [
      {exposure: 0.1},
      {exposure: 0.1},
      {exposure: 0.1},
    ];

    handleMultiples({
      inputUrls,
      outputPaths,
      backgroundColors,
      modelViewerArgs,
    });

    expect(inputUrls).toEqual(expectedInputUrls);
    expect(outputPaths).toEqual(expectedOutputPaths);
    expect(backgroundColors).toEqual(expectedBackgroundColors);
    expect(modelViewerArgs).toEqual(expectedAllModelViewerArgs);
  });

  it('throws an exception when inputs and outputs have different lengths', () => {
    outputPaths = ['model1.png', 'model2.png'];

    expect(() => {
      handleMultiples({
        inputUrls,
        outputPaths,
        backgroundColors,
        modelViewerArgs,
      });
    }).toThrowError('Number of output paths must match number of input URLs');
  });

  it('throws an exception when inputs and background colors have different lengths', () => {
    backgroundColors = ['#FF00FF', '#FACE00'];

    expect(() => {
      handleMultiples({
        inputUrls,
        outputPaths,
        backgroundColors,
        modelViewerArgs,
      });
    }).toThrowError(
      'Number of background colors must match number of input URLs',
    );
  });

  it('throws an exception when inputs and model viewer args have different lengths', () => {
    modelViewerArgs = [{exposure: 0.1}, {exposure: 0.2}];

    expect(() => {
      handleMultiples({
        inputUrls,
        outputPaths,
        backgroundColors,
        modelViewerArgs,
      });
    }).toThrowError(
      'Number of model viewer attributes must match number of input URLs',
    );
  });

  it('does not throw an exception when model viewer args are empty', () => {
    modelViewerArgs = [];

    expect(() => {
      handleMultiples({
        inputUrls,
        outputPaths,
        backgroundColors,
        modelViewerArgs,
      });
    }).not.toThrowError();
  });
});
