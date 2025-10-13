import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const SidebarContainer = styled.aside`
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    position: fixed;
    height: 100%;
    z-index: 1000;
    transform: translateX(-100%);

    /* MODIFICADO: usa a prop transiente '$isOpen' */
    ${props => props.$isOpen && `
      transform: translateX(0);
    `}
  }
`;

export const Logo = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
  cursor: pointer;
`;

export const NavList = styled.ul`
  list-style: none;
  padding: 0;
  flex-grow: 1;
`;

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

  &.active {
    background-color: #007bff;
    font-weight: bold;
  }
`;