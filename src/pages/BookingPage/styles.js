import styled, { createGlobalStyle } from 'styled-components';

export const BookingPageTheme = createGlobalStyle`
  body {
    background-color: ${props => props.theme.backgroundColor || '#f0f2f5'};
    transition: background-color 0.3s ease;
  }
`;

export const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: #ffffff;
`;

export const HeaderWrapper = styled.div`
  position: relative;
  text-align: center;
  padding-bottom: 20px;
  background-color: #fff;
`;

export const Header = styled.header`
  background-image: url(${props => props.bgImage || 'https://via.placeholder.com/800x200.png/6c757d/FFFFFF?Text=Banner'});
  background-size: cover;
  background-position: center;
  height: 200px;
  background-color: #6c757d;
`;

export const BusinessInfo = styled.div`
  margin-top: -75px; 
  position: relative;
  z-index: 2;

  img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 5px solid #ffffff;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    object-fit: cover;
  }
`;

export const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;

  a {
    font-size: 36px;
    color: #495057;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.theme.primaryColor || '#007bff'};
    }
  }
`;

export const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #dee2e6;
  margin: 0;
  background-color: #fff;
`;

export const TabButton = styled.button`
  padding: 15px 20px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: ${props => props.active ? props.theme.primaryColor : '#6c757d'};
  border-bottom: 3px solid ${props => props.active ? props.theme.primaryColor : 'transparent'};
  transition: all 0.2s ease-in-out;
`;

export const ContentWrapper = styled.div`
  padding: 20px;
  background-color: #fff;
`;

export const SearchBar = styled.input`
  width: 100%;
  padding: 12px 20px;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 25px;
  margin-bottom: 25px;
  outline: none;

  &:focus {
    border-color: ${props => props.theme.primaryColor};
  }
`;

export const ServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

export const ServiceCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  gap: 15px;
`;

export const ServiceInfo = styled.div`
  flex-grow: 1;

  h3 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    color: #343a40;
  }

  p {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
  }
`;

export const TimeInfo = styled.p`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
  font-size: 0.9rem;
`;

export const DetailsContainer = styled.div`
  padding: 20px;
  line-height: 1.7;

  h3 {
    font-size: 1.2rem;
    color: #343a40;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 8px;
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
  font-weight: bold;
`;

export const GalleryModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

export const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;