import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
`;

export const Form = styled.form`
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const DayRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

export const DayLabel = styled.label`
  font-weight: bold;
  width: 120px;
`;

export const TimeInput = styled.input`
  width: 100px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin: 0 10px;
`;

export const UploadSection = styled.div`
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #eee;
`;

export const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;