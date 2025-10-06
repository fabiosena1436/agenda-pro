import styled, { createGlobalStyle } from 'styled-components';

// Global styles for this page to control the body background
export const BookingPageTheme = createGlobalStyle`
  body {
    background-color: ${props => props.theme.backgroundColor || '#f0f2f5'};
    transition: background-color 0.3s ease;
  }
`;

// Main container for the entire page content
export const PageContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden; /* Important for keeping rounded corners with the banner */
`;

// A new wrapper for the Header and BusinessInfo to allow overlapping
export const HeaderWrapper = styled.div`
  position: relative;
  text-align: center;
`;

// The banner image
export const Header = styled.header`
  background-image: url(${props => props.bgImage || 'https://via.placeholder.com/800x200.png/6c757d/FFFFFF?Text=Banner'});
  background-size: cover;
  background-position: center;
  height: 220px;
  background-color: #6c757d; // A fallback color
`;

// The section with Logo and Business Name
export const BusinessInfo = styled.div`
  /* This is the magic for overlapping the logo */
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

// A new wrapper for the services list and title
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

export const ServiceCard = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  h3 {
    color: ${props => props.theme.primaryColor || '#007bff'};
    margin-bottom: 8px;
  }

  p {
    color: #6c757d;
    font-size: 0.9rem;
  }
`;

// A new Footer component
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

// Styles for the modal content (no major changes needed)
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