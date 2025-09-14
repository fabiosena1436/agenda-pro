import styled from 'styled-components';

export const PageContainer = styled.div` /* ... seu PageContainer ... */ `;
export const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 30px;
`;
export const PlanCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
`;
export const PlanFeatures = styled.ul`
  list-style: none;
  margin: 20px 0;
  flex-grow: 1;
  li { margin-bottom: 10px; }
`;