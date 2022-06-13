import { FRAME as Frame } from '../../contracts/Figma';
import { Config } from '../../contracts/Config';
import { ProcessedToken } from '../../contracts/ProcessedToken';
import { WriteOperation } from '../../contracts/Write';

import { makeColorTokens } from './logic/makeColorTokens';
import { makeSpacingTokens } from './logic/makeSpacingTokens';
import { makeFontTokens } from './logic/makeFontTokens';
import { makeFontSizeTokens } from './logic/makeFontSizeTokens';
import { makeFontWeightTokens } from './logic/makeFontWeightTokens';
import { makeLineHeightTokens } from './logic/makeLineHeightTokens';
import { makeShadowTokens } from './logic/makeShadowTokens';
import { makeBorderWidthTokens } from './logic/makeBorderWidthTokens';
import { makeRadiusTokens } from './logic/makeRadiusTokens';
import { makeZindexTokens } from './logic/makeZindexTokens';
import { makeLetterSpacingTokens } from './logic/makeLetterSpacingTokens';
import { makeMediaQueryTokens } from './logic/makeMediaQueryTokens';
import { makeOpacityTokens } from './logic/makeOpacityTokens';
import { makeDurationTokens } from './logic/makeDurationTokens';
import { makeDelayTokens } from './logic/makeDelayTokens';
import { makeEasingTokens } from './logic/makeEasingTokens';

import { makeSemanticColorTokens } from './logic/makeSemanticColorTokens';
import { makeSemanticFontTokens } from './logic/makeSemanticFontTokens';

import { ignoreElementsKeywords } from '../../frameworks/system/ignoreElementsKeywords';
import { ErrorExtractTokens, ErrorExtractTokensNoConfig, ErrorMakeColorTokensNoPrimitive, ErrorMakeFontTokensNoFrame } from '../../frameworks/errors/errors';
import {
  ErrorMakeColorTokensNoFrame,
  ErrorMakeColorTokensNoChildren
} from '../../frameworks/errors/errors';


export const makeToken = (token: Frame, tokenName: string, config: Config): Token => {
	return (new Token(token, tokenName, config)).extract();
}

export const makeSemanticToken = (token: Frame, tokenName: string, config: Config, primitives: []): Token => {
	return (new SemanticToken(token, tokenName, config, primitives)).extract();
}
  
class Token {
  token: Frame;
  tokenName: string;
  config: Config;
  writeOperation: null | WriteOperation;

  constructor(token: Frame, tokenName: string, config: Config) {
    this.token = token;
    this.tokenName = tokenName;
    this.config = config;
    this.writeOperation = null;
  }

	//Runs the extraction process. Separated from constructor to allow subclasses
	//to call super without triggering [primitive] token extractTokens.
	public extract():Token {
		const processedToken = this.extractTokens(this.token, this.tokenName, this.config);
    this.setWriteOperation(processedToken, this.tokenName);
		return this;
	}

  private extractTokens(frame: Frame, tokenName: string, config: Config): ProcessedToken {
    try {
      if (!frame || !tokenName) throw Error(ErrorExtractTokens);
			
      frame.children = this.getChildren(frame);
      return this.getTokens(frame, tokenName.toLowerCase(), config);
    } catch (error: any) {
      throw Error(error);
    }
  }

  private getChildren = (frame: Frame): any => {
    if (frame.children && frame.children.length > 0) {
      return frame.children.filter((item: Frame) => {
        let shouldInclude = true;

        // Filter out elements that contain ignore keywords in their name
        for (let i = 0; i < ignoreElementsKeywords.length; i++) {
          const keywordToIgnore = ignoreElementsKeywords[i];

          if (item.name.toLowerCase().indexOf(keywordToIgnore) >= 0 || item.name[0] === '_') {
            shouldInclude = false;
            break;
          }
        }

        return shouldInclude;
      });
    }
  };

  protected getTokens = (frame: Frame, name: string, config: Config): any => {
    const {
      borderWidthUnit,
      camelizeTokenNames,
      fontUnit,
      letterSpacingUnit,
      lineHeightUnit,
      opacitiesUnit,
      outputFormatColors,
      radiusUnit,
      remSize,
      shadowUnit,
      spacingUnit,
      unitlessPrecision,
      usePostscriptFontNames
    } = config;
    const tokenOperations = {
      borderwidths: () =>
        makeBorderWidthTokens(frame, borderWidthUnit, remSize, camelizeTokenNames),
      color: () => makeColorTokens(frame, outputFormatColors, camelizeTokenNames),
      colors: () => makeColorTokens(frame, outputFormatColors, camelizeTokenNames),
      delays: () => makeDelayTokens(frame, camelizeTokenNames),
      durations: () => makeDurationTokens(frame, camelizeTokenNames),
      easings: () => makeEasingTokens(frame, camelizeTokenNames),
      fontfamilies: () => {
        if (!config) throw Error(ErrorExtractTokensNoConfig);
        return makeFontTokens(frame, usePostscriptFontNames, camelizeTokenNames);
      },
      fontsizes: () => {
        if (!config) throw Error(ErrorExtractTokensNoConfig);
        return makeFontSizeTokens(frame, fontUnit, remSize, camelizeTokenNames);
      },
      fontweights: () => makeFontWeightTokens(frame, camelizeTokenNames),
      letterspacings: () => {
        if (!config) throw Error(ErrorExtractTokensNoConfig);
        return makeLetterSpacingTokens(frame, letterSpacingUnit, camelizeTokenNames);
      },
      lineheights: () =>
        makeLineHeightTokens(frame, remSize, unitlessPrecision, lineHeightUnit, camelizeTokenNames),
      mediaqueries: () => makeMediaQueryTokens(frame, camelizeTokenNames),
      opacities: () => {
        if (!config) throw Error(ErrorExtractTokensNoConfig);
        return makeOpacityTokens(frame, opacitiesUnit, camelizeTokenNames);
      },
      radii: () => makeRadiusTokens(frame, radiusUnit, remSize, camelizeTokenNames),
      shadows: () => makeShadowTokens(frame, shadowUnit, remSize, camelizeTokenNames),
      spacing: () => {
        if (!config) throw Error(ErrorExtractTokensNoConfig);
        return makeSpacingTokens(frame, spacingUnit, remSize, camelizeTokenNames);
      },
      mobilespacing: () => {
        if (!config) throw Error(ErrorExtractTokensNoConfig);
        return makeSpacingTokens(frame, spacingUnit, remSize, camelizeTokenNames);
      },
      zindices: () => makeZindexTokens(frame, camelizeTokenNames)
    };

    // @ts-ignore
    if (tokenOperations.hasOwnProperty(name)) return tokenOperations[name]();
  };

  setWriteOperation = (processedToken: ProcessedToken, tokenName: string):void => {
    this.writeOperation = {
      type: 'token',
      file: processedToken,
      path: this.config.outputFolderTokens,
      name: tokenName,
      format: this.config.outputFormatTokens,
      overwrite: this.config.overwrite
    };
  };

  getWriteOperation = (): WriteOperation | null => {
    if (this.writeOperation) return this.writeOperation;
    return null;
  };
}

class SemanticToken extends Token {
	primitives:[];

	constructor(token: Frame, tokenName: string, config: Config, primitives:[]) {
		super(token,tokenName,config);
		this.primitives = primitives;
		//Alternative to class level to primitives is to pass primitives through 
		//extractTokens to getTokens. Didn't seem worth it to provide an 
		//extractTokens override just to do that.
  }

  protected getTokens = (frame: Frame, name: string, config: Config): any => {
		const {
      borderWidthUnit,
      camelizeTokenNames,
      fontUnit,
      letterSpacingUnit,
      lineHeightUnit,
      opacitiesUnit,
      outputFormatColors,
      radiusUnit,
      remSize,
      shadowUnit,
      spacingUnit,
      unitlessPrecision,
      usePostscriptFontNames
    } = config;
		
    const tokenOperations = {
    	semanticcolors: () => {
				//Get the color primitives object for the keys (i.e., token names) so we can
				//check that the primitive referenced by the semantic token exists.
				const colorPrimitives = this.primitives.find((tokenType:any)=>{
					return (tokenType.name==="colors");
				});
				if (colorPrimitives===undefined) {
					throw Error(ErrorMakeColorTokensNoPrimitive);
				}
				let colorByThemes:any = {};
				if (!frame.children) throw Error(ErrorMakeColorTokensNoFrame);
				let themes = frame.children.reverse();
				themes.forEach((f:Frame)=>{
					if (f.type==="FRAME" && f.name.startsWith("theme/")) {
						colorByThemes[(f.name.substring(6))]=makeSemanticColorTokens(
							f, outputFormatColors, colorPrimitives, camelizeTokenNames);
					}
				});
				return colorByThemes;
			},
			semanticdesktoptypography: ()=>{
				if (this.primitives===undefined) {
					throw Error(ErrorMakeColorTokensNoPrimitive);
				}
				if (!frame.children) throw Error(ErrorMakeFontTokensNoFrame);
				return makeSemanticFontTokens(frame,this.primitives,outputFormatColors,
																			camelizeTokenNames);
			},
			semanticmobiletypography: ()=>{
				return makeSemanticFontTokens(frame,this.primitives,outputFormatColors,
																			camelizeTokenNames);
			}
    };
    // @ts-ignore
    if (tokenOperations.hasOwnProperty(name)) return tokenOperations[name]();
  };
}