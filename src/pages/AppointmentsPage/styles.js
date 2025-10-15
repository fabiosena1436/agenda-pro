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
  flex-wrap: wrap; // Garante que os botões quebrem a linha em telas pequenas
  gap: 10px;
`;

// --- NOVOS ESTILOS PARA O MODAL DE REAGENDAMENTO ---

export const DatePickerWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  
  .react-datepicker {
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

export const TimeSlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;
`;

export const TimeSlot = styled.button`
  padding: 0.7rem;
  border: 1px solid ${props => props.selected ? '#007bff' : '#ccc'};
  background-color: ${props => props.selected ? '#007bff' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    color: ${props => !props.selected && '#007bff'};
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
`;