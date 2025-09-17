import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
`;

// ADICIONE ESTE NOVO BLOCO DE CÓDIGO
export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px; // Define uma largura máxima para o formulário
  padding: 20px;
`;