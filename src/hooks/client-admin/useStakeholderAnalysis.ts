// hooks/useStakeholderAnalysis.ts
import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../lib/redux/hooks/typedHooks';
import {
  setStakeholderAnalysisData,
} from '../../lib/redux/features/stakeholders/stakeholderSlice';
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

interface UseStakeholderAnalysisProps {
  selectedYear: number;
}

interface NewStakeholder {
  first_name: string;
  last_name: string;
  email: string;
  send_invitation: boolean;
  send_login_link: boolean;
}

export const useStakeholderAnalysis = ({ selectedYear }: UseStakeholderAnalysisProps) => {
  const dispatch = useDispatch();
  
  // API hooks
  const { 
    data: stakeholderData, 
    isLoading, 
    error,
    refetch 
  } = useGetStakeholderAnalysisDashboardQuery({
    year: selectedYear
  });


   // data state set
    // const { 
    //   data: stakeholderAnalysisData, 
    //   selectedGroups: selectedGroupsState, 
    //   selectedGroupsShowInTable: selectedGroupsStateShowInTable,
    //   selectedGroupsNotShowInTable: selectedGroupsStateNotShowInTable,
    //   isLoading: isStateLoading, 
    // } = useAppSelector((state) => state.stakeholderAnalysis);
  
     
  const { data:stakeholderAnalysisData } = useAppSelector((state) => state.stakeholderAnalysis);

  const [createStakeholderGroup, { isLoading: isCreatingGroup }] = useCreateStakeholderGroupMutation();
  const [createStakeholder, { isLoading: isCreatingStakeholder }] = useCreateStakeholderESGMutation();
  const [removeStakeholder, { isLoading: isRemoving }] = useRemoveStakeholderESGMutation();
  const [copyInvitationLink] = useCopyStakeholderInvitationLinkESGMutation();
  const [updateGroupVisibility] = useUpdateGroupVisibilityMutation();
  const [bulkUpdateStakeholderGroup, { isLoading: isSavingStakeholderGroup }] = useBulkUpdateStakeholderGroupsShowsInTableMutation();

  // State management
  const [selectedGroups, setSelectedGroups] = useState<(number | string)[]>([]);
  const [selectedGroupsShowInTable, setSelectedGroupsShowInTable] = useState<(number | string)[]>([]);
  const [selectedGroupsNotShowInTable, setSelectedGroupsNotShowInTable] = useState<Record<string, boolean>>({});
  const [selectedGroupForStakeholders, setSelectedGroupForStakeholders] = useState<string | number>('');
  const [newStakeholderGroup, setNewStakeholderGroup] = useState('');
  const [newStakeholder, setNewStakeholder] = useState<NewStakeholder>({
    first_name: '',
    last_name: '',
    email: '',
    send_invitation: true,
    send_login_link: false
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' | 'warning' | 'info' 
  }>({ open: false, message: '', severity: 'success' });

  // Confirm removal dialog state
  const [confirmRemove, setConfirmRemove] = useState<{ 
    open: boolean; 
    id?: number | string; 
    name?: string 
  }>({ open: false });

  // Get stakeholders for selected group
  const { data: groupStakeholdersData, isLoading: isLoadingStakeholders } = useGetGroupStakeholdersQuery(
    selectedGroupForStakeholders, 
    { skip: !selectedGroupForStakeholders }
  );

  // Update Redux state when data changes
  useEffect(() => {
    if (stakeholderData) {
      dispatch(setStakeholderAnalysisData({ data: stakeholderData }));

    
    }
  }, [stakeholderData, dispatch]);

  // Initialize selected groups when data is loaded | stakeholderAnalysisData
  useEffect(() => {
    // if (stakeholderData?.stakeholder_groups_data_plot) {
    //   const defaultGroups: (number | string)[] = [];
    //   stakeholderData.stakeholder_groups_data_plot.forEach((group: any) => {
    //     if (group.is_global) defaultGroups.push(group.id);
    //   });
    //   setSelectedGroups(defaultGroups);
    // }

    if(stakeholderData){
        if (stakeholderAnalysisData?.stakeholder_groups_data_plot) {
        const defaultGroups: (number | string)[] = [];
        stakeholderAnalysisData.stakeholder_groups_data_plot.forEach((group: any) => {
            if (group.is_global) defaultGroups.push(group.id);
        });
        setSelectedGroups(defaultGroups);
        }
    }
  }, [stakeholderData, stakeholderAnalysisData]);

  // Initialize groups show in table
  useEffect(() => {
    // if (stakeholderData?.stakeholder_groups_data_plot) {
    //   const defaultGroupsInTable: (number | string)[] = [];
    //   stakeholderData.stakeholder_groups_data_plot.forEach((group: any) => {
    //     if (group.show_in_table && group.has_responses && !group.is_global) {
    //       defaultGroupsInTable.push(group.id);
    //     }
    //   });
    //   setSelectedGroupsShowInTable(defaultGroupsInTable);
    // }
    if(stakeholderData){
        if (stakeholderAnalysisData?.stakeholder_groups_data_plot) {
      const defaultGroupsInTable: (number | string)[] = [];
      stakeholderAnalysisData.stakeholder_groups_data_plot.forEach((group: any) => {
        if (group.show_in_table && group.has_responses && !group.is_global) {
          defaultGroupsInTable.push(group.id);
        }
      });
      setSelectedGroupsShowInTable(defaultGroupsInTable);
    }
    }
    
  }, [stakeholderData, stakeholderAnalysisData]);

  // Initialize not in table groups tracking
  useEffect(() => {
    // if (stakeholderData?.stakeholder_groups_data_plot) {
    //   const defaultGroupsNotInTable: Record<string, boolean> = {};
    //   stakeholderData.stakeholder_groups_data_plot.forEach((group: any) => {
    //     if (group.has_responses && !group.is_global) {
    //       defaultGroupsNotInTable[group.id] = group.show_in_table;
    //     }
    //   });
    //   setSelectedGroupsNotShowInTable(defaultGroupsNotInTable);
    // }
    if(stakeholderData){
        if (stakeholderAnalysisData?.stakeholder_groups_data_plot) {
        const defaultGroupsNotInTable: Record<string, boolean> = {};
        stakeholderAnalysisData.stakeholder_groups_data_plot.forEach((group: any) => {
            if (group.has_responses && !group.is_global) {
            defaultGroupsNotInTable[group.id] = group.show_in_table;
            }
        });
        setSelectedGroupsNotShowInTable(defaultGroupsNotInTable);
        }
    }
    
  }, [stakeholderData, stakeholderAnalysisData]);

  // Helper functions
  const isGroupToggleDisabled = (group: any) =>
    group.is_global || !group.has_responses || Number(group.stakeholder_count || 0) === 0;

  const isGroupChecked = (group: any) =>
    group.is_global || (!isGroupToggleDisabled(group) && selectedGroups.includes(group.id));

  const isGroupShowInTable = (group: any) => {
    if (group.is_global || selectedGroupsShowInTable.includes(group.id)) {
      return true;
    }  
    return false;
  };

  // Group toggle handlers
  const handleGroupToggle = (group: any) => {
    if (isGroupToggleDisabled(group)) return;
    
    setSelectedGroups(prev => {
      const currentIndex = prev.indexOf(group.id);
      if (currentIndex !== -1) {
        return prev.filter(id => id !== group.id);
      } else {
        return [...prev, group.id];
      }
    });
  };

  const handleGroupToggleShowInTable = (group: any, check: boolean) => {
    setSelectedGroupsShowInTable(prev => {
      const currentIndex = prev.indexOf(group.id);
      if (currentIndex !== -1) {
        return prev.filter(id => id !== group.id);
      } else {
        return [...prev, group.id];
      }
    });

    setSelectedGroupsNotShowInTable(prev => ({
      ...prev,
      [group.id]: check ? false : true
    }));
  };

  // Action handlers
  const handleCopyInvitationLink = async (invitation_link : string) => {
    try {
 
    //   const result = await copyInvitationLink({ group_id: groupId }).unwrap();
      await navigator.clipboard.writeText(invitation_link);
      setSnackbar({ open: true, message: 'Einladungslink kopiert!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: 'Fehler beim Kopieren', severity: 'error' });
    }
  };

  const handleCreateStakeholderGroup = async () => {
    console.log('this is rendered and renered handleCreateStakeholderGroup')
    if (!newStakeholderGroup.trim()) return;
    
    try {
      const result = await createStakeholderGroup({ name: newStakeholderGroup.trim() }).unwrap();
      setNewStakeholderGroup('');
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      // console.log('handleCreateStakeholderGroup-', result)
      // refetch(); -- will be uncommented
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.data?.error || 'Fehler beim Erstellen der Stakeholder-Gruppe', 
        severity: 'error' 
      });
    }
  };

  const handleStakeholderShowInTable = async () => {
    try {
      const payload = {
        client_id: stakeholderData?.client.id,
        stakeholdergroup_ids: [selectedGroupsNotShowInTable]
      };
      
      if (payload.length === 0) {
        setSnackbar({ open: true, message: 'Empty!', severity: 'error' });
        return;
      }
      
      const res = await bulkUpdateStakeholderGroup(payload).unwrap();
      setSnackbar({ open: true, message: 'Successfully updated!', severity: 'success' });
      // refetch(); -- will be uncommented
    } catch (e: any) {
      setSnackbar({ open: true, message: 'Error Updating the table!', severity: 'error' });
      console.error(e);
    }
  };

  const handleAddStakeholder = async () => {
    if (!newStakeholder.email.trim() || !selectedGroupForStakeholders) return;

    try {
      const result = await createStakeholder({
        group_id: selectedGroupForStakeholders,
        ...newStakeholder
      }).unwrap();
      
      setSnackbar({ open: true, message: result.message, severity: 'success' });
      setNewStakeholder({ 
        first_name: '', 
        last_name: '', 
        email: '', 
        send_invitation: true, 
        send_login_link: false 
      });
      // refetch(); -- will be uncommented
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.data?.error || 'Fehler beim Hinzufügen des Stakeholders', 
        severity: 'error' 
      });
    }
  };

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
      // refetch(); -- will be uncommented
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error?.data?.error || 'Fehler beim Entfernen des Stakeholders', 
        severity: 'error' 
      });
    }
  };

  // Scatter plot data
  const createScatterPlot = useMemo(() => {
    const categoryColors: Record<string, string> = {
      'Corporate Governance': '#657002', // Unternehmensführung - #657002
      'Environment': '#700269', // 'Umwelt'- '#700269'
      'Social': '#023770' // Gesellschaft - #023770
    };

    type Pt = { x: number; y: number; text: string; category: string; source: string };
    const allDataPoints: Pt[] = [];

    // Add client admin data
    const qResp = stakeholderData?.question_response;
    if (qResp) {
      Object.entries(qResp).forEach(([categoryName, categoryData]: any) => {
        categoryData?.questions?.forEach((question: any) => {
          if (
            question?.priority != null &&
            question?.status_quo != null &&
            question.priority >= 0 &&
            question.status_quo >= 0
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
    stakeholderData?.stakeholder_groups_data_plot?.forEach((group: any) => {
      const shouldInclude = group.is_default || selectedGroups.includes(group.id);
      if (shouldInclude && group.has_responses && group.question_response) {
        Object.entries(group.question_response).forEach(([categoryName, categoryData]: any) => {
          categoryData?.questions?.forEach((question: any) => {
            if (
              question?.priority != null &&
              question?.status_quo != null &&
              question.priority >= 0 &&
              question.status_quo >= 0
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
    
    // check if redux state is correct 

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
        size: 10, // Slightly larger markers
        color: categoryColors[category],
        line: { width: 2, color: 'white' }
      },
      textposition: 'top center',
      textfont: { 
        size: 10, 
        color: categoryColors[category] 
      }
    };
  });

  return {
    data: traces,
    layout: {
      title: {
        text: 'Wesentlichkeitsmatrix Stakeholder',
        font: { size: 16 },
        x: 0.1,
        xanchor: 'left'
      },
      xaxis: { 
        title: 'Priority',
        range: [0, 4.5],
        showgrid: true,
        gridcolor: '#D9D9D9',
        tick0: 0,
        dtick: 0.5 // This will show 0, 0.5, 1, 1.5, 2, 2.5, etc.
      },
      yaxis: { 
        title: 'Status Quo',
        range: [0, 4.5],
        showgrid: true,
        gridcolor: '#D9D9D9',
        tick0: 0,
        dtick: 0.5 // This will show 0, 0.5, 1, 1.5, 2, 2.5, etc.
      },
      showlegend: true, // Ensure legend is shown
      legend: { 
        x: 1.02, 
        y: 1,
        xanchor: 'left',
        yanchor: 'top',
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: '#333',
        borderwidth: 1
      },
      margin: { l: 60, r: 150, t: 60, b: 60 },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white'
    },
    config: { displayModeBar: false }
  };
  }, [stakeholderData, selectedGroups]);

  return {
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
    isSavingStakeholderGroup,
    
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
    
    // Utilities
    refetch
  };
};