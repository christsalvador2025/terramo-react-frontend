import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import Plot from 'react-plotly.js';
import { useYearContext } from "../_terramo-admin-dashboard"; 
import { 
  useGetStakeholderAnalysisDashboardAdminViewQuery,
  useCreateStakeholderGroupMutation,
  useGetGroupStakeholdersTerramoAdminViewQuery,
  useCreateStakeholderESGMutation,
  useRemoveStakeholderESGMutation,
  useCopyStakeholderInvitationLinkESGMutation,
  useUpdateGroupVisibilityMutation
} from '../../lib/redux/features/clients/clientupdatedApiSlice';

const StakeholderAnalysisDashboardTerramoAdminView = () => {
  // Get client ID from URL parameters
  const { id: clientId } = useParams<{ id: string }>();
  
  // Get selected year from context
  const { selectedYear } = useYearContext();

  // API hooks - now using client ID and year
  const { 
    data: stakeholderData, 
    isLoading, 
    error,
    refetch 
  } = useGetStakeholderAnalysisDashboardAdminViewQuery({
    client_id: clientId!,
    year: parseInt(selectedYear)
  }, {
    skip: !clientId // Skip query if no client ID
  });
  
  const [createStakeholderGroup, { isLoading: isCreatingGroup }] = useCreateStakeholderGroupMutation();
  const [createStakeholder, { isLoading: isCreatingStakeholder }] = useCreateStakeholderESGMutation();
  const [removeStakeholder, { isLoading: isRemoving }] = useRemoveStakeholderESGMutation();
  const [copyInvitationLink] = useCopyStakeholderInvitationLinkESGMutation();
  const [updateGroupVisibility] = useUpdateGroupVisibilityMutation();

  // State management
  const [selectedGroups, setSelectedGroups] = useState(new Set<number | string>());
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stakeholderListOpen, setStakeholderListOpen] = useState(false);
  const [addStakeholderOpen, setAddStakeholderOpen] = useState(false);
  const [selectedGroupForStakeholders, setSelectedGroupForStakeholders] = useState<string | number>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [newStakeholderGroup, setNewStakeholderGroup] = useState('');
  const [newStakeholder, setNewStakeholder] = useState({
    first_name: '',
    last_name: '',
    email: '',
    send_invitation: true,
    send_login_link: false
  });

  // Confirm removal dialog state
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; id?: number | string; name?: string }>({ open: false });

  // Get stakeholders for selected group (hook is unconditional; fetching is gated by skip)
  // const { data: groupStakeholdersData, isLoading: isLoadingStakeholders } = useGetGroupStakeholdersQuery(
  //   selectedGroupForStakeholders, 
  //   { skip: !selectedGroupForStakeholders }
  // );
  const { data: groupStakeholdersData, isLoading: isLoadingStakeholders } = useGetGroupStakeholdersTerramoAdminViewQuery(
    {
      groupId: selectedGroupForStakeholders!,
      client_id: clientId // Optional - can be undefined
    },
    { 
      skip: !selectedGroupForStakeholders 
    }
  );
  // Initialize selected groups when data is loaded
  React.useEffect(() => {
    if (stakeholderData?.stakeholder_groups) {
      const defaultGroups = new Set<number | string>();
      stakeholderData.stakeholder_groups.forEach((group: any) => {
        if (group.is_default) defaultGroups.add(group.id);
      });
      setSelectedGroups(defaultGroups);
    }
  }, [stakeholderData]);

  // Helpers to keep toggle logic DRY
  const isGroupToggleDisabled = (group: any) =>
    group.is_default || !group.has_responses || Number(group.stakeholder_count || 0) === 0;

  const isGroupChecked = (group: any) =>
    group.is_default || (!isGroupToggleDisabled(group) && selectedGroups.has(group.id));

  // Create scatter plot: keep this hook BEFORE any early returns
  const createScatterPlot = useMemo(() => {
    const categoryColors: Record<string, string> = {
      'Corporate Governance': '#005959',
      'Environment': '#7ba042',
      'Social': '#b27300'
    };

    type Pt = { x: number; y: number; text: string; category: string; source: string };
    const allDataPoints: Pt[] = [];

    // Add client admin data (always shown if present)
    const qResp = stakeholderData?.question_response;
    if (qResp) {
      Object.entries(qResp).forEach(([categoryName, categoryData]: any) => {
        categoryData?.questions?.forEach((question: any) => {
          if (
            question?.priority != null &&
            question?.status_quo != null &&
            question.priority > 0 &&
            question.status_quo > 0
          ) {
            allDataPoints.push({
              x: question.priority,
              y: question.status_quo,
              text: question.index_code,
              category: String(categoryName),
              source: 'Client Admin'
            });
          }
        });
      });
    }

    // Add selected stakeholder groups data
    stakeholderData?.stakeholder_groups?.forEach((group: any) => {
      const shouldInclude = group.is_default || selectedGroups.has(group.id);
      if (shouldInclude && group.has_responses && group.question_response) {
        Object.entries(group.question_response).forEach(([categoryName, categoryData]: any) => {
          categoryData?.questions?.forEach((question: any) => {
            if (
              question?.priority != null &&
              question?.status_quo != null &&
              question.priority > 0 &&
              question.status_quo > 0
            ) {
              allDataPoints.push({
                x: question.priority,
                y: question.status_quo,
                text: question.index_code,
                category: String(categoryName),
                source: group.name
              });
            }
          });
        });
      }
    });
    
    // Create traces for each category
    const traces = Object.keys(categoryColors).map((category) => {
      const categoryPoints = allDataPoints.filter((p) => p.category === category);
      return {
        x: categoryPoints.map((p) => p.x),
        y: categoryPoints.map((p) => p.y),
        text: categoryPoints.map((p) => p.text),
        mode: 'markers+text',
        type: 'scatter',
        name: category,
        marker: {
          size: 8,
          color: categoryColors[category],
          line: { width: 1, color: 'white' }
        },
        textposition: 'top center',
        textfont: { size: 10, color: categoryColors[category] }
      };
    });

    return {
      data: traces,
      layout: {
        title: 'Wesentlichkeitsmatrix Stakeholder',
        xaxis: { 
          title: 'Priority',
          range: [0, 4.5],
          showgrid: true,
          gridcolor: '#f0f0f0',
          dtick: 1
        },
        yaxis: { 
          title: 'Status Quo',
          range: [0, 4.5],
          showgrid: true,
          gridcolor: '#f0f0f0',
          dtick: 1
        },
        legend: { 
          x: 1.02, 
          y: 0.5,
          bgcolor: 'rgba(255,255,255,0)',
          bordercolor: 'rgba(255,255,255,0)'
        },
        margin: { l: 60, r: 150, t: 60, b: 60 },
        plot_bgcolor: 'white',
        paper_bgcolor: 'white'
      },
      config: { displayModeBar: false }
    };
  }, [stakeholderData, selectedGroups]);

  // Handle missing client ID
  if (!clientId) {
    return (
      <Alert severity="error">
        Client ID not found in URL parameters
      </Alert>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    const msg = (error as any)?.message || 'Unbekannter Fehler';
    console.log('eerrror', error)
    let error_msg = "Error loading stakeholder analysis data"
    if ('status' in error && error.status === 404) {
      error_msg = error?.data.error;
    } 
    return (
      <Alert severity="error">
        {error_msg}
      </Alert>
    );
  }

  if (!stakeholderData) {
    return (
      <Alert severity="warning">
        No stakeholder analysis data available
      </Alert>
    );
  }

  // Handle group selection toggle (guarded)
  const handleGroupToggle = (group: any) => {
    if (isGroupToggleDisabled(group)) return; // Default or no data -> ignore
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group.id)) newSet.delete(group.id);
      else newSet.add(group.id);
      return newSet;
    });
  };

  // Copy invitation link to clipboard
  const handleCopyInvitationLink = async (invitation_link: number | string) => {
    try {
      // const result = await copyInvitationLink({ group_id: groupId }).unwrap();
      await navigator.clipboard.writeText(invitation_link);
      setSnackbar({ open: true, message: 'Einladungslink kopiert!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Fehler beim Kopieren', severity: 'error' });
    }
  };

  // Create new stakeholder group
  const handleCreateStakeholderGroup = async () => {
    if (!newStakeholderGroup.trim()) return;
    try {
      const result = await createStakeholderGroup({ 
        name: newStakeholderGroup.trim(),
        client_id: clientId // Pass client ID
      }).unwrap();
      setNewStakeholderGroup('');
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      refetch(); // Refresh the data
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.data?.error || 'Fehler beim Erstellen der Stakeholder-Gruppe', 
        severity: 'error' 
      });
    }
  };

  // Add new stakeholder
  const handleAddStakeholder = async () => {
    if (!newStakeholder.email.trim() || !selectedGroupForStakeholders) return;

    try {
      const result = await createStakeholder({
        group_id: selectedGroupForStakeholders,
        client_id: clientId, // Pass client ID
        ...newStakeholder
      }).unwrap();
      
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      setNewStakeholder({ first_name: '', last_name: '', email: '', send_invitation: true, send_login_link: false });
      setAddStakeholderOpen(false);
      refetch(); // Refresh the data
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.data?.error || 'Fehler beim Hinzufügen des Stakeholders', 
        severity: 'error' 
      });
    }
  };

  // Remove stakeholder (with confirmation)
  const requestRemoveStakeholder = (stakeholder: any) => {
    const name = `${stakeholder.first_name || ''} ${stakeholder.last_name || ''}`.trim() || stakeholder.email;
    setConfirmRemove({ open: true, id: stakeholder.id, name });
  };

  const cancelRemoveStakeholder = () => setConfirmRemove({ open: false });

  const confirmRemoveStakeholder = async () => {
    if (!confirmRemove.id) return;
    try {
      const result = await removeStakeholder(confirmRemove.id).unwrap();
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      setConfirmRemove({ open: false });
      refetch();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.data?.error || 'Fehler beim Entfernen des Stakeholders', 
        severity: 'error' 
      });
    }
  };

  return (
    <Box>
      {/* Page Header with Client Info and Year */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Stakeholder-Analyse
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
          Client: {stakeholderData.client.name} | Jahr: {stakeholderData.year}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Um Nachhaltigkeit zu erzielen, werden verschiedene Massnahmen eingesetzt. 
          Abhängig vom Unternehmen sind manche wichtiger, manche weniger.
        </Typography>
      </Box>

      {/* Stakeholder Groups Table */}
      <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600 }}>Stakeholder-Gruppe</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Daten verfügbar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Anzahl Stakeholder</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>In Chart anzeigen</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stakeholderData.stakeholder_groups.map((group: any) => (
              <TableRow hover key={group.id}>
                <TableCell>
                  <Typography 
                    sx={{ 
                      fontWeight: group.is_default ? 600 : 400,
                      cursor: 'pointer',
                      color: '#026770',
                    }}
                    onClick={() => {
                      setSelectedGroupForStakeholders(group.id);
                      setStakeholderListOpen(true);
                    }}
                  >
                    {group.display_name}
                  </Typography>
                  {group.is_default && (
                    <Chip label="Standard" size="small" color="primary" variant="outlined" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell>{group.has_responses ? 'Ja' : 'Nein'}</TableCell>
                <TableCell>{group.stakeholder_count}</TableCell>
                <TableCell>
                  <Switch
                    checked={isGroupChecked(group)}
                    onChange={() => handleGroupToggle(group)}
                    // disabled={true}
                    disabled={isGroupToggleDisabled(group)}
                    // color="primary"
                    // sx={{color: 'blue'}}
                    sx={{
                        width: 41, // 39px + 20px (thumb width) - 1px for border
                        height: 22, // 20px track height + padding
                        padding: 0,
                   
                        // border: '1px solid #026770',
                        // borderRadius: '4',
                        '& .MuiSwitch-switchBase': {
                          padding: 0,
                          margin: '2px',
                          transitionDuration: '300ms',
                          '&.Mui-checked': {
                            transform: 'translateX(20px)', // 39px - 20px + 1px for border
                            color: '#fff',
                           
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#026770',
                              opacity: 1,
                              border: 0,
                            },
                            '&.Mui-disabled + .MuiSwitch-track': {
                              opacity: 0.5,
                            },
                          },
                          '&.Mui-focusVisible .MuiSwitch-thumb': {
                            color: '#33cf4d',
                            border: '6px solid #fff',
                          },
                          '&.Mui-disabled .MuiSwitch-thumb': {
                            color: '#fff',
                          },
                          '&.Mui-disabled + .MuiSwitch-track': {
                            opacity: 0.7,
                          },
                        },
                        '& .MuiSwitch-thumb': {
                          boxSizing: 'border-box',
                          width: 18, // 20px - 4px margin
                          height: 18,
                          backgroundColor: '#fff',
                          boxShadow: '0 2px 4px 0 rgba(0,35,11,0.2)',
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 26 / 2,
                          backgroundColor: '#D9D9D9',
                          border: '1px solid #BEBEBE',
                          opacity: 1,
                          transition: 'background-color 0.3s',
                        },
                      }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    // variant="outlined"
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleCopyInvitationLink(group.invitation_link)}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Einladungslink kopieren
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Stakeholder Groups Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button 
          variant="contained" 
          onClick={() => setEditModalOpen(true)}
          sx={{ 
            bgcolor: '#00695c', 
            '&:hover': { bgcolor: '#004d40' },
            px: 4,
            py: 1.5
          }}
        >
          ✏️ Stakeholder-Gruppen bearbeiten
        </Button>
      </Box>

      {/* Scatter Chart */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        bgcolor: 'white',
        borderRadius: 2,
        p: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Plot
          data={createScatterPlot.data}
          layout={createScatterPlot.layout}
          config={createScatterPlot.config}
          style={{ width: '100%', height: '600px' }}
        />
      </Box>

      {/* All existing modals remain the same */}
      {/* Edit Stakeholder Groups Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Stakeholder-Gruppen bearbeiten</Typography>
          <IconButton onClick={() => setEditModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Verwalten Sie Ihre Stakeholder-Gruppen und deren Sichtbarkeit in der Analyse.
          </Typography>

          {/* Create New Group */}
          {/* <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Neue Stakeholder-Gruppe erstellen
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Name der Stakeholder-Gruppe eingeben"
                value={newStakeholderGroup}
                onChange={(e) => setNewStakeholderGroup(e.target.value)}
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button 
                variant="contained" 
                onClick={handleCreateStakeholderGroup}
                disabled={!newStakeholderGroup.trim() || isCreatingGroup}
              >
                {isCreatingGroup ? <CircularProgress size={20} color="inherit" /> : 'Gruppe anlegen'}
              </Button>
            </Box>
          </Box> */}

          {/* Groups List */}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell>Stakeholder-Gruppe</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stakeholderData.stakeholder_groups.map((group: any) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Switch
                        checked={isGroupChecked(group)}
                        onChange={() => handleGroupToggle(group)}
                        disabled={true}
                        size="small"
                      />
                      <Typography sx={{ fontWeight: group.is_default ? 600 : 400 }}>
                        {group.display_name}
                      </Typography>
                      {group.is_default && (
                        <Chip label="Kernteam" size="small" color="primary" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CopyIcon />}
                        onClick={() => handleCopyInvitationLink(group.invitation_link)}
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
          <Button onClick={() => setEditModalOpen(false)}>
            Abbrechen
          </Button>
          <Button variant="contained" onClick={() => setEditModalOpen(false)}>
            Übernehmen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stakeholder List Modal */}
      <Dialog 
        open={stakeholderListOpen} 
        onClose={() => setStakeholderListOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Stakeholder Verwaltung</Typography>
          <IconButton onClick={() => setStakeholderListOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Verwalten Sie die Stakeholder in dieser Gruppe.
          </Typography>

          {/* <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button 
              variant="text" 
              onClick={() => setAddStakeholderOpen(true)}
              sx={{ color: '#026770' }}
            >
              User manuell anlegen
            </Button>
          </Box> */}

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
                  {/* <TableCell align="center">Aktionen</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingStakeholders ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : groupStakeholdersData?.stakeholders && groupStakeholdersData.stakeholders.length > 0 ? (
                  groupStakeholdersData.stakeholders.map((stakeholder: any) => (
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
                      {/* <TableCell align="center">
                        <Button 
                          size="small" 
                          onClick={() => requestRemoveStakeholder(stakeholder)}
                          disabled={isRemoving}
                          sx={{ color: '#026770', minWidth: 'auto' }}
                        >
                          ✕ Entfernen
                        </Button>
                      </TableCell> */}
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

      {/* Confirm Remove Stakeholder Dialog */}
      <Dialog
        open={confirmRemove.open}
        onClose={cancelRemoveStakeholder}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Stakeholder entfernen?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Möchten Sie {confirmRemove.name ? <strong>{confirmRemove.name}</strong> : 'diesen Stakeholder'} wirklich entfernen?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveStakeholder}>Abbrechen</Button>
          <Button 
            onClick={confirmRemoveStakeholder} 
            color="error" 
            variant="contained"
            disabled={isRemoving}
          >
            {isRemoving ? <CircularProgress size={18} color="inherit" /> : 'Entfernen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Stakeholder Modal */}
      <Dialog 
        open={addStakeholderOpen} 
        onClose={() => setAddStakeholderOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">User manuell anlegen</Typography>
          <IconButton onClick={() => setAddStakeholderOpen(false)}>
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
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, first_name: e.target.value }))}
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
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, last_name: e.target.value }))}
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
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, email: e.target.value }))}
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
                    onChange={(e) => setNewStakeholder(prev => ({ ...prev, send_invitation: e.target.checked }))}
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
                    onChange={(e) => setNewStakeholder(prev => ({ ...prev, send_login_link: e.target.checked }))}
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
          <Button onClick={() => setAddStakeholderOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddStakeholder}
            disabled={!newStakeholder.email || isCreatingStakeholder}
            sx={{ 
              backgroundColor: '#026770',
              '&:hover': { backgroundColor: '#024f57' }
            }}
          >
            {isCreatingStakeholder ? <CircularProgress size={20} color="inherit" /> : 'User anlegen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StakeholderAnalysisDashboardTerramoAdminView;