import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
  Grid,
  TextField,
  CircularProgress,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useStakeholder } from '../../../../hooks/client-admin/useEsgStakeholder';

interface StakeholderData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  group: {
    id: string;
    name: string;
  };
  is_registered: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  last_login: string | null;
}

const StakeholderManagement: React.FC = () => {
  const {
    stakeholderListOpen,
    addStakeholderOpen,
    newStakeholder,
    stakeholdersData,
    stakeholdersLoading,
    isCreating,
    isRemoving,
    selectedGroupInvitation,
    handleStakeholderListOpen,
    handleAddStakeholderOpen,
    handleNewStakeholderUpdate,
    handleAddStakeholder,
    handleRemoveStakeholder,
    handleCopyInviteLink,
  } = useStakeholder();

  return (
    <>
      {/* Stakeholder List Modal */}
      <Dialog 
        open={stakeholderListOpen} 
        onClose={() => handleStakeholderListOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Kernteam</Typography>
          <IconButton onClick={() => handleStakeholderListOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Leo senectus etiam mattis facilisi purus viverra pellentesque nam. Viverra sapien quisque dolor 
            augue proin amet consectetur nibh urna. Condimentum donec diam faucibus vulputate dui enim 
            eu. Orci pharetra feugiat gravida facilisi eu integer eu.
          </Typography>

          <Typography variant="h6" sx={{ mb: 1, color: '#026770' }}>
            Management
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button 
              variant="text" 
              onClick={() => handleAddStakeholderOpen(true)}
              sx={{ color: '#026770' }}
            >
              User manuell anlegen
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCopyInviteLink}
              disabled={!selectedGroupInvitation}
              sx={{ 
                backgroundColor: '#026770',
                '&:hover': { backgroundColor: '#024f57' }
              }}
            >
              Einladungslink kopieren
            </Button>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Einladung bereits angenommen:
          </Typography>

          {stakeholdersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <MuiTable>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Vorname</TableCell>
                    <TableCell>Nachname</TableCell>
                    <TableCell>E-Mail Adresse</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Angemeldet am</TableCell>
                    <TableCell align="center">Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakeholdersData?.results && stakeholdersData.results.length > 0 ? (
                    stakeholdersData.results.map((stakeholder: StakeholderData) => (
                      <TableRow key={stakeholder.id}>
                        <TableCell>{stakeholder.first_name || '-'}</TableCell>
                        <TableCell>{stakeholder.last_name || '-'}</TableCell>
                        <TableCell>{stakeholder.email}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 'medium',
                              textAlign: 'center',
                              backgroundColor: 
                                stakeholder.status === 'approved' ? '#e8f5e8' :
                                stakeholder.status === 'pending' ? '#fff3cd' : '#f8d7da',
                              color:
                                stakeholder.status === 'approved' ? '#2e7d32' :
                                stakeholder.status === 'pending' ? '#856404' : '#721c24'
                            }}
                          >
                            {stakeholder.status === 'approved' ? 'Genehmigt' :
                             stakeholder.status === 'pending' ? 'Ausstehend' : 'Abgelehnt'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {stakeholder.last_login 
                            ? new Date(stakeholder.last_login).toLocaleDateString('de-DE')
                            : '-'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            size="small" 
                            onClick={() => handleRemoveStakeholder(stakeholder.id)}
                            disabled={isRemoving}
                            sx={{ color: '#026770', minWidth: 'auto' }}
                          >
                            ✕ Entfernen
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Keine Stakeholder gefunden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </MuiTable>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stakeholder Modal */}
      <Dialog 
        open={addStakeholderOpen} 
        onClose={() => handleAddStakeholderOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User manuell anlegen</Typography>
          <IconButton onClick={() => handleAddStakeholderOpen(false)}>
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
                onChange={(e) => handleNewStakeholderUpdate('first_name', e.target.value)}
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
                onChange={(e) => handleNewStakeholderUpdate('last_name', e.target.value)}
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
                onChange={(e) => handleNewStakeholderUpdate('email', e.target.value)}
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
                    onChange={(e) => handleNewStakeholderUpdate('send_invitation', e.target.checked)}
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
                    onChange={(e) => handleNewStakeholderUpdate('send_login_link', e.target.checked)}
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
          <Button onClick={() => handleAddStakeholderOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddStakeholder}
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
    </>
  );
};

export default StakeholderManagement;