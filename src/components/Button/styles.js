import styled from 'styled-components';

export const StyledButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.theme.textColor || '#fff'};
  /* MODIFICADO: usa a prop transiente '$danger' */
  background-color: ${props => (props.$danger ? '#dc3545' : (props.theme.primaryColor || '#007bff'))};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    /* MODIFICADO: usa a prop transiente '$danger' */
    background-color: ${props => (props.$danger ? '#c82333' : (props.theme.hoverColor || '#0056b3'))};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;