import { FRAME as Frame } from '../../../contracts/Figma';
import { FontTokens, Tokens } from '../../../contracts/Tokens';
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
export function makeSemanticFontTokens(
  fontFrame: Frame,
	primitives: [],
	outputFormatColors:OutputFormatColors,
  camelizeTokenNames?: boolean
): FontTokens {
  if (!fontFrame) throw Error(ErrorMakeFontTokensNoFrame);
	if (!fontFrame.children) throw Error(ErrorMakeFontTokensNoChildren);

  const typography: Record<string, unknown> = {};
  const TOKENS = fontFrame.children.reverse();
	//Only process $ prefaced items
  TOKENS.forEach((item: Frame) => {
		if (item.name.startsWith("$")) {
			makeSemFontToken(item, typography, primitives, outputFormatColors);
		}
	});
  return typography;
}

function makeSemFontToken(item:Frame, typography: Record<string,unknown>,
		primitives:[], outputFormatColors: OutputFormatColors, 
		camelizeTokenNames?: boolean) {

	function getKeyByValue(object:any, value:string):string|undefined {
		return Object.keys(object).find(key => object[key] === value);
	}

	function getTokenFile(name:string):any {
		const tokenStruct:any = primitives.find((f:any)=>{
			return f.name===name;
		});
		return tokenStruct;
	}

	if (!item.fills || item.fills.length === 0) return null;
	//NAME is the item name. 
	const NAME = sanitizeString(item.name, camelizeTokenNames);
	const STYLE = item.style;
	const fonts = getTokenFile("fontFamilies");
	const weights = getTokenFile("fontWeights");
	const sizes = getTokenFile("fontSizes");
	const lineHeights = getTokenFile("lineHeights");
	//Enable if we use letterSpacings
	//const letterSpacings = getTokenFile("letterSpacings"); 

	//A type style includes a number of properties that each should be referencing
	//the appropriate primitive token.
	
	//Create size token reference
	//Go to REM; do not assume 16px; this needs config somewhere
	const sizeVal = (STYLE.fontSize/16).toString()+"rem";
	let sizeKey = getKeyByValue(sizes.file,sizeVal);
	if (sizeKey!==undefined) {
		typography[NAME+"Size"]=`${sizes.name}.${sizeKey}`;
	}

	//Create font family token reference
	let fontKey = getKeyByValue(fonts.file,STYLE.fontFamily);
	if (fontKey!==undefined) {
		typography[NAME+"Font"]=`${fonts.name}.${fontKey}`;
	}

	//Create font weights token reference
	let weightsKey = getKeyByValue(weights.file,STYLE.fontWeight);
	if (weightsKey!==undefined) {
		typography[NAME+"Weight"]=`${weights.name}.${weightsKey}`;
	}

	//Create line height token reference
	//lineHeightPercentFontSize can have very minor precision differences that
	//prevent a successful lookup so get the number to a fixed length. 
	let heightsKey = getKeyByValue(lineHeights.file,
		(STYLE.lineHeightPercentFontSize/100).toPrecision(3).toString());
	if (heightsKey!==undefined) {
		typography[NAME+"LineHeight"]=`${lineHeights.name}.${heightsKey}`;
	}
}