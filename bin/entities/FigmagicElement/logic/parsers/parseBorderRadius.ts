import { ParsedElementMetadataInterface } from '../../../../contracts/ParsedElementMetadataInterface';
import { OutputFormatColors } from '../../../../contracts/Config';

import { getTokenMatch } from '../getTokenMatch';
import { updateParsing } from './updateParsing';

import { ErrorParseBorderRadius } from '../../../../frameworks/errors/errors';

type BorderRadiusParams = {
  radii: Record<string, unknown>;
  borderRadius: string;
  remSize: number;
  outputFormatColors: OutputFormatColors;
};

export function parseBorderRadius(
  css: string,
  imports: any[],
  params: BorderRadiusParams
): ParsedElementMetadataInterface {
  try {
    if (!css || !imports || !params) throw Error(ErrorParseBorderRadius);

    const { radii, borderRadius, remSize, outputFormatColors } = params;

    const { updatedCss, updatedImports } = getTokenMatch(
      radii,
      'radii',
      'border-radius',
      borderRadius,
      remSize,
      outputFormatColors
    );

    return updateParsing(css, updatedCss, imports, updatedImports);
  } catch (error: any) {
    throw Error(error);
  }
}
