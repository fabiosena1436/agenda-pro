import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
`;

export const Form = styled.form`
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

export const Section = styled.section`
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 10px;
  }

  h2 {
    margin-bottom: 20px;
    font-size: 1.5rem;
  }
`;

export const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px 15px;
  margin-bottom: 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.2s ease-in-out;
  font-family: 'Lato', 'Helvetica', sans-serif;
  resize: vertical;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

export const DayRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
`;

export const DayLabel = styled.label`
  font-weight: bold;
  width: 100px;
`;

export const TimeInput = styled.input`
  width: 100px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const InputGroup = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 20px;

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  input[type="color"] {
    width: 60px;
    height: 40px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: transparent;
  }
`;

export const UploadSection = styled(Section)`
  margin-top: 30px;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-top: 1px solid #eee;
`;

export const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

export const BlockedTimeCard = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

export const BlockedTimeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
  margin-bottom: 8px;
`;

export const BlockedTimeActions = styled.div`
  margin-top: 10px;
  text-align: right;
`;

export const IntervalsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

export const IntervalRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const AddButton = styled.button`
  background: none;
  border: 1px dashed #007bff;
  color: #007bff;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 5px;

  &:hover {
    background: #e7f3ff;
  }
`;

export const RemoveButton = styled.button`
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f1b0b7;
  }
`;