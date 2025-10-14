import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './contexts/AuthContext'; // <-- IMPORTA AQUI
import 'react-datepicker/dist/react-datepicker.css';

// MUI imports
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './styles/theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider> {/* <-- ADICIONA O AUTHPROVIDER AQUI */}
          <BrowserRouter>
            <GlobalStyles />
            <App />
          </BrowserRouter>
        </AuthProvider> {/* <-- E AQUI */}
      </LocalizationProvider>
    </ThemeProvider>
  </React.StrictMode>,
);