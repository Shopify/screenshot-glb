import {execSync} from 'child_process';
import * as path from 'path';
import {unlinkSync, existsSync, statSync} from 'fs';
import {imgDiff} from 'img-diff-js';

describe('render using different file formats', () => {
  const FILE_PNG = path.resolve(__dirname, 'out.png');
  const FILE_JPG = path.resolve(__dirname, 'out.jpg');
  const EXPECTED_JPG = path.resolve(__dirname, '..', 'fixtures', 'expected-no-param-out.jpg');
  const EXPECTED_PNG = path.resolve(__dirname, '..', 'fixtures', 'expected-no-param-out.png');
  const PATH_CI = path.resolve(__dirname, '..', '..', 'dist', 'cli.js');

  function deleteOutputFiles() {
    if (existsSync(FILE_PNG)) {
      unlinkSync(FILE_PNG);
    }

    if (existsSync(FILE_JPG)) {
      unlinkSync(FILE_JPG);
    }
  }

  beforeEach(deleteOutputFiles);
  afterEach(deleteOutputFiles);

  function runCLIWithParams(outPath: string, params: string) {
    execSync(`node ${PATH_CI} -i ./test/fixtures/WaterBottle.glb -o ${outPath} ${params}`);
  }

  function testFileSize({filePath, expectedSize}: {filePath: string, expectedSize: number}) {
    const fileSize = statSync(filePath).size;
    expect(fileSize).toBeGreaterThan(expectedSize - 1000);
    expect(fileSize).toBeLessThan(expectedSize + 1000);
  }

  async function testSimilarity({filePath, expectedPath}: {filePath: string, expectedPath: string}) {
    const {width, height, diffCount} = await imgDiff({
      actualFilename: filePath,
      expectedFilename: expectedPath,
    });

    const EXPECTED_SAME_PERCENTAGE = 0.9;
    const targetDiffCount = Math.round(width * height * (1 - EXPECTED_SAME_PERCENTAGE));

    expect(diffCount).toBeLessThan(targetDiffCount);
  }

  it('renders jpg', async () => {
    const outFile = FILE_JPG;
    expect(existsSync(outFile)).toBe(false);

    runCLIWithParams(
      outFile,
      '-w 1024 -h 2048 -q 1.00 -v -t 30000'
    );

    expect(existsSync(outFile)).toBe(true);
    testFileSize({filePath: outFile, expectedSize: 380071});
    testSimilarity({filePath: outFile, expectedPath: EXPECTED_JPG});
  });

  it('renders png', () => {
    const outFile = FILE_PNG;
    expect(existsSync(outFile)).toBe(false);

    runCLIWithParams(
      outFile,
      '-w 1024 -h 2048 -q 1.00 -v -t 30000'
    );

    expect(existsSync(outFile)).toBe(true);
    testFileSize({filePath: outFile, expectedSize: 863185});
  });
});
