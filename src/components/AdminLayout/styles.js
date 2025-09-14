import styled from 'styled-components';

export const LayoutContainer = styled.div`
  display: flex; /* A mágica acontece aqui! Isso coloca os itens lado a lado. */
  min-height: 100vh; /* Garante que o layout ocupe a altura inteira da tela */
`;

export const MainContent = styled.main`
  flex: 1; /* Faz esta área ocupar todo o espaço restante */
  padding: 30px;
  background-color: #f0f2f5; /* Cor de fundo do conteúdo principal */
`;