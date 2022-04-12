import { FRAME as Frame } from '../../../contracts/Figma';
import { FontTokens } from '../../../contracts/Tokens';
import { OutputFormatColors } from '../../../contracts/Config';
import { sanitizeString } from '../../../frameworks/string/sanitizeString';
import { createSolidColorString } from '../../../frameworks/string/createSolidColorString';
import { 	
	ErrorMakeFontTokensNoFrame, 
	ErrorMakeFontTokensNoChildren 
} from '../../../frameworks/errors/errors';

/**
 * @description Places all Figma color frames into a clean object
 */

/*
{
  id: '3915:787',
  name: '$headingPage',
  type: 'TEXT',
  blendMode: 'PASS_THROUGH',
  absoluteBoundingBox: { x: 35, y: 987, width: 264, height: 54 },
  constraints: { vertical: 'TOP', horizontal: 'LEFT' },
  fills: [ { blendMode: 'NORMAL', type: 'SOLID', color: [Object] } ],
  strokes: [],
  strokeWeight: 1,
  strokeAlign: 'OUTSIDE',
  styles: { fill: '1:100', text: '2875:14' },
  effects: [],
  characters: 'Page heading',
  style: {
    fontFamily: 'Inter',											//fontFamilies
    fontPostScriptName: null,
    fontWeight: 400,													//fontWeights
    textAutoResize: 'WIDTH_AND_HEIGHT',
    fontSize: 40,															//fontSize/16 = REM size
    textAlignHorizontal: 'LEFT',
    textAlignVertical: 'TOP',
    letterSpacing: 0,													//letterSpacings
    lineHeightPx: 54,
    lineHeightPercent: 115.19999694824219,
    lineHeightPercentFontSize: 135,						//lineHeights*100
    lineHeightUnit: 'FONT_SIZE_%'
  },
  layoutVersion: 3,
  characterStyleOverrides: [],
  styleOverrideTable: {},
  lineTypes: [ 'NONE' ],
  lineIndentations: [ 0 ]
}
*/
export function makeSemanticFontTokens(
  fontFrame: Frame,
  camelizeTokenNames?: boolean
): FontTokens {
	//TODO: Throw a
  if (!fontFrame) throw Error(ErrorMakeFontTokensNoFrame);
	if (!fontFrame.children) throw Error(ErrorMakeFontTokensNoChildren);

  const colors: Record<string, unknown> = {};
  const TOKENS = fontFrame.children.reverse();
	//Only process $ prefaced items
  TOKENS.forEach((item: Frame) => {
		if (item.name.startsWith("$")) {
			console.log("[makeSemanticFontTokens]",item);
			// makeSemFontToken(item, colors, outputFormatColors, 
			// 									colorPrimitives, camelizeTokenNames);
		}
	});
  return colors;
}

function makeSemFontToken(item:Frame, colors: Record<string,unknown>,
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