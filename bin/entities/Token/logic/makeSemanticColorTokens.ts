import { FRAME as Frame } from '../../../contracts/Figma';
import { ColorTokens } from '../../../contracts/Tokens';
import { OutputFormatColors } from '../../../contracts/Config';
import { sanitizeString } from '../../../frameworks/string/sanitizeString';
import { createSolidColorString } from '../../../frameworks/string/createSolidColorString';

import {
  ErrorMakeColorTokensNoFrame,
  ErrorMakeColorTokensNoChildren,
	ErrorMakeColorTokensNoPrimitive
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma color frames into a clean object
 */
export function makeSemanticColorTokens(
  colorFrame: Frame,
  outputFormatColors: OutputFormatColors,
	allPrimitiveTokens:object[],
  camelizeTokenNames?: boolean
): ColorTokens {
  if (!colorFrame) throw Error(ErrorMakeColorTokensNoFrame);
  if (!colorFrame.children) throw Error(ErrorMakeColorTokensNoChildren);

	//Get the color primitives object for the keys (i.e., token names) so we can
	//check that the primitive referenced by the semantic token exists.
	const colorPrimitives:any = allPrimitiveTokens.find((tokenType:any)=>{
		return (tokenType.name==="colors");
	});
	if (colorPrimitives===undefined) throw Error(ErrorMakeColorTokensNoPrimitive);

	//console.log("[colorPrimitives]",colorPrimitives.file);

  const colors: Record<string, unknown> = {};
  const TOKENS = colorFrame.children.reverse();
	//TODO: Only process $ prefaced items
  TOKENS.forEach((item: Frame) => {
		if (item.name.startsWith("$")) {
			makeSemColorToken(item, colors, outputFormatColors, 
												colorPrimitives, camelizeTokenNames);
		}
	});

  return colors;
}

function makeSemColorToken(item:Frame, colors: Record<string,unknown>,
		outputFormatColors: OutputFormatColors, 
		colorPrimitives:any,
		camelizeTokenNames?: boolean) {

	function getKeyByValue(object:any, value:string):string|undefined {
		return Object.keys(object).find(key => object[key] === value);
	} 

	const NAME = sanitizeString(item.name, camelizeTokenNames);
	//TODO: Find the color of the item. Look up the hex in the values of the
	//colorPrimitives const
	if (!item.fills || item.fills.length === 0) return null;
	const FILLS = item.fills[0];
	
	if (item.fills[0].type === 'SOLID') {
		const colorVal = createSolidColorString(FILLS, outputFormatColors);
		//console.log("[makeSemColorToken]",colorPrimitives);
		//console.log("[makeSemColorToken]",colorVal);
		const collectionName = colorPrimitives.name;
		const colorKey =  getKeyByValue(colorPrimitives.file,colorVal);
		if (colorKey===undefined) {
			return null;
		}
		else {
			colors[NAME]=`${collectionName}.${colorKey}`;
		}
	}

	console.log("[makeSemColorToken] "+colors[NAME]);
}

/*
 {
  type: 'token',
  file: {
    black: 'rgba(51, 51, 51, 1)',
    white: 'rgba(255, 255, 255, 1)',
    gray1: 'rgba(79, 79, 79, 1)',
    gray2: 'rgba(130, 130, 130, 1)',
    gray3: 'rgba(189, 189, 189, 1)',
    gray4: 'rgba(224, 224, 224, 1)',
    gray5: 'rgba(242, 242, 242, 1)',
    neon: 'rgba(228, 255, 193, 1)',
    red: 'rgba(235, 87, 87, 1)',
    orange: 'rgba(242, 153, 74, 1)',
    yellow: 'rgba(242, 201, 76, 1)',
    blue1: 'rgba(47, 128, 237, 1)',
    blue2: 'rgba(45, 156, 219, 0.9)',
    blue3: 'rgba(86, 204, 242, 0.8)',
    green1: 'rgba(33, 150, 83, 1)',
    green2: 'rgba(39, 174, 96, 1)',
    green3: 'rgba(111, 207, 151, 1)'
  },
  path: 'tokens',
  name: 'colors',
  format: 'ts',
  overwrite: {
    css: false,
    description: false,
    graphic: false,
    react: false,
    storybook: false,
    styled: false
  }
}
*/