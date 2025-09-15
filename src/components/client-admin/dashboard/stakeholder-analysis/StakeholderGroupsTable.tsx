import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Switch,
  Typography,
  Chip
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';

interface StakeholderGroup {
  id: string | number;
  display_name: string;
  stakeholder_count: number;
  is_global: boolean;
  has_responses: boolean;
  show_in_table: boolean;
  is_default?: boolean;
  invitation_link: string;
}

interface StakeholderGroupsTableProps {
  stakeholderGroups: StakeholderGroup[];
  onGroupToggle: (group: StakeholderGroup) => void;
  onCopyInvitationLink: (invitation_link: string | number) => void;
  onStakeholderListOpen: (groupId: string | number) => void;
  isGroupChecked: (group: StakeholderGroup) => boolean;
  isGroupToggleDisabled: (group: StakeholderGroup) => boolean;
}

const StakeholderGroupsTable: React.FC<StakeholderGroupsTableProps> = ({
  stakeholderGroups,
  onGroupToggle,
  onCopyInvitationLink,
  onStakeholderListOpen,
  isGroupChecked,
  isGroupToggleDisabled
}) => {
  return (
    <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f8f9fa' }}>
            <TableCell sx={{ fontWeight: 600 }}>Stakeholder-Gruppe</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Anzahl Stakeholder</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>In Chart anzeigen</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stakeholderGroups.map((group) => (
            group.show_in_table && (
              <TableRow hover key={group.id}>
                <TableCell>
                  <Typography 
                    sx={{ 
                      fontWeight: group.is_default ? 600 : 400,
                      cursor: 'pointer',
                      color: '#026770',
                    }}
                    onClick={() => onStakeholderListOpen(group.id)}
                  >
                    {group.display_name}
                  </Typography>
                  {group.is_global && (
                    <Chip label="Standard" size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                  )}
                  {!group.has_responses && (
                    <Chip label="no response" size="small" color="warning" variant="outlined" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell>{group.stakeholder_count}</TableCell>
                <TableCell>
                  <Switch
                    checked={isGroupChecked(group)}
                    onChange={() => onGroupToggle(group)}
                    disabled={isGroupToggleDisabled(group)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    // variant="outlined"
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => onCopyInvitationLink(group.invitation_link)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Einladungslink kopieren
                  </Button>
                </TableCell>
              </TableRow>
            )
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StakeholderGroupsTable;