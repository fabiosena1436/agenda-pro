import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const ModalBackdrop = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
});

export const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  width: '100%',
  maxWidth: '500px',
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));
