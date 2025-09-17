import styled from 'styled-components';

export const StyledInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;