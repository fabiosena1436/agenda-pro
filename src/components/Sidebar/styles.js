import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const SidebarContainer = styled.aside`
  width: 250px;
  background-color: #2c3e50;
  /* ... resto do seu estilo ... */
  display: flex;
  flex-direction: column;
  padding: 20px;
  transition: transform 0.3s ease-in-out; /* Adiciona uma transição suave */

  /* ADICIONE O CÓDIGO ABAIXO */
  @media (max-width: 768px) {
    position: fixed; /* Fica "flutuando" na tela */
    height: 100%;
    z-index: 1000;
    transform: translateX(-100%); /* Começa escondido para a esquerda */

    /* Se ele tiver a propriedade isOpen, ele aparece */
    ${props => props.isOpen && `
      transform: translateX(0);
    `}
  }
`;

export const Logo = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
`;

export const NavList = styled.ul`
  list-style: none;
  padding: 0;
  flex-grow: 1; /* Faz a lista de links ocupar o espaço disponível */
`;

// Criamos um estilo para o NavLink, que é um componente especial do React Router
export const NavItem = styled(NavLink)`
  display: block;
  color: #ecf0f1;
  text-decoration: none;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #34495e;
  }

  /* Esta é a mágica! O NavLink adiciona a classe 'active' automaticamente
     ao link da página que está aberta no momento. */
  &.active {
    background-color: #007bff;
    font-weight: bold;
  }
`;