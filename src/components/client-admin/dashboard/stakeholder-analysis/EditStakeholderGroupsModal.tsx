import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, ContentCopy as CopyIcon } from '@mui/icons-material';

interface StakeholderGroup {
  id: string | number;
  display_name: string;
  is_default?: boolean;
  is_global: boolean;
  has_responses: boolean;
  invitation_link: string;
}

interface EditStakeholderGroupsModalProps {
  open: boolean;
  onClose: () => void;
  stakeholderGroups: StakeholderGroup[];
  newStakeholderGroup: string;
  isCreatingGroup: boolean;
  onNewStakeholderGroupChange: (value: string) => void;
  onCreateStakeholderGroup: () => void;
  onGroupToggleShowInTable: (group: StakeholderGroup, check: boolean) => void;
  onCopyInvitationLink: (groupId: string | number) => void;
  onSubmitTableChanges: () => void;
  isGroupShowInTable: (group: StakeholderGroup) => boolean;
}

const EditStakeholderGroupsModal: React.FC<EditStakeholderGroupsModalProps> = ({
  open,
  onClose,
  stakeholderGroups,
  newStakeholderGroup,
  isCreatingGroup,
  onNewStakeholderGroupChange,
  onCreateStakeholderGroup,
  onGroupToggleShowInTable,
  onCopyInvitationLink,
  onSubmitTableChanges,
  isGroupShowInTable
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Stakeholder-Gruppen bearbeiten</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verwalten Sie Ihre Stakeholder-Gruppen und deren Sichtbarkeit in der Analyse.
        </Typography>

        {/* Create New Group */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Neue Stakeholder-Gruppe erstellen
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Name der Stakeholder-Gruppe eingeben"
              value={newStakeholderGroup}
              onChange={(e) => onNewStakeholderGroupChange(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={onCreateStakeholderGroup}
              disabled={!newStakeholderGroup.trim() || isCreatingGroup}
            >
              {isCreatingGroup ? <CircularProgress size={20} color="inherit" /> : 'Gruppe anlegen'}
            </Button>
          </Box>
        </Box>

        {/* Groups List */}
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell>Stakeholder-Gruppe</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stakeholderGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Switch
                      checked={isGroupShowInTable(group)}
                      onChange={() => onGroupToggleShowInTable(group, isGroupShowInTable(group))}
                      disabled={group.is_global || !group.has_responses}
                      size="small"
                    />
                    <Typography sx={{ fontWeight: group.is_default ? 600 : 400 }}>
                      {group.display_name}
                    </Typography>
                    {group.is_default && (
                      <Chip label="Kernteam" size="small" color="primary" variant="outlined" />
                    )}
                    {!group.has_responses && (
                      <Chip label="no responses" size="small" color="warning" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={() => onCopyInvitationLink(group.invitation_link)}
                    >
                      Einladungslink kopieren
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>
          Abbrechen 
        </Button>
        <Button variant="contained" onClick={onSubmitTableChanges}>
          Übernehmen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditStakeholderGroupsModal;