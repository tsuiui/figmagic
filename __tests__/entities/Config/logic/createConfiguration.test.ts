import * as path from 'path';

import { createConfiguration } from '../../../../bin/entities/Config/logic/createConfiguration';
import { baseConfig } from '../../../../bin/entities/Config/baseConfig';
import { Config } from '../../../../bin/contracts/Config';

import { testConfig } from '../../../../testdata/testConfig';

describe('Success cases', () => {
  test('It should return a valid merged configuration if given a path to an RC file and a set of CLI arguments', async () => {
    const USER_CONFIG_PATH = path.join(process.cwd(), 'testdata', 'figmagicrc');
    const CLI_ARGS = ['-t', 'asdf1234'];
    testConfig.token = 'asdf1234';
    testConfig.recompileLocal = false;
    testConfig.usePostscriptFontNames = false;
    testConfig.syncTokens = false;

    await expect(
      createConfiguration(baseConfig, USER_CONFIG_PATH, CLI_ARGS)
    ).resolves.toMatchObject(testConfig);
  });

  test('It should throw an error when missing user configuration path', async () => {
    // @ts-ignore
    await expect(createConfiguration()).rejects.toThrow();
  });

  test('It logs the configuration when debug mode is enabled', async () => {
    const USER_CONFIG_PATH = path.join(process.cwd(), 'testdata', 'figmagicrc');
    // mock console.log to reduce the noise in the terminal
    const mocks = [jest.spyOn(global.console, 'log').mockImplementation()];

    const configuration = await createConfiguration({} as Config, USER_CONFIG_PATH, ['--debug']);

    expect(global.console.log).toHaveBeenCalledWith(configuration);

    mocks.forEach((spy) => spy.mockRestore());
  });
});
