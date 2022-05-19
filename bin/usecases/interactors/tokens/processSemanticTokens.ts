import { makeSemanticToken } from '../../../entities/Token/index';
import { WriteOperation } from '../../../contracts/Write';

import { Config } from '../../../contracts/Config';
import { FRAME as Frame } from '../../../contracts/Figma';

import { sanitizeString } from '../../../frameworks/string/sanitizeString';
//import { acceptedTokenTypes } from '../../../frameworks/system/acceptedTokenTypes';

import { ErrorWriteTokensNoSettings } from '../../../frameworks/errors/errors';

/**
 * @description Create semantic tokens based on tokens Figma file and a 
 * collection of primitive tokens created from processTokens.
 */
export function processSemanticTokens(tokens: Frame[], primitives:[], config: Config): any {
  try {
    if (!config) throw Error(ErrorWriteTokensNoSettings);
    if (!tokens) return;

    const PROCESSED_TOKENS: WriteOperation[] = [];
		//Even though Frame[], things like text can get in here so tokenFrame seems
		//misleading a name. It's really every direct child in the page.
    tokens.forEach((tokenFrame) => {
			//Reject processing things not in a frame (e.g. instructions)
			if (tokenFrame.type!=="FRAME") return;

      const TOKEN_NAME = sanitizeString(tokenFrame.name);
			//Skip all things not frames prefixed with "semantic"
			//Makes sure to change the condition in getFileContentAndPath and index
			//tokenOperations as well if changing the startsWith string here. Refactor
			//this cludgines as it leads to a lot of issues if the semantic frames 
			//need renaming.
      if (TOKEN_NAME[0] === '_' || !TOKEN_NAME.startsWith('semantic')) {
					return;
			}
      // if (acceptedTokenTypes.includes(TOKEN_NAME.toLowerCase()) && TOKEN_NAME[0] !== '_') {
      const TOKEN = makeSemanticToken(tokenFrame, TOKEN_NAME, config, primitives);
      const WRITE_OP = TOKEN.getWriteOperation();
      if (WRITE_OP) PROCESSED_TOKENS.push(WRITE_OP);      
    });

    return PROCESSED_TOKENS;
  } catch (error: any) {
    throw Error(error);
  }
}