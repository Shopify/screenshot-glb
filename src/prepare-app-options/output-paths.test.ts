import {outputPaths} from './output-paths';

describe('outputPaths', () => {
  const outPath1 = './out.jpg';
  const outPath2 = './out2.jpg';
  const format = 'image/jpeg';
  const formatExtension = 'jpeg';
  const inconsistentError =
    'Output types must be the same format. Choose all outputs to be either jpg or png';

  it('returns a single output path', () => {
    expect(outputPaths(outPath1, format)).toEqual({
      format,
      formatExtension,
      outputPaths: [outPath1],
    });
  });

  it('returns a single output path without format', () => {
    expect(outputPaths(outPath1, '')).toEqual({
      format,
      formatExtension,
      outputPaths: [outPath1],
    });
  });

  it('returns both output paths', () => {
    expect(outputPaths(`${outPath1},${outPath2}`, format)).toEqual({
      format,
      formatExtension,
      outputPaths: [outPath1, outPath2],
    });
  });

  it('returns both output paths without format', () => {
    expect(outputPaths(`${outPath1},${outPath2}`, '')).toEqual({
      format,
      formatExtension,
      outputPaths: [outPath1, outPath2],
    });
  });

  it('returns output paths without extensions', () => {
    expect(outputPaths(`./out1,./out2`, 'image/jpeg')).toEqual({
      format,
      formatExtension,
      outputPaths: ['./out1.jpg', './out2.jpg'],
    });
  });

  it('fails without a format without extensions', () => {
    expect(() => outputPaths(`./out1,./out2`, '')).toThrow(
      "Could not determine image type from path: './out1' or from the format ''.\n\nYou can try passing a image_format of 'image/jpeg' or 'image/png'",
    );
  });

  it('does not fail with inconsistent formats with a format passed', () => {
    expect(() => outputPaths(`${outPath1},./out2.png`, 'image/jpeg')).toThrow(
      inconsistentError,
    );
  });

  it('fails with inconsistent formats with out a format passed', () => {
    expect(() => outputPaths(`${outPath1},./out2.png`, '')).toThrow(
      inconsistentError,
    );
  });
});
