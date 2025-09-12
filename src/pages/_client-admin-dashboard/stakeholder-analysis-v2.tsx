import React, { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '../../lib/redux/hooks/typedHooks';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setStakeholderAnalysisData,
  toggleSelectedGroup,
  toggleSelectedGroupShowInTable 
} from '../../lib/redux/features/stakeholders/stakeholderSlice';

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
import { 
  useGetStakeholderAnalysisDashboardQuery,
  useCreateStakeholderGroupMutation,
  useGetGroupStakeholdersQuery,
  useCreateStakeholderESGMutation,
  useRemoveStakeholderESGMutation,
  useCopyStakeholderInvitationLinkESGMutation,
  useUpdateGroupVisibilityMutation,
  useBulkUpdateStakeholderGroupsShowsInTableMutation,
} from '../../lib/redux/features/clients/clientupdatedApiSlice';
import { useYearContext } from "../_client-admin-dashboard";


/**
 * ---------------------------------------------------------------------------------------------------
 * TABLE OF CONTENTS FOR MAPPING AND SEARCHING DATA | JUST COPY AND SEARCH THE NUMBER ex. [2]
 * [1]
 * [2] REDUX STATE FOR STAKEHOLDER ANALYSIS
 * 
 */

const StakeholderAnalysisDashboardESG = () => {
  // Get selected year from context
  const { selectedYear } = useYearContext();
  
  // API hooks
  const { 
    data: stakeholderData, 
    isLoading, 
    error,
    refetch 
  } = useGetStakeholderAnalysisDashboardQuery({
      year: selectedYear
    });
  

   
  const [createStakeholderGroup, { isLoading: isCreatingGroup }] = useCreateStakeholderGroupMutation();
  const [createStakeholder, { isLoading: isCreatingStakeholder }] = useCreateStakeholderESGMutation();
  const [removeStakeholder, { isLoading: isRemoving }] = useRemoveStakeholderESGMutation();
  const [copyInvitationLink] = useCopyStakeholderInvitationLinkESGMutation();
  const [updateGroupVisibility] = useUpdateGroupVisibilityMutation();

  // for stakeholdergroup responses
  const [bulkUpdateStakeholderGroup, { isLoading: isSavingStakeholderGroup }] = useBulkUpdateStakeholderGroupsShowsInTableMutation();

  // State management - Changed from Set to arrays
  const [selectedGroups, setSelectedGroups] = useState<(number | string)[]>([]);
  const [selectedGroupsShowInTable, setSelectedGroupsShowInTable] = useState<(number | string)[]>([]);
  const [selectedGroupsNotShowInTable, setSelectedGroupsNotShowInTable] = useState({});

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [stakeholderListOpen, setStakeholderListOpen] = useState(false);
  const [addStakeholderOpen, setAddStakeholderOpen] = useState(false);
  // for showing in table stakeholder groups
  const [listShowInTable, setListShowInTable] = useState([]);
  const [selectedGroupForStakeholders, setSelectedGroupForStakeholders] = useState<string | number>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [newStakeholderGroup, setNewStakeholderGroup] = useState('');
  const dispatch = useDispatch();
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
  const { data: groupStakeholdersData, isLoading: isLoadingStakeholders } = useGetGroupStakeholdersQuery(
    selectedGroupForStakeholders, 
    { skip: !selectedGroupForStakeholders }
  );

/**
 * ===================================================================================================
 * [2] REDUX STATE FOR STAKEHOLDER ANALYSIS                                                          |
 * ==================================================================================================
 *  
 * DESCRIPTIONS: Consists of data from : /api/v1/esg/dashboard/client-admin/stakeholders-analysis/
 * CONTENTS:
 *    data : client, year, categories, question_response, stakeholder_groups, stakeholder_groups_data_plot
 *    selectedGroups
 *    selectedGroupsShowInTable
 *    selectedGroupsNotShowInTable
 * 
 * -- from stakeholderAnalysisSlice --
 * setStakeholderAnalysisData,
   setSelectedGroups,
   toggleSelectedGroup,
   setSelectedGroupsShowInTable,
   toggleSelectedGroupShowInTable,
   setSelectedGroupsNotShowInTable,
   updateGroupVisibility,
   addStakeholderGroup,
   updateStakeholderGroupCount,
   setLoading,
   setError,
   clearError,
   resetStakeholderAnalysis,
   setInitialized,
 */
  // always update the data if change and set the 
  useEffect(() => {
    if (stakeholderData) {
      dispatch(setStakeholderAnalysisData({ data: stakeholderData }));
    }
  }, [stakeholderData, dispatch]);

  // destructuring the data from the state
  // const { 
  //   data: stakeholderAnalysisData, 
  //   selectedGroups: selectedGroupsState, 
  //   selectedGroupsShowInTable: selectedGroupsStateShowInTable,
  //   selectedGroupsNotShowInTable: selectedGroupsStateNotShowInTable,
  //   isLoading: isStateLoading, 
  // } = useAppSelector((state) => state.stakeholderAnalysis);
 

 
  // destructure the data from stakeholderAnalysisData



  // console.log('stakeholder_groups_data_plot=>', stakeholder_groups_data_plot)
  // Initialize selected groups when data is loaded - Changed to arrays
  React.useEffect(() => {
    if (stakeholderData?.stakeholder_groups_data_plot) {
      const defaultGroups: (number | string)[] = [];
      stakeholderData.stakeholder_groups_data_plot.forEach((group: any) => {
        if (group.is_global) defaultGroups.push(group.id);
      });
      setSelectedGroups(defaultGroups);
    }
  }, [stakeholderData]);

  // Initialize selected groups when data is loaded ( for show_in_table === false) also only Client Stakeholders Group own by client
  React.useEffect(() => {
    if (stakeholderData?.stakeholder_groups_data_plot) {
      const defaultGroupsInTable: (number | string)[] = [];
      stakeholderData.stakeholder_groups_data_plot.forEach((group: any) => {
        // group.is_global ||  
        if (group.show_in_table && group.has_responses && !group.is_global) defaultGroupsInTable.push(group.id);
      });
      setSelectedGroupsShowInTable(defaultGroupsInTable);
    }
  }, [stakeholderData]);

  // all stakeholder groups in or not in table groups
  React.useEffect(() => {
    if (stakeholderData?.stakeholder_groups_data_plot) {
      const defaultGroupsNotInTable = {};
      stakeholderData.stakeholder_groups_data_plot.forEach((group: any) => {
        // group.is_global ||  >> defaultGroupsNotInTable.add(group.id);
        if (group.has_responses && !group.is_global) {
          defaultGroupsNotInTable[group.id] = group.show_in_table
        }
      });
      setSelectedGroupsNotShowInTable(defaultGroupsNotInTable);
    }
  }, [stakeholderData]);

  // Helpers to keep toggle logic DRY
  const isGroupToggleDisabled = (group: any) =>
    group.is_global || !group.has_responses || Number(group.stakeholder_count || 0) === 0;

  // Changed from Set.has() to array.includes()
  const isGroupChecked = (group: any) =>
    group.is_global || (!isGroupToggleDisabled(group) && selectedGroups.includes(group.id));

  // for group toggleshow group in table - Changed from Set.has() to array.includes()
  const isGroupShowInTable = (group: any) => {
    if (group.is_global || selectedGroupsShowInTable.includes(group.id)){
      return true;
    }  
    return false;
  }

  //  Create scatter plot: keep this hook BEFORE any early returns
  const createScatterPlot = useMemo(() => {
    const categoryColors: Record<string, string> = {
      'Corporate Governance': '#005959',
      'Environment': '#7ba042',
      'Social': '#b27300'
    };

    type Pt = { x: number; y: number; text: string; category: string; source: string };
    const allDataPoints: Pt[] = [];

    // Add client admin data (always shown if present)
    // const qResp = stakeholderData?.question_response; | stakeholderAnalysisData 
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

    // Add selected stakeholder groups data - Changed from Set.has() to array.includes()
    stakeholderData?.stakeholder_groups_data_plot?.forEach((group: any) => {
      const shouldInclude = group.is_default || selectedGroups.includes(group.id);
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
    return (
      <Alert severity="error">
        Error loading stakeholder analysis data: {msg}
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

  // Handle group selection toggle - Changed from Set operations to array operations
  const handleGroupToggle = (group: any) => {
    if (isGroupToggleDisabled(group)) return; // Default or no data -> ignore
    setSelectedGroups(prev => {
      const currentIndex = prev.indexOf(group.id);
      if (currentIndex !== -1) {
        // Remove the group if it exists
        return prev.filter(id => id !== group.id);
      } else {
        // Add the group if it doesn't exist
        return [...prev, group.id];
      }
    });
  };

  // Changed from Set operations to array operations
  const handleGroupToggleShowInTable = (group: any, check: boolean) => {
    setSelectedGroupsShowInTable(prev => {
      const currentIndex = prev.indexOf(group.id);
      if (currentIndex !== -1) {
        // Remove the group if it exists
        return prev.filter(id => id !== group.id);
      } else {
        // Add the group if it doesn't exist
        return [...prev, group.id];
      }
    });

    // THIS WILL TRACK all of the stakeholdergroup shows in table status.| Boolean 
    setSelectedGroupsNotShowInTable(prev => {
      return {
        ...prev,
        [group.id]: check ? false : true
      }
    });
  }

  console.log("ShowInTable=>", selectedGroupsShowInTable)
  console.log('Show not in TAble', selectedGroupsNotShowInTable)
  
  // Copy invitation link to clipboard
  const handleCopyInvitationLink = async (groupId: number | string) => {
    try {
      const result = await copyInvitationLink({ group_id: groupId }).unwrap();
      await navigator.clipboard.writeText(result.invitation_link);
      setSnackbar({ open: true, message: 'Einladungslink kopiert!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Fehler beim Kopieren', severity: 'error' });
    }
  };

  // Create new stakeholder group
  const handleCreateStakeholderGroup = async () => {
    // convertthe selectedgroups to
    const showInTableStakeholderIds = [...selectedGroups]

    if (!newStakeholderGroup.trim()) return;
    try {
      const result = await createStakeholderGroup({ name: newStakeholderGroup.trim() }).unwrap();
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

  // handle submit show table
  const handleStakeholderShowInTable = async () => {
    try {
      const payload = {
        client_id : stakeholderData?.client.id,
        stakeholdergroup_ids: [selectedGroupsNotShowInTable]
      };
      if (payload.length === 0) {
        setSnackbar({ open: true, message: 'Empty!', severity: 'error' });
        return;
      }
      const res = await bulkUpdateStakeholderGroup(payload).unwrap();
      setSnackbar({ open: true, message: 'Successfully updated!', severity: 'success' });
      
      refetch();
    } catch (e: any) {
      setSnackbar({ open: true, message: 'Error Updating the table!', severity: 'error' });
      console.error(e);
    }
  };

  // Add new stakeholder
  const handleAddStakeholder = async () => {
    if (!newStakeholder.email.trim() || !selectedGroupForStakeholders) return;

    try {
      const result = await createStakeholder({
        group_id: selectedGroupForStakeholders,
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

  console.log("stakeholderData=>",stakeholderData)
  
  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        Stakeholder-Analyse
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        Um Nachhaltigkeit zu erzielen, werden verschiedene Massnahmen eingesetzt. 
        Abhängig vom Unternehmen sind manche wichtiger, manche weniger.
      </Typography>

      {/* Stakeholder Groups Table */}
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
            {stakeholderData.stakeholder_groups_data_plot.map((group: any) => (
              group.show_in_table &&
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
                    {/* {group.id} */}
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
                    onChange={() => handleGroupToggle(group)}
                    disabled={isGroupToggleDisabled(group)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CopyIcon />}
                    onClick={() => handleCopyInvitationLink(group.id)}
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
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
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
              {stakeholderData.stakeholder_groups.map((group: any) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Switch
                        checked={isGroupShowInTable(group)}
                        onChange={() => handleGroupToggleShowInTable(group, isGroupShowInTable(group))}
                        disabled={ group.is_global || !group.has_responses}
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
                        onClick={() => handleCopyInvitationLink(group.id)}
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
          <Button variant="contained" onClick={handleStakeholderShowInTable}>
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

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button 
              variant="text" 
              onClick={() => setAddStakeholderOpen(true)}
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
                  {/* <TableCell>Angemeldet am</TableCell> */}
                  <TableCell align="center">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingStakeholders ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
                      {/* <TableCell>
                        {stakeholder.last_login 
                          ? new Date(stakeholder.last_login).toLocaleDateString('de-DE')
                          : '-'
                        }
                      </TableCell> */}
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          onClick={() => requestRemoveStakeholder(stakeholder)}
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

export default StakeholderAnalysisDashboardESG;