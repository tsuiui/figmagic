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


/*
Array of objects returned from processTokens:
[
  {
    type: 'token',
    file: {
      wide: '1920px',
      desktopLg: '1440px',
      desktopMd: '1180px',
      tabletMax: '1024px',
      tabletMin: '768px',
      mobileMax: '767px',
      mobileLg: '580px',
      mobileMd: '480px',
      mobileSm: '320px'
    },
    path: 'tokens',
    name: 'mediaQueries',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { short: 0.15, medium: 0.25, long: 0.6, veryLong: 1 },
    path: 'tokens',
    name: 'delays',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { short: 0.15, medium: 0.25, long: 0.6, veryLong: 1 },
    path: 'tokens',
    name: 'durations',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { transparent: 0, semiOpaque: 0.5, disabled: 0.65, opaque: 1 },
    path: 'tokens',
    name: 'opacities',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: {
      soft: '0px 0px 5px rgba(196, 196, 196, 1)',
      medium: '0px 0px 5px rgba(0, 0, 0, 0.5)',
      deep: '3px 3px 3px rgba(196, 196, 196, 0.75)',
      deepMulti: '0px 0px 4px rgba(0, 0, 0, 0.17), 0px 0px 20px rgba(0, 0, 0, 0.1)'
    },
    path: 'tokens',
    name: 'shadows',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { hairline: '1px', regular: '2px', fat: '4px', chunky: '8px' },
    path: 'tokens',
    name: 'borderWidths',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { hard: '0px', rounded: '4px', soft: '8px', circle: '100px' },
    path: 'tokens',
    name: 'radii',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { regular: 0, high: 1, higher: 2, focus: 10, top: 100 },
    path: 'tokens',
    name: 'zIndices',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { regular: '0em', wide: '0.05em', tight: '-0.045em' },
    path: 'tokens',
    name: 'letterSpacings',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: {
      light: 'Helvetica Neue',
      regular: 'Helvetica Neue',
      medium: 'Helvetica Neue',
      bold: 'Helvetica Neue'
    },
    path: 'tokens',
    name: 'fontFamilies',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { l: '1.65', m: '1.45', s: '1.35', xs: '1.00' },
    path: 'tokens',
    name: 'lineHeights',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: { light: 300, regular: 400, medium: 500, bold: 700 },
    path: 'tokens',
    name: 'fontWeights',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: {
      tiny: '0.5rem',
      small: '1rem',
      medium: '2rem',
      big: '3rem',
      large: '4rem',
      huge: '6rem'
    },
    path: 'tokens',
    name: 'spacing',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
  {
    type: 'token',
    file: {
      h1: '3rem',
      h2: '2.5rem',
      h3: '2rem',
      h4: '1.625rem',
      h5: '1.25rem',
      h6: '1.125rem',
      paragraph: '1rem',
      sub: '0.75rem'
    },
    path: 'tokens',
    name: 'fontSizes',
    format: 'ts',
    overwrite: {
      css: false,
      description: false,
      graphic: false,
      react: false,
      storybook: false,
      styled: false
    }
  },
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
]
*/