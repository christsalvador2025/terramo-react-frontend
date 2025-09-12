import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  setStakeholderGroups,
  setStakeholders,
  setSelectedGroup,
  updateNewStakeholder,
  resetNewStakeholder,
  setStakeholderListOpen,
  setAddStakeholderOpen,
  setLoading,
  setStakeholdersLoading,
  setCreating,
  setRemoving,
  setError,
  clearError,
  addStakeholder,
  removeStakeholder as removeStakeholderAction,
  updateStakeholderCount,
  resetStakeholder,
} from '../../lib/redux/features/clients/esgStakeholderSlice';
import {
  useGetCurrentUserStakeholderGroupsQuery,
  useGetStakeholdersByGroupQuery,
  useCreateStakeholderMutation,
  useRemoveStakeholderMutation,
} from '../../lib/redux/features/clients/clientupdatedApiSlice';

// Type for RootState - adjust according to your store structure
type RootState = {
  stakeholder: any; // Replace with actual Stakeholder state type
};

// Interface for new stakeholder data
interface NewStakeholderData {
  first_name: string;
  last_name: string;
  email: string;
  send_invitation: boolean;
  send_login_link: boolean;
}

// Main Stakeholder Hook
export const useStakeholder = () => {
  const dispatch = useDispatch();
  const stakeholderState = useSelector((state: RootState) => state.stakeholder);
  
  // API hooks
  const { data: stakeholderGroups, isLoading: groupsLoading } = useGetCurrentUserStakeholderGroupsQuery();
  const { 
    data: stakeholdersData, 
    isLoading: stakeholdersLoading,
    refetch: refetchStakeholders 
  } = useGetStakeholdersByGroupQuery(stakeholderState.selectedGroupId, {
    skip: !stakeholderState.selectedGroupId,
  });
  
  const [createStakeholder, { isLoading: isCreating }] = useCreateStakeholderMutation();
  const [removeStakeholder, { isLoading: isRemoving }] = useRemoveStakeholderMutation();

  // Initialize stakeholder groups when loaded
  useEffect(() => {
    if (stakeholderGroups?.results) {
      dispatch(setStakeholderGroups({ groups: stakeholderGroups.results }));
    }
  }, [stakeholderGroups, dispatch]);

  // Update stakeholders when data is loaded
  useEffect(() => {
    if (stakeholdersData?.results) {
      dispatch(setStakeholders({ stakeholders: stakeholdersData.results }));
    }
  }, [stakeholdersData, dispatch]);

  // Update loading states
  useEffect(() => {
    dispatch(setLoading({ isLoading: groupsLoading }));
  }, [groupsLoading, dispatch]);

  useEffect(() => {
    dispatch(setStakeholdersLoading({ stakeholdersLoading }));
  }, [stakeholdersLoading, dispatch]);

  useEffect(() => {
    dispatch(setCreating({ isCreating }));
  }, [isCreating, dispatch]);

  useEffect(() => {
    dispatch(setRemoving({ isRemoving }));
  }, [isRemoving, dispatch]);

  // Handle group selection
  const handleGroupSelect = useCallback((groupId: string) => {
    dispatch(setSelectedGroup({ groupId }));
  }, [dispatch]);

  // Handle new stakeholder field updates
  const handleNewStakeholderUpdate = useCallback((field: keyof NewStakeholderData, value: any) => {
    dispatch(updateNewStakeholder({ field, value }));
  }, [dispatch]);

  // Handle modal open/close
  const handleStakeholderListOpen = useCallback((open: boolean) => {
    dispatch(setStakeholderListOpen({ open }));
  }, [dispatch]);

  const handleAddStakeholderOpen = useCallback((open: boolean) => {
    dispatch(setAddStakeholderOpen({ open }));
  }, [dispatch]);

  // Add stakeholder
  const handleAddStakeholder = useCallback(async () => {
    if (!stakeholderState.selectedGroupId) {
      toast.error('Keine Gruppe ausgewählt');
      return;
    }

    if (!stakeholderState.newStakeholder.email) {
      toast.error('E-Mail ist erforderlich');
      return;
    }

    try {
      const result = await createStakeholder({
        groupId: stakeholderState.selectedGroupId,
        data: {
          email: stakeholderState.newStakeholder.email,
          first_name: stakeholderState.newStakeholder.first_name,
          last_name: stakeholderState.newStakeholder.last_name,
          send_invitation: stakeholderState.newStakeholder.send_invitation,
          send_login_link: stakeholderState.newStakeholder.send_login_link,
        }
      }).unwrap();

      toast.success(result.message || 'Stakeholder erfolgreich hinzugefügt');
      dispatch(resetNewStakeholder());
      dispatch(setAddStakeholderOpen({ open: false }));
      refetchStakeholders();
    } catch (error: any) {
      console.error('Error creating stakeholder:', error);
      const errorMessage = error?.data?.detail || 
                          error?.data?.email?.[0] || 
                          error?.data?.non_field_errors?.[0] ||
                          'Fehler beim Hinzufügen des Stakeholders';
      toast.error(errorMessage);
      dispatch(setError({ error: errorMessage }));
    }
  }, [
    stakeholderState.selectedGroupId,
    stakeholderState.newStakeholder,
    createStakeholder,
    dispatch,
    refetchStakeholders
  ]);

  // Remove stakeholder
  const handleRemoveStakeholder = useCallback(async (stakeholderId: string) => {
    if (!stakeholderState.selectedGroupId) {
      toast.error('Keine Gruppe ausgewählt');
      return;
    }

    try {
      await removeStakeholder({
        stakeholderId,
        groupId: stakeholderState.selectedGroupId,
      }).unwrap();
      
      toast.success('Stakeholder entfernt');
      dispatch(removeStakeholderAction({ stakeholderId }));
      refetchStakeholders();
    } catch (error: any) {
      console.error('Error removing stakeholder:', error);
      const errorMessage = error?.data?.detail || 'Fehler beim Entfernen des Stakeholders';
      toast.error(errorMessage);
      dispatch(setError({ error: errorMessage }));
    }
  }, [stakeholderState.selectedGroupId, removeStakeholder, dispatch, refetchStakeholders]);

  // Copy invitation link
  const handleCopyInviteLink = useCallback(() => {
    if (!stakeholderState.selectedGroupInvitation) {
      toast.error('Keine Gruppe ausgewählt');
      return;
    }

    const inviteLink = `${window.location.origin}/stakeholder/accept-invitation/${stakeholderState.selectedGroupInvitation}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Einladungslink kopiert');
  }, [stakeholderState.selectedGroupInvitation]);

  return {
    // State
    ...stakeholderState,
    stakeholdersData,
    
    // Loading states
    isLoading: groupsLoading || stakeholderState.isLoading,
    stakeholdersLoading,
    isCreating,
    isRemoving,

    // Actions
    handleGroupSelect,
    handleNewStakeholderUpdate,
    handleStakeholderListOpen,
    handleAddStakeholderOpen,
    handleAddStakeholder,
    handleRemoveStakeholder,
    handleCopyInviteLink,
    refetchStakeholders,
    clearError: () => dispatch(clearError()),
    reset: () => dispatch(resetStakeholder()),
  };
};

// Hook for getting management group
export const useManagementGroup = () => {
  const { groups } = useSelector((state: RootState) => state.stakeholder);
  
  return groups.find(group => group.name === "Management");
};