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

	//These correspond to the format described at:
	//https://mui.com/material-ui/customization/palette/#providing-the-colors-directly
	//In Figma there are separate tokens for each (e.g., $alertDark, $alertLight, 
	//$aletContrastText) that correspond to a similarly named token without any
	//MUI suffixes (e.g., $alert). The un-suffixed value is automatically created
	//as the "main" color described in the MUI docs.
	const MUI_SUFFIXES:string[] = ["Dark","Light","ContrastText"];

	function isMuiToken(tname:string) {
		let isMui:boolean = false;
		MUI_SUFFIXES.forEach((s)=>{
			if (tname.endsWith(s)) isMui=true;
		});
		return isMui;
	}

	//Find the "main" token (not suffixed with main) given any of the MUI standard
	//properties that are suffixes in Bungalow
	//ctaSurface: { <-- ctaSurface is the main token name
	//  main: {value of ctaSurface token}
	//  light: {value of ctaSurfaceLight},
  //  dark: {value of ctaSurfaceDark},
	//  contrastText: {value of ctaSurfaceContrastText}
	//}
	function getTokenName(tname:string):string {
		let tokenName:string = tname;
		MUI_SUFFIXES.forEach((s)=>{
			if (tname.endsWith(s)) {
				tokenName = tname.substring(0,tname.indexOf(s));
			}
		});
		return tokenName;
	}

	//Gets the mui color property associated with specific token suffixes
	function getMuiColorProp(tname:string):string {
		let propName:string = "main";
		MUI_SUFFIXES.forEach((s)=>{
			if (tname.endsWith(s)) {
				propName = sanitizeString(s,camelizeTokenNames);
			}
		});
		return propName;		
	}

	const colors: Record<string, unknown> = {};
	//Key is a token name without MUI specific suffixes of (main, dark, light, contrastText)
	//Value is an object containing 1-3 keys of dark, light, contrastText and their
	//respective values. 
	const muiColorDictionary:Record<string,Record<string,unknown>> = {};

  const TOKENS = colorFrame.children.reverse();
	
  TOKENS.forEach((item: Frame) => {
		//Only process $ prefaced items in the Semantic Colors frame of the file
		if (item.name.startsWith("$")) {
			const NAME = sanitizeString(item.name, camelizeTokenNames);
			//Build an object with main, light, dark, contrastText properties if 
			//the token name ends with one of the magic MUI suffixes.
			if (isMuiToken(NAME)) {
				const mainName:string = getTokenName(NAME);
				let wipTokenObj:Record<string,unknown> = {};
				//Add a record to the dictionary to store light, dark, contrastText if
				//it doesn't exist...
				if (!muiColorDictionary.hasOwnProperty(mainName)) {
					muiColorDictionary[mainName] = wipTokenObj;
				}
				//...otherwise keep building on the old record.
				wipTokenObj = muiColorDictionary[mainName];
				wipTokenObj[getMuiColorProp(NAME)]=parseSemanticColorToken(
					item,outputFormatColors,colorPrimitives,camelizeTokenNames);
				//Place updated token object back into dictionary for reuse if needed
				muiColorDictionary[mainName] = wipTokenObj;
			}
			//Build a "flat" single color value token
			else {
				//Assign direct reference to color primitive to token
				const NAME = sanitizeString(item.name, camelizeTokenNames);
				colors[NAME] = parseSemanticColorToken(
					item,outputFormatColors,colorPrimitives,camelizeTokenNames);
			}
		}
	});
	
	//Merge the contents of muiColorDictionary with colors.
	for (let colorkey in colors) {	
		//Not a key needing to be associated with the MUI object.
		if (!muiColorDictionary.hasOwnProperty(colorkey)) continue;
		let obj:Record<string,unknown> = muiColorDictionary[colorkey];
		//If there are dark, light, or contrastText values then make a main to 
		//complete the MUI palette object.
		obj["main"] = colors[colorkey];
		muiColorDictionary[colorkey] = obj;
		//What was a color string is now an object with main, dark, light,
		//contastText properties
		colors[colorkey] = muiColorDictionary[colorkey];
	}

  return colors;
}

function parseSemanticColorToken(item:Frame, 
	outputFormatColors: OutputFormatColors, 
	colorPrimitives:any, camelizeTokenNames?: boolean):string|null {
		if (!item.fills || item.fills.length === 0) return null;

		//Given an object of key/values and a value, return the corresponding key;
		function getKeyByValue(object:any, value:string):string|undefined {
			return Object.keys(object).find(key => object[key] === value);
		} 
		
		const NAME = sanitizeString(item.name, camelizeTokenNames);
		const FILLS = item.fills[0];
	
		//Find the color of the item. Look up the hex in the values of the
		//colorPrimitives const
		if (item.fills[0].type === 'SOLID') {
			const colorVal = createSolidColorString(FILLS, outputFormatColors);
			const collectionName = colorPrimitives.name;
			const colorKey = getKeyByValue(colorPrimitives.file,colorVal);
		
			if (colorKey===undefined) {
				return null;
			}
			else {
				return `${collectionName}.${colorKey}`;
			}
		}
		return null;
}