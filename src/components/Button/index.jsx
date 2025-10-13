import React from 'react';
import { StyledButton } from './styles';

export default function Button({ children, danger, ...props }) {
  // Passamos a prop como '$danger' para o styled-component
  return (
    <StyledButton $danger={danger} {...props}>
      {children}
    </StyledButton>
  );
}