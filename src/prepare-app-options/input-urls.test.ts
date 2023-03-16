import {FileHandler} from '../file-handler';
import {inputUrls} from './input-urls';

describe('inputUrls', () => {
  const fileHandler = {
    addFile: (input: string) => Promise.resolve(input),
  };
  const localServerPort = 8080;
  const input = 'input.glb';

  it('can return input urls', () => {
    const expected = ['http://localhost:8080/input.glb'];
    expect(
      inputUrls(fileHandler as FileHandler, input, localServerPort),
    ).resolves.toEqual(expected);
  });

  it('can return multiple input urls', () => {
    const expected = [
      'http://localhost:8080/input.glb',
      'http://localhost:8080/input2.glb',
    ];
    const input = 'input.glb,input2.glb';

    expect(
      inputUrls(fileHandler as FileHandler, input, localServerPort),
    ).resolves.toEqual(expected);
  });

  it('can return multiple input urls with whitespace after', () => {
    const expected = [
      'http://localhost:8080/input.glb',
      'http://localhost:8080/input2.glb',
    ];
    const input = 'input.glb,    input2.glb';

    expect(
      inputUrls(fileHandler as FileHandler, input, localServerPort),
    ).resolves.toEqual(expected);
  });

  it('can return multiple input urls with whitespace after and before', () => {
    const expected = [
      'http://localhost:8080/input.glb',
      'http://localhost:8080/input2.glb',
    ];
    const input = 'input.glb  ,    input2.glb';

    expect(
      inputUrls(fileHandler as FileHandler, input, localServerPort),
    ).resolves.toEqual(expected);
  });
});
