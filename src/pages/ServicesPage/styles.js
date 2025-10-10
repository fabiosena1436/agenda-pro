import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const FormSection = styled.div`
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const ServicesListSection = styled.div`
  h2 {
    margin-bottom: 20px;
  }
`;

export const ServiceItem = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; // Allows wrapping on smaller screens
  gap: 15px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const ServiceInfo = styled.div`
  flex-grow: 1;
`;

export const ServiceActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap; // Allows wrapping on smaller screens
`;


// --- NOVOS ESTILOS PARA A GALERIA ---

export const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* Creates a square aspect ratio */
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  line-height: 1;

  &:hover {
    background-color: #dc3545;
  }
`;

export const UploadLabel = styled.label`
  display: inline-block;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #0056b3;
  }
`;