import { styled } from '../stitches.config';

export const Button = styled('button', {
  backgroundColor: 'gainsboro',
  borderRadius: 9999,
  fontSize: 13,
  lineHeight: '1',
  fontWeight: 500,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 16,
  paddingRight: 16,
  border: 0,

  ':hover': {
    opacity: 0.9,
  },
  ':active': {
    opacity: 1,
  },
  ':focus': {
    outline: 'none',
    boxShadow: '0 0 0 2px yellow',
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
