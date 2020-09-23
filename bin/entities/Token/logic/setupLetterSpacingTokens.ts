import { FRAME as Frame } from '../../../contracts/Figma';
import { LetterSpacingTokens } from '../../../contracts/Tokens';

import { camelize } from '../../../frameworks/string/camelize';

import {
  ErrorSetupLetterSpacingTokensNoFrame,
  ErrorSetupLetterSpacingTokensNoChildren,
  ErrorSetupLetterSpacingTokensMissingProps
} from '../../../frameworks/errors/errors';

export const makeLetterSpacingTokens = (
  frame: Frame,
  letterSpacingUnit: string
): LetterSpacingTokens => setupLetterSpacingTokens(frame, letterSpacingUnit);

/**
 * @description Places all Figma letter spacings into a clean object
 *
 * Figma allows to provide (in the Figma document itself) letterSpacing in either "%" or "px".
 * The API internally converts the provided value in a number, which is the calculated value based on the font-size (no unit is provided, but the value corresponds to px)
 * Ex: if the font-size is 32px and the letterSpacing 4%, the exported value from the API will be 32 * 4 / 100 = 1.28.
 * In CSS however, the letter-spacing length allows either "px" or "em" units (or even "rem" even though it hardly make any sense for letter-spacing in practice):
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing
 *
 */
function setupLetterSpacingTokens(
  letterSpacingFrame: Frame,
  letterSpacingUnit: string
): LetterSpacingTokens {
  if (!letterSpacingFrame) throw new Error(ErrorSetupLetterSpacingTokensNoFrame);
  if (!letterSpacingFrame.children) throw new Error(ErrorSetupLetterSpacingTokensNoChildren);

  const TOKENS = letterSpacingFrame.children;

  // Reduce the children array to a tokens object
  const letterSpacings = TOKENS.reduce(
    (tokens: { [index: string]: any }, item: Frame) => {
      if (!item.name || !item.style) throw new Error(ErrorSetupLetterSpacingTokensMissingProps);

      const NAME = camelize(item.name);

      // Assuming Figma API always export the node font-size as an integer in our case
      // https://www.figma.com/plugin-docs/api/TextNode/#fontsize
      const fontSize = item.style.fontSize;
      const letterSpacingValueInPx =
        typeof item.style.letterSpacing !== 'undefined'
          ? // Round the value to 2 decimals
            Math.round(item.style.letterSpacing * 1000) / 1000
          : // if no letter-spacing is defined, set it to 0 by default (no letter-spacing)
            0;
      // actual token value to set
      let value = '0';

      switch (letterSpacingUnit) {
        case 'px':
          // value is already calculated, we just need to add the "px" unit
          value = `${letterSpacingValueInPx}px`;
          break;
        case 'em':
        default:
          // em conversion: rebase on the current font-size
          if (!fontSize) {
            throw new Error(ErrorSetupLetterSpacingTokensMissingProps);
          }
          // Figma already converted the value to a relative px value
          // Dividing the value by the current fontSize will give the %-based em value.
          // Ex: if the letterSpacing value is 1.28 and fontSize is 32, em value should be 1.28 / 32 = 0.04em.
          const valueCalc = Math.round((1000 * letterSpacingValueInPx) / fontSize) / 1000;
          value = `${valueCalc}em`;
          break;
      }

      tokens[NAME] = value;

      return tokens;
    },
    // Initial shape: just an empty object
    {}
  );

  // @ts-ignore
  return letterSpacings as LetterSpacingTokens;
}
