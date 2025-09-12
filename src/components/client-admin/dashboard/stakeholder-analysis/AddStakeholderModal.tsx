import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface NewStakeholder {
  first_name: string;
  last_name: string;
  email: string;
  send_invitation: boolean;
  send_login_link: boolean;
}

interface AddStakeholderModalProps {
  open: boolean;
  onClose: () => void;
  newStakeholder: NewStakeholder;
  onNewStakeholderChange: (stakeholder: NewStakeholder) => void;
  onAddStakeholder: () => void;
  isCreating: boolean;
}

const AddStakeholderModal: React.FC<AddStakeholderModalProps> = ({
  open,
  onClose,
  newStakeholder,
  onNewStakeholderChange,
  onAddStakeholder,
  isCreating
}) => {
  const handleInputChange = (field: keyof NewStakeholder, value: string | boolean) => {
    onNewStakeholderChange({
      ...newStakeholder,
      [field]: value
    });
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    onAddStakeholder();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">User manuell anlegen</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fügen Sie einen neuen Stakeholder zur ausgewählten Gruppe hinzu. Eine E-Mail-Adresse ist erforderlich.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Vorname
            </Typography>
            <TextField
              fullWidth
              placeholder="Vorname eingeben"
              value={newStakeholder.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              variant="outlined"
              size="medium"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Nachname
            </Typography>
            <TextField
              fullWidth
              placeholder="Nachname eingeben"
              value={newStakeholder.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              variant="outlined"
              size="medium"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              E-Mail Adresse *
            </Typography>
            <TextField
              fullWidth
              placeholder="E-Mail Adresse eingeben"
              value={newStakeholder.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              variant="outlined"
              size="medium"
              type="email"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="send_invitation"
                  checked={newStakeholder.send_invitation}
                  onChange={(e) => handleInputChange('send_invitation', e.target.checked)}
                />
                <label htmlFor="send_invitation" style={{ marginLeft: 8, fontSize: '0.875rem' }}>
                  Einladung senden
                </label>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="send_login_link"
                  checked={newStakeholder.send_login_link}
                  onChange={(e) => handleInputChange('send_login_link', e.target.checked)}
                />
                <label htmlFor="send_login_link" style={{ marginLeft: 8, fontSize: '0.875rem' }}>
                  Login-Link senden
                </label>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>
          Abbrechen
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!newStakeholder.email || isCreating}
          sx={{ 
            backgroundColor: '#026770',
            '&:hover': { backgroundColor: '#024f57' }
          }}
        >
          {isCreating ? <CircularProgress size={20} color="inherit" /> : 'User anlegen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStakeholderModal;