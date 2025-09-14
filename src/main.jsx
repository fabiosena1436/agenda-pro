import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext'; // <-- IMPORTA AQUI
import 'react-datepicker/dist/react-datepicker.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* <-- ADICIONA O AUTHPROVIDER AQUI */}
      <BrowserRouter>
        <GlobalStyles />
        <App />
      </BrowserRouter>
    </AuthProvider> {/* <-- E AQUI */}
  </React.StrictMode>,
);