import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const BusinessTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    font-size: 0.9rem;
  }

  th {
    background-color: #f0f2f5;
    font-weight: 600;
    color: #333;
  }

  tr:hover {
    background-color: #f8f9fa;
  }

  @media (max-width: 900px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    width: 100%;
  }
`;

export const ActionsCell = styled.td`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 250px;
`;

export const BlockStatus = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  background-color: ${props => props.$isBlocked ? '#ffdddd' : '#ddffdd'};
  color: ${props => props.$isBlocked ? '#cc0000' : '#009900'};
`;

export const PlanSelector = styled.select`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 5px;
  font-size: 0.8rem;
`;