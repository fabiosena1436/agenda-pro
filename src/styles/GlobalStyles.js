import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background-color: #f8f9fa; /* Um cinza mais suave que o branco total */
    font-family: 'Lato', 'Helvetica', sans-serif;
    color: #212529; /* Um preto mais suave */
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Montserrat', 'Arial', sans-serif;
    font-weight: 700;
  }

  /* Mobile first approach */

  /* Tablet */
  @media (min-width: 768px) {
    body {
      font-size: 16px;
    }
  }

  /* Desktop */
  @media (min-width: 1024px) {
    body {
      font-size: 18px;
    }
  }
`;