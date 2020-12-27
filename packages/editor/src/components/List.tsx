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
  border: `1px solid $black`,
  color: `$white`,
  textAlign: 'left',
  fontFamily: 'inherit',
  variants: {
    state: {
      default: {},
      selected: {
        backgroundColor: '$highlight',
      },
    },
  },
});
