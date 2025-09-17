import styled from 'styled-components';

export const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

export const Header = styled.header`
  background-image: url(${props => props.bgImage || ''}); /* <-- MODIFIQUE AQUI */
  background-size: cover;
  background-position: center;
  background-color: #ddd; 
  height: 200px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
`;

export const BusinessInfo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

export const ServiceList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

export const ServiceCard = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
`;
export const TimeSlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

// NOVO ESTILO
export const TimeSlot = styled.button`
  padding: 10px;
  border: 1px solid #007bff;
  background-color: #fff;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #007bff;
    color: #fff;
  }
`;