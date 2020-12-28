import { styled } from '../stitches.config';

export const Field = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

export const FieldLabel = styled('label', {
  marginBottom: '$1',
});

export const FieldInput = styled('input', {
  paddingLeft: '$3',
  paddingRight: '$3',
  paddingTop: '$2',
  paddingBottom: '$2',
  border: 'none',
  backgroundColor: '$white',
  color: '$black',
  borderRadius: 8,

  ':focus': {
    outline: 'none',
    boxShadow: 'inset 0 0 0 2px #fff, inset 0 0 0 4px #202020',
  },
});

export const FieldInputGroup = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  '& > *': {
    flex: '1 0 0',
  },
  '& > * + *': {
    marginLeft: '$1',
  },
});

export const FieldCurrentValue = styled('span', {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '0.9em',
});
