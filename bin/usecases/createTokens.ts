import { FigmaData } from '../contracts/FigmaData';
import { Config } from '../contracts/Config';
import { FRAME as Frame } from '../contracts/Figma';

import { createPage } from './interactors/common/createPage';
import { processTokens } from './interactors/tokens/processTokens';
import { processSemanticTokens } from './interactors/tokens/processSemanticTokens';
import { writeTokens } from './interactors/tokens/writeTokens';

import { refresh } from '../frameworks/filesystem/refresh';

import { MsgWriteTokens, MsgNoTokensFound } from '../frameworks/messages/messages';
import { ErrorCreateTokens } from '../frameworks/errors/errors';

/**
 * @description Use case for creating token files from Figma
 */
export async function createTokens(config: Config, data: FigmaData): Promise<void> {
  try {
    if (!config || !data) throw Error(ErrorCreateTokens);
    console.log(MsgWriteTokens);

    const { outputFolderTokens } = config;
    refresh(outputFolderTokens);
    const tokensPage: Frame[] = createPage(data.document.children, 'Design Tokens');
		
		//processed primitive tokens
    const processedTokens = processTokens(tokensPage, config);
		//Write primitive tokens
    if (processedTokens && processedTokens.length > 0) writeTokens(processedTokens);
    else console.warn(MsgNoTokensFound);

		//processSemanticTokens works similar to processTokens but will need the
		//collection of primitive tokens from above.
		const semanticTokens = processSemanticTokens(tokensPage,processedTokens,config);
		//console.log("[createTokens] ",semanticTokens);
		if (semanticTokens && semanticTokens.length>0) {
			writeTokens(semanticTokens);
		}
		else {
			console.warn(MsgNoTokensFound);
		}

		//TODO: write semantic tokens
  } catch (error: any) {
    throw Error(error);
  }
}