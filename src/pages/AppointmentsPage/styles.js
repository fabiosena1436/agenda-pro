import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const AppointmentCard = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  /* Lógica para mudar a cor da borda com base na propriedade 'status' */
  border-left: 5px solid ${props => {
    if (props.status === 'completed') return '#28a745'; // Verde
    if (props.status === 'cancelled') return '#6c757d'; // Cinza
    return '#007bff'; // Azul Padrão
  }};
`;

export const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  h3 {
    margin: 0;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const CardActions = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;