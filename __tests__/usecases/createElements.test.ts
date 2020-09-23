import * as fs from 'fs';
import trash from 'trash';
import dotenv from 'dotenv';

import { createElements } from '../../bin/usecases/createElements';

import { testConfig } from '../../testdata/testConfig';
import { figmaTestResponse } from '../../testdata/figmaTestResponse';

dotenv.config();

describe('Failure cases', () => {
  test('It should throw an error if no argument is provided', async () => {
    // @ts-ignore
    await expect(createElements()).rejects.toThrowError();
  });

  /*
  test('It should throw an error if misconfigured (missing token and URL)', async () => {
    const config = testConfig;
    const data = figmaTestResponse;
    const outputFolderGraphics = '__test-graphics__';
    // @ts-ignore
    await expect(createElements(config, data, outputFolderGraphics)).rejects.toThrowError();
    trash(outputFolderGraphics);
  });
  */
});

describe('Success cases', () => {
  test('It should write tokens given a valid configuration, valid data and an output folder', async () => {
    const CONFIG = testConfig;
    CONFIG.token = process.env.FIGMA_TOKEN || '';
    CONFIG.url = process.env.FIGMA_URL || '';
    CONFIG.outputFolderElements = '__test-elements-success__';
    const DATA = figmaTestResponse;

    // @ts-ignore
    await createElements(CONFIG, DATA);
    const FILE_EXISTS = fs.existsSync(CONFIG.outputFolderElements);
    expect(FILE_EXISTS).toBeTruthy();
    trash(CONFIG.outputFolderElements);
  });
});
