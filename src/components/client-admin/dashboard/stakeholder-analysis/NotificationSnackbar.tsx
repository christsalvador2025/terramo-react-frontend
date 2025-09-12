import { Snackbar, Alert } from '@mui/material';

interface NotificationSnackbarProps {
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  onClose: () => void;
}

export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  snackbar,
  onClose
}) => {
  return (
    <Snackbar 
      open={snackbar.open} 
      autoHideDuration={4000} 
      onClose={onClose}
    >
      <Alert severity={snackbar.severity} onClose={onClose}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;