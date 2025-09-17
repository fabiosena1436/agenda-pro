import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
`;

export const FormSection = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const ServicesListSection = styled.div`
  h2 {
    margin-bottom: 20px;
  }
`;

export const ServiceItem = styled.div`
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;