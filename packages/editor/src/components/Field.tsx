import * as React from 'react';
import { styled } from '../stitches.config';

export const Field = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

export const FieldLabel = styled('label', {
  marginBottom: '$1',
});

export const FieldInput = styled('input', {});
