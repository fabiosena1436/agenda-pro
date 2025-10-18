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

export const ModalContent = styled(Box)(({ theme, size }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: size === 'large' ? 0 : theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  width: 'auto',
  maxWidth: size === 'large' ? '95vw' : '500px',
  maxHeight: size === 'large' ? '95vh' : 'auto',
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(2),
    padding: size === 'large' ? 0 : theme.spacing(2),
  },
  '& .image-gallery-content.fullscreen': {
    backgroundColor: 'black',
  },
}));
