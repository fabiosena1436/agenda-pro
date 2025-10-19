import styled from 'styled-components';
import { motion } from 'framer-motion';

export const PageContainer = styled.div`
  background-color: #f0f2f5;
  min-height: 100vh;
`;

export const HeaderWrapper = styled.div`
  background: linear-gradient(to right, #6a11cb, #2575fc);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
`;

export const Header = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
`;

export const BusinessInfo = styled.div`
  margin-top: -60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: ${props => props.$bannerUrl
    ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${props.$bannerUrl})`
    : 'white'};
  background-size: cover;
  background-position: center;
  color: ${props => props.$bannerUrl ? 'white' : 'inherit'};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 2;

  h2, p {
    color: ${props => props.$bannerUrl ? 'white' : 'inherit'};
    text-shadow: ${props => props.$bannerUrl ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'};
  }

  a {
    color: ${props => props.$bannerUrl ? 'white' : '#4a4a4a'} !important;
  }
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  a {
    color: #4a4a4a;
    font-size: 1.8rem;
    transition: color 0.3s ease, transform 0.3s ease;
    &:hover {
      color: #007bff;
      transform: scale(1.1);
    }
  }
`;

export const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  background-color: white;
  border-radius: 50px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: max-content;
  margin-left: auto;
  margin-right: auto;
`;

export const TabButton = styled.button`
  padding: 0.8rem 1.8rem;
  border: none;
  background: ${props => props.$active ? 'linear-gradient(to right, #6a11cb, #2575fc)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#333'};
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  
  &:hover {
    background-color: ${props => !props.$active && '#f0f0f0'};
  }
`;

export const ContentWrapper = styled.div`
  padding: 0 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const SearchBar = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
  }
`;

export const ServiceList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

export const ServiceCard = styled(motion.div)`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
`;

export const ServiceImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

export const ServiceInfo = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
  }
  
  p {
    margin: 0;
    color: #666;
    flex-grow: 1;
  }
`;

export const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #333;
  font-weight: 500;
`;

export const DetailsContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  
  h3 {
    margin-top: 0;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.5rem;
    margin-bottom: 1.5rem; /* Aumentado o espaçamento */
    font-size: 1.4rem; /* Um pouco maior */
    color: #333; 
  }

  p {
    line-height: 1.6;
    color: #555;
    margin-bottom: 1.5rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
    li {
      padding: 0.75rem 0;
      border-bottom: 1px dashed #eee; /* Linha tracejada para separação sutil */
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
      
      &:last-child {
        border-bottom: none;
      }

      strong {
        color: #333;
        min-width: 120px;
        font-weight: 700;
      }
    }
  }
`;

export const TimeSlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

export const TimeSlot = styled.button`
  padding: 0.8rem;
  border: 1px solid ${props => props.selected ? '#007bff' : '#ccc'};
  background-color: ${props => props.selected ? '#007bff' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007bff;
    color: ${props => !props.selected && '#007bff'};
  }
`;

export const GalleryModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

export const GalleryImage = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 15px rgba(0,0,0,0.15);
  }
`;

export const DatePickerWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  
  .react-datepicker {
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

export const BookingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
  }
`;

export const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease, color 0.3s ease;

  &.primary {
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  }

  &.secondary {
    background-color: #f0f0f0;
    color: #333;
    &:hover {
      background-color: #e0e0e0;
    }
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
`;

export const ConfirmationWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
`;

export const ConfirmationCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
`;

export const SuccessIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(to right, #1d976c, #93f9b9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
`;

export const ConfirmationHeader = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

export const ConfirmationMessage = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
`;

export const BookingDetails = styled.div`
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
`;

export const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1rem;
  
  span:first-child {
    font-weight: 600;
    color: #555;
  }
  
  span:last-child {
    color: #333;
  }
`;

export const DetailCtaButton = styled(Button)`
  margin-top: 2rem;
  width: 100%;
  font-size: 1.1rem;
  padding: 15px 24px;
`;