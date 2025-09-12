import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface Stakeholder {
  id: string | number;
  first_name?: string;
  last_name?: string;
  email: string;
  status: string;
  last_login?: string | null;
}

interface StakeholderListModalProps {
  open: boolean;
  onClose: () => void;
  onAddStakeholderOpen: () => void;
  groupStakeholders: Stakeholder[];
  isLoading: boolean;
  onRemoveStakeholder: (stakeholder: Stakeholder) => void;
  isRemoving: boolean;
}

const StakeholderListModal: React.FC<StakeholderListModalProps> = ({
  open,
  onClose,
  onAddStakeholderOpen,
  groupStakeholders,
  isLoading,
  onRemoveStakeholder,
  isRemoving
}) => {
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { text: string; style: React.CSSProperties }> = {
      'approved': {
        text: 'Genehmigt',
        style: {
          backgroundColor: '#e8f5e8',
          color: '#2e7d32'
        }
      },
      'pending': {
        text: 'Ausstehend',
        style: {
          backgroundColor: '#fff3cd',
          color: '#856404'
        }
      },
      'rejected': {
        text: 'Abgelehnt',
        style: {
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }
      }
    };

    const statusInfo = statusMap[status] || { text: status, style: {} };
    
    return (
      <Box
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 'medium',
          textAlign: 'center',
          ...statusInfo.style
        }}
      >
        {statusInfo.text}
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Stakeholder Verwaltung</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verwalten Sie die Stakeholder in dieser Gruppe.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="text" 
            onClick={onAddStakeholderOpen}
            sx={{ color: '#026770' }}
          >
            User manuell anlegen
          </Button>
        </Box>

        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Stakeholder in dieser Gruppe:
        </Typography>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Vorname</TableCell>
                <TableCell>Nachname</TableCell>
                <TableCell>E-Mail Adresse</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : groupStakeholders && groupStakeholders.length > 0 ? (
                groupStakeholders.map((stakeholder) => (
                  <TableRow key={stakeholder.id}>
                    <TableCell>{stakeholder.first_name || '-'}</TableCell>
                    <TableCell>{stakeholder.last_name || '-'}</TableCell>
                    <TableCell>{stakeholder.email}</TableCell>
                    <TableCell>
                      {getStatusDisplay(stakeholder.status)}
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        onClick={() => onRemoveStakeholder(stakeholder)}
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
                  <TableCell colSpan={5} align="center">
                    Keine Stakeholder gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderListModal;