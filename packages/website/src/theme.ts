import { Theme } from '@emotion/react';

export const theme: Theme = {
  colors: {
    background: '#202020',
    text: '#fff',
    gray: '#404060',
    textInverse: '#202020',
    backgroundInverse: '#fff',
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256],
  fonts: {
    body: 'Menlo, monospace',
    heading: '"Major Mono Display", monospace',
  },
  radius: {
    control: 8,
    surface: 16,
  },
  focusRing: {
    primary: `0 0 0 2px #202020, 0 0 0 4px #fff`,
  },
};

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      background: string;
      text: string;
      gray: string;
      textInverse: string;
      backgroundInverse: string;
    };
    space: number[];
    fonts: {
      body: string;
      heading: string;
    };
    radius: {
      control: number;
      surface: number;
    };
    focusRing: {
      primary: string;
    };
  }
}
