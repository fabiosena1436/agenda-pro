import styled from 'styled-components';

// Usamos uma função para verificar as propriedades (props) do botão
export const StyledButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  /* Se a prop 'danger' for verdadeira, a cor é vermelha, senão, é azul */
  background-color: ${props => (props.danger ? '#dc3545' : '#007bff')};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    /* Muda a cor do hover também com base na prop */
    background-color: ${props => (props.danger ? '#c82333' : '#0056b3')};
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;