import styled from 'styled-components';

export const FooterContainer = styled.footer`
  background-color: #212529; /* Cor escura */
  color: #f8f9fa; /* Texto claro */
  padding: 3rem 2rem;
  margin-top: 4rem;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  h3 {
    color: #fff;
    border-bottom: 1px solid #495057;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }

  p {
    color: #ced4da;
  }
`;

export const WorkingHoursList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #343a40;

    &:last-child {
      border-bottom: none;
    }

    strong {
      color: #e9ecef;
    }

    span {
      color: #adb5bd;
    }
  }
`;
