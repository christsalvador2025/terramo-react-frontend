// components/StakeholderAnalysisDashboardESG.tsx
import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useYearContext } from '../../../../pages/_client-admin-dashboard';
import { useStakeholderAnalysis } from '../../../../hooks/client-admin/useStakeholderAnalysis';

import { useAppSelector } from '../../../../lib/redux/hooks/typedHooks';
// Component imports
import StakeholderGroupsTable from './StakeholderGroupsTable';
import StakeholderChart from './StakeholderChart';
import EditStakeholderGroupsModal from './EditStakeholderGroupsModal';
import StakeholderListModal from './StakeholderListModal';
import AddStakeholderModal from './AddStakeholderModal';
import ConfirmRemoveDialog from './ConfirmRemoveDialog';
import NotificationSnackbar from './NotificationSnackbar';

const StakeholderAnalysisDashboardESGMain = () => {
  const { selectedYear } = useYearContext();
  const { data:stakeholderAnalysisData } = useAppSelector((state) => state.stakeholderAnalysis);
  const {
    // Data
    stakeholderData,
    groupStakeholdersData,
    createScatterPlot,
    
    // Loading states
    isLoading,
    isCreatingGroup,
    isCreatingStakeholder,
    isRemoving,
    isLoadingStakeholders,
    
    // Error
    error,
    
    // State
    selectedGroups,
    selectedGroupsShowInTable,
    selectedGroupsNotShowInTable,
    selectedGroupForStakeholders,
    newStakeholderGroup,
    newStakeholder,
    snackbar,
    confirmRemove,
    
    // Setters
    setSelectedGroupForStakeholders,
    setNewStakeholderGroup,
    setNewStakeholder,
    setSnackbar,
    
    // Helper functions
    isGroupToggleDisabled,
    isGroupChecked,
    isGroupShowInTable,
    
    // Handlers
    handleGroupToggle,
    handleGroupToggleShowInTable,
    handleCopyInvitationLink,
    handleCreateStakeholderGroup,
    handleStakeholderShowInTable,
    handleAddStakeholder,
    requestRemoveStakeholder,
    cancelRemoveStakeholder,
    confirmRemoveStakeholder,
  } = useStakeholderAnalysis({ selectedYear });

  // console.log('data--',stakeholderAnalysisData)
  // Modal states
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [stakeholderListOpen, setStakeholderListOpen] = React.useState(false);
  const [addStakeholderOpen, setAddStakeholderOpen] = React.useState(false);

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
      <StakeholderGroupsTable
        stakeholderGroups={stakeholderData.stakeholder_groups_data_plot}
        onGroupToggle={handleGroupToggle}
        onCopyInvitationLink={handleCopyInvitationLink}
        onStakeholderListOpen={(groupId) => {
          setSelectedGroupForStakeholders(groupId);
          setStakeholderListOpen(true);
        }}
        isGroupChecked={isGroupChecked}
        isGroupToggleDisabled={isGroupToggleDisabled}
      />

      {/* Edit Stakeholder Groups Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <button 
          onClick={() => setEditModalOpen(true)}
          style={{
            backgroundColor: '#00695c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004d40'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00695c'}
        >
          ✏️ Stakeholder-Gruppen bearbeiten
        </button>
      </Box>

      {/* Scatter Chart */}
      <StakeholderChart plotData={createScatterPlot} />

      {/* Edit Stakeholder Groups Modal */}
      <EditStakeholderGroupsModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        stakeholderGroups={stakeholderData.stakeholder_groups}
        newStakeholderGroup={newStakeholderGroup}
        isCreatingGroup={isCreatingGroup}
        onNewStakeholderGroupChange={setNewStakeholderGroup}
        onCreateStakeholderGroup={handleCreateStakeholderGroup}
        onGroupToggleShowInTable={handleGroupToggleShowInTable}
        onCopyInvitationLink={handleCopyInvitationLink}
        onSubmitTableChanges={handleStakeholderShowInTable}
        isGroupShowInTable={isGroupShowInTable}
      />

      {/* Stakeholder List Modal */}
      <StakeholderListModal
        open={stakeholderListOpen}
        onClose={() => setStakeholderListOpen(false)}
        onAddStakeholderOpen={() => setAddStakeholderOpen(true)}
        groupStakeholders={groupStakeholdersData?.stakeholders || []}
        isLoading={isLoadingStakeholders}
        onRemoveStakeholder={requestRemoveStakeholder}
        isRemoving={isRemoving}
      />

      {/* Add Stakeholder Modal */}
      <AddStakeholderModal
        open={addStakeholderOpen}
        onClose={() => setAddStakeholderOpen(false)}
        newStakeholder={newStakeholder}
        onNewStakeholderChange={setNewStakeholder}
        onAddStakeholder={handleAddStakeholder}
        isCreating={isCreatingStakeholder}
      />

      {/* Confirm Remove Stakeholder Dialog */}
      <ConfirmRemoveDialog
        open={confirmRemove.open}
        stakeholderName={confirmRemove.name}
        onCancel={cancelRemoveStakeholder}
        onConfirm={confirmRemoveStakeholder}
        isRemoving={isRemoving}
      />

      {/* Snackbar for notifications */}
      <NotificationSnackbar
        snackbar={snackbar}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default StakeholderAnalysisDashboardESGMain;