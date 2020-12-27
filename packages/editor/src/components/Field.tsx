import { styled } from '../stitches.config';

export const Field = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

export const FieldLabel = styled('label', {
  marginBottom: '$1',
});

export const FieldInput = styled('input', {});

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
