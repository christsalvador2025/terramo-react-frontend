import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';

interface ConfirmRemoveDialogProps {
  open: boolean;
  stakeholderName?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isRemoving: boolean;
}

export const ConfirmRemoveDialog: React.FC<ConfirmRemoveDialogProps> = ({
  open,
  stakeholderName,
  onCancel,
  onConfirm,
  isRemoving
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Stakeholder entfernen?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Möchten Sie {stakeholderName ? <strong>{stakeholderName}</strong> : 'diesen Stakeholder'} wirklich entfernen?
          Diese Aktion kann nicht rückgängig gemacht werden.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Abbrechen</Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={isRemoving}
        >
          {isRemoving ? <CircularProgress size={18} color="inherit" /> : 'Entfernen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmRemoveDialog;