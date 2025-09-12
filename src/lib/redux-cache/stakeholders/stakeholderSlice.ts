import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interfaces for type safety
interface Client {
  id: string;
  name: string;
}

interface CategoryInfo {
  id: string;
  name: string;
  display_name: string;
}

interface Question {
  question_id: string;
  index_code: string;
  measure: string;
  question_description: string;
  priority: number | null;
  status_quo: number | null;
  comment: string;
  priority_display: string | null;
  status_quo_display: string | null;
  completion_score: number;
  status: string;
  response_id?: string;
  response_count?: number;
}

interface CategoryData {
  category_info: CategoryInfo;
  questions: Question[];
}

interface CategoryAverage {
  category_info: CategoryInfo;
  priority_average: number;
  status_quo_average: number;
}

interface StakeholderGroup {
  id: string;
  name: string;
  display_name: string;
  stakeholder_count: number;
  is_default: boolean;
  is_global: boolean;
  show_in_table: boolean;
  has_responses: boolean;
  category_averages: Record<string, CategoryAverage>;
  question_response: Record<string, CategoryData>;
  invitation_link: string;
}

interface StakeholderAnalysisData {
  client: Client;
  year: number;
  categories: any | null;
  question_response: Record<string, CategoryData>;
  stakeholder_groups: StakeholderGroup[];
  stakeholder_groups_data_plot: StakeholderGroup[];
}

interface StakeholderAnalysisState {
  data: StakeholderAnalysisData | null;
  selectedGroups: string[];
  selectedGroupsShowInTable: string[];
  selectedGroupsNotShowInTable: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  initialized: boolean;
}

const initialState: StakeholderAnalysisState = {
  data: null,
  selectedGroups: [],
  selectedGroupsShowInTable: [],
  selectedGroupsNotShowInTable: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
  initialized: false,
};

// Payload interfaces
interface SetStakeholderAnalysisDataPayload {
  data: StakeholderAnalysisData;
}

interface SetSelectedGroupsPayload {
  groups: string[];
}

interface SetSelectedGroupsShowInTablePayload {
  groups: string[];
}

interface SetSelectedGroupsNotShowInTablePayload {
  groupsStatus: Record<string, boolean>;
}

interface UpdateGroupVisibilityPayload {
  groupId: string;
  showInTable: boolean;
}

interface SetLoadingPayload {
  isLoading: boolean;
}

interface SetErrorPayload {
  error: string | null;
}

const stakeholderAnalysisSlice = createSlice({
  name: "stakeholderAnalysis",
  initialState,
  reducers: {
    setStakeholderAnalysisData: (state, action: PayloadAction<SetStakeholderAnalysisDataPayload>) => {
      const { data } = action.payload;
      state.data = data;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
      state.initialized = true;
      
      // Initialize selected groups with default/global groups
      const defaultGroups: string[] = [];
      data.stakeholder_groups_data_plot.forEach((group) => {
        if (group.is_global) {
          defaultGroups.push(group.id);
        }
      });
      state.selectedGroups = defaultGroups;
      
      // Initialize groups show in table with groups that have responses and are not global
      const showInTableGroups: string[] = [];
      const notInTableStatus: Record<string, boolean> = {};
      data.stakeholder_groups_data_plot.forEach((group) => {
        if (group.show_in_table && group.has_responses && !group.is_global) {
          showInTableGroups.push(group.id);
        }
        if (group.has_responses && !group.is_global) {
          notInTableStatus[group.id] = group.show_in_table;
        }
      });
      state.selectedGroupsShowInTable = showInTableGroups;
      state.selectedGroupsNotShowInTable = notInTableStatus;
    },

    setSelectedGroups: (state, action: PayloadAction<SetSelectedGroupsPayload>) => {
      state.selectedGroups = action.payload.groups;
    },

    toggleSelectedGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      const currentIndex = state.selectedGroups.indexOf(groupId);
      
      if (currentIndex !== -1) {
        // Remove the group if it exists
        state.selectedGroups = state.selectedGroups.filter(id => id !== groupId);
      } else {
        // Add the group if it doesn't exist
        state.selectedGroups.push(groupId);
      }
    },

    setSelectedGroupsShowInTable: (state, action: PayloadAction<SetSelectedGroupsShowInTablePayload>) => {
      state.selectedGroupsShowInTable = action.payload.groups;
    },

    toggleSelectedGroupShowInTable: (state, action: PayloadAction<{ groupId: string; showInTable: boolean }>) => {
      const { groupId, showInTable } = action.payload;
      const currentIndex = state.selectedGroupsShowInTable.indexOf(groupId);
      
      if (currentIndex !== -1) {
        // Remove the group if it exists
        state.selectedGroupsShowInTable = state.selectedGroupsShowInTable.filter(id => id !== groupId);
      } else {
        // Add the group if it doesn't exist
        state.selectedGroupsShowInTable.push(groupId);
      }
      
      // Update the not show in table status
      state.selectedGroupsNotShowInTable = {
        ...state.selectedGroupsNotShowInTable,
        [groupId]: showInTable ? false : true
      };
    },

    setSelectedGroupsNotShowInTable: (state, action: PayloadAction<SetSelectedGroupsNotShowInTablePayload>) => {
      state.selectedGroupsNotShowInTable = action.payload.groupsStatus;
    },

    updateGroupVisibility: (state, action: PayloadAction<UpdateGroupVisibilityPayload>) => {
      const { groupId, showInTable } = action.payload;
      
      if (state.data) {
        // Update both stakeholder_groups and stakeholder_groups_data_plot
        state.data.stakeholder_groups = state.data.stakeholder_groups.map(group =>
          group.id === groupId ? { ...group, show_in_table: showInTable } : group
        );
        
        state.data.stakeholder_groups_data_plot = state.data.stakeholder_groups_data_plot.map(group =>
          group.id === groupId ? { ...group, show_in_table: showInTable } : group
        );
      }
      
      // Update the tracking state
      state.selectedGroupsNotShowInTable = {
        ...state.selectedGroupsNotShowInTable,
        [groupId]: showInTable
      };
    },

    addStakeholderGroup: (state, action: PayloadAction<StakeholderGroup>) => {
      if (state.data) {
        state.data.stakeholder_groups.push(action.payload);
        state.data.stakeholder_groups_data_plot.push(action.payload);
      }
    },

    updateStakeholderGroupCount: (state, action: PayloadAction<{ groupId: string; count: number }>) => {
      const { groupId, count } = action.payload;
      
      if (state.data) {
        state.data.stakeholder_groups = state.data.stakeholder_groups.map(group =>
          group.id === groupId ? { ...group, stakeholder_count: count } : group
        );
        
        state.data.stakeholder_groups_data_plot = state.data.stakeholder_groups_data_plot.map(group =>
          group.id === groupId ? { ...group, stakeholder_count: count } : group
        );
      }
    },

    setLoading: (state, action: PayloadAction<SetLoadingPayload>) => {
      state.isLoading = action.payload.isLoading;
    },

    setError: (state, action: PayloadAction<SetErrorPayload>) => {
      state.error = action.payload.error;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetStakeholderAnalysis: (state) => {
      state.data = null;
      state.selectedGroups = [];
      state.selectedGroupsShowInTable = [];
      state.selectedGroupsNotShowInTable = {};
      state.isLoading = false;
      state.error = null;
      state.lastUpdated = null;
      state.initialized = false;
    },

    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
  },
});

export const {
  setStakeholderAnalysisData,
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
} = stakeholderAnalysisSlice.actions;

export default stakeholderAnalysisSlice.reducer;