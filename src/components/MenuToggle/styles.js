import styled from 'styled-components';

export const ToggleButton = styled.button`
  display: none; /* Escondido por padrão */
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1100; /* Fica na frente de tudo */
  background: #34495e;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-around;
  padding: 8px;

  span {
    display: block;
    width: 100%;
    height: 3px;
    background: white;
    border-radius: 3px;
  }

  /* A mágica acontece aqui: em telas com 768px de largura ou menos, o botão aparece */
  @media (max-width: 768px) {
    display: flex;
  }
`;