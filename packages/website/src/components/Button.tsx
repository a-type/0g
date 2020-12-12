import styled from '@emotion/styled';

export const Button = styled.button((props) => ({
  backgroundColor: props.theme.colors.backgroundInverse,
  color: props.theme.colors.textInverse,
  paddingLeft: props.theme.space[3],
  paddingRight: props.theme.space[3],
  paddingTop: props.theme.space[2],
  paddingBottom: props.theme.space[2],
  borderRadius: props.theme.radius.control,
  fontFamily: props.theme.fonts.body,
  fontSize: 18,
  verticalAlign: 'center',
  textAlign: 'center',

  transition: '0.2s ease all',

  border: 'none',

  '&:active': {
    transform: 'scale(0.9)',
  },
  '&:focus': {
    outline: 'none',
    boxShadow: props.theme.focusRing.primary,
  },
}));
