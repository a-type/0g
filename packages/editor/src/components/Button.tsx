import { styled } from '../stitches.config';

export const Button = styled('button', {
  backgroundColor: '$white',
  color: '$black',
  borderRadius: 8,
  fontSize: 13,
  lineHeight: '1',
  fontWeight: 500,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 16,
  paddingRight: 16,
  border: 0,
  fontFamily: 'inherit',

  ':hover': {
    opacity: 0.9,
  },
  ':active': {
    opacity: 1,
  },
  ':focus': {
    outline: 'none',
    boxShadow: 'inset 0 0 0 2px #fff, inset 0 0 0 4px #202020',
  },

  '& + &': {
    marginLeft: 8,
  },

  variants: {
    size: {
      small: {
        fontSize: 10,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 8,
        paddingRight: 8,
      },
    },
  },
});
