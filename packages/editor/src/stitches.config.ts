import { createStyled } from '@stitches/react';

export const { styled, css } = createStyled({
  // prefix: '0g', // doesn't work
  tokens: {
    colors: {
      $white: '#fff',
      $black: '#202020',
      $highlight: '#a0a0a0',
      $glass: 'rgba(32, 32, 32, 0.5)',
    },
    space: {
      $1: '4px',
      $2: '8px',
      $3: '12px',
      $4: '16px',
      $5: '20px',
      $6: '24px',
      $7: '28px',
      $8: '32px',
    },
    fonts: {
      $mono: 'monospace',
    },
    fontWeights: {},
    fontSizes: {},
    lineHeights: {},
    letterSpacings: {},
    sizes: {},
    borderWidths: {
      $normal: '1px',
      $thick: '2px',
    },
    radii: {},
    shadows: {},
    zIndices: {},
    transitions: {},
  },
  breakpoints: {
    md: (rule) => `@media (max-width: 900px) { ${rule} }`,
    sm: (rule) => `@media (max-width: 720px) { ${rule} }`,
  },
});
