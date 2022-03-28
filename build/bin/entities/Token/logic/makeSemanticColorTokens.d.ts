import { FRAME as Frame } from '../../../contracts/Figma';
import { ColorTokens } from '../../../contracts/Tokens';
import { OutputFormatColors } from '../../../contracts/Config';
export declare function makeSemanticColorTokens(colorFrame: Frame, outputFormatColors: OutputFormatColors, allPrimitiveTokens: object[], camelizeTokenNames?: boolean): ColorTokens;
