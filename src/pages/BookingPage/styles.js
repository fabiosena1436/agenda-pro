import styled, { createGlobalStyle } from 'styled-components';

export const BookingPageTheme = createGlobalStyle`
  body {
    background-color: ${props => props.theme.backgroundColor || '#f0f2f5'};
    transition: background-color 0.3s ease;
  }
`;

export const PageContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;

export const HeaderWrapper = styled.div`
  position: relative;
  text-align: center;
`;

export const Header = styled.header`
  background-image: url(${props => props.bgImage || 'https://via.placeholder.com/800x200.png/6c757d/FFFFFF?Text=Banner'});
  background-size: cover;
  background-position: center;
  height: 220px;
  background-color: #6c757d;
`;

export const BusinessInfo = styled.div`
  margin-top: -75px; 

  img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 5px solid #ffffff;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    object-fit: cover;
  }

  h1 {
    margin-top: 10px;
    font-size: 2.5rem;
    color: #343a40;
  }
`;

export const ContentWrapper = styled.div`
  padding: 30px;
  
  h2 {
    text-align: center;
    margin-bottom: 25px;
    font-size: 1.8rem;
    color: #495057;
  }
`;

export const ServiceList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
`;

// --- ServiceCard TOTALMENTE REDESENHADO ---
export const ServiceCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Garante que a imagem respeite as bordas arredondadas */

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

export const ServiceImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  background-color: #f8f9fa; /* Cor de fundo para placeholders */
`;

export const ServiceContent = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Faz esta área crescer para empurrar os botões para baixo */

  h3 {
    color: ${props => props.theme.primaryColor || '#007bff'};
    margin-bottom: 8px;
  }

  p {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 15px;
  }

  div {
    margin-top: auto; /* A mágica acontece aqui: empurra os botões para o fundo */
    display: flex;
    gap: 10px;
  }
`;


export const Footer = styled.footer`
  background-color: #343a40;
  color: #f8f9fa;
  text-align: center;
  padding: 25px;
  margin-top: 30px;

  p {
    margin: 0;
    line-height: 1.7;
  }
`;

export const TimeSlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
  margin-top: 20px;
`;

export const TimeSlot = styled.button`
  padding: 10px;
  border: 1px solid ${props => props.theme.primaryColor || '#007bff'};
  background-color: #fff;
  color: ${props => props.theme.primaryColor || '#007bff'};
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  font-weight: bold;

  &:hover, &:focus {
    background-color: ${props => props.theme.primaryColor || '#007bff'};
    color: ${props => props.theme.textColor || '#fff'};
    outline: none;
  }
`;

export const GalleryModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 70vh;
  overflow-y: auto;
  margin-top: 20px;
`;

export const GalleryImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
`;