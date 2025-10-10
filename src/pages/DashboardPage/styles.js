// src/pages/DashboardPage/styles.js

import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

// NOVO: Caixa que envolve a funcionalidade de partilha de link
export const LinkShareContainer = styled.div`
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
  text-align: center;
  // Adicionado para centralizar a caixa na página
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

// NOVO: O campo que mostra o link de facto
export const LinkDisplay = styled.div`
  font-size: 1rem;
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 5px;
  border: 1px solid #ccc;
  word-wrap: break-word; // Garante que o link não quebra o layout
  margin-bottom: 15px;
  color: #333; // Adicionada cor para garantir a legibilidade
`;