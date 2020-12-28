import { styled } from '../stitches.config';

export const List = styled('ul', {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
});

export const ListItem = styled('li', {
  padding: '$3',
  backgroundColor: '$glass',
  border: `none`,
  color: `$white`,
  textAlign: 'left',
  fontFamily: 'inherit',

  ':focus': {
    boxShadow: '0 0 0 2px #fff, 0 0 0 4px #202020',
    outline: 'none',
    border: 'none',
  },

  variants: {
    state: {
      default: {},
      selected: {
        backgroundColor: '$highlight',
      },
    },
  },
});
