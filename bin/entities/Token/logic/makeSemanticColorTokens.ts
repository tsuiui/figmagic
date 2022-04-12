import { FRAME as Frame } from '../../../contracts/Figma';
import { ColorTokens } from '../../../contracts/Tokens';
import { OutputFormatColors } from '../../../contracts/Config';
import { sanitizeString } from '../../../frameworks/string/sanitizeString';
import { createSolidColorString } from '../../../frameworks/string/createSolidColorString';
import {
  ErrorMakeColorTokensNoFrame,
  ErrorMakeColorTokensNoChildren
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma color frames into a clean object
 */
export function makeSemanticColorTokens(
  colorFrame: Frame,
  outputFormatColors: OutputFormatColors,
	colorPrimitives:object,
  camelizeTokenNames?: boolean
): ColorTokens {
  if (!colorFrame) throw Error(ErrorMakeColorTokensNoFrame);
  if (!colorFrame.children) throw Error(ErrorMakeColorTokensNoChildren);

  const colors: Record<string, unknown> = {};
  const TOKENS = colorFrame.children.reverse();
	//Only process $ prefaced items
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

	if (!item.fills || item.fills.length === 0) return null;

	const NAME = sanitizeString(item.name, camelizeTokenNames);
	const FILLS = item.fills[0];

	//Find the color of the item. Look up the hex in the values of the
	//colorPrimitives const
	if (item.fills[0].type === 'SOLID') {
		const colorVal = createSolidColorString(FILLS, outputFormatColors);
		const collectionName = colorPrimitives.name;
		const colorKey =  getKeyByValue(colorPrimitives.file,colorVal);
		if (colorKey===undefined) {
			return null;
		}
		else {
			colors[NAME]=`${collectionName}.${colorKey}`;
		}
	}
}