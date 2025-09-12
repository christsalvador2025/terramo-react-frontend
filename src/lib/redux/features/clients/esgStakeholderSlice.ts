import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interfaces for type safety
interface StakeholderGroup {
  id: string;
  name: string;
  display_name: string;
  stakeholder_count: number;
  is_default: boolean;
  is_global: boolean;
  show_in_table: boolean;
  has_responses: boolean;
  invitation_token: string;
}

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

interface NewStakeholderData {
  first_name: string;
  last_name: string;
  email: string;
  send_invitation: boolean;
  send_login_link: boolean;
}

interface StakeholderState {
  groups: StakeholderGroup[];
  stakeholders: StakeholderData[];
  selectedGroupId: string;
  selectedGroupInvitation: string;
  newStakeholder: NewStakeholderData;
  stakeholderListOpen: boolean;
  addStakeholderOpen: boolean;
  isLoading: boolean;
  stakeholdersLoading: boolean;
  isCreating: boolean;
  isRemoving: boolean;
  error: string | null;
  lastUpdated: string | null;
  initialized: boolean;
}

const initialNewStakeholder: NewStakeholderData = {
  first_name: '',
  last_name: '',
  email: '',
  send_invitation: true,
  send_login_link: true,
};

const initialState: StakeholderState = {
  groups: [],
  stakeholders: [],
  selectedGroupId: '',
  selectedGroupInvitation: '',
  newStakeholder: initialNewStakeholder,
  stakeholderListOpen: false,
  addStakeholderOpen: false,
  isLoading: false,
  stakeholdersLoading: false,
  isCreating: false,
  isRemoving: false,
  error: null,
  lastUpdated: null,
  initialized: false,
};

// Payload interfaces
interface SetStakeholderGroupsPayload {
  groups: StakeholderGroup[];
}

interface SetStakeholdersPayload {
  stakeholders: StakeholderData[];
}

interface SetSelectedGroupPayload {
  groupId: string;
}

interface SetSelectedGroupInvitationPayload {
  invitation: string;
}

interface UpdateNewStakeholderPayload {
  field: keyof NewStakeholderData;
  value: any;
}

interface SetStakeholderListOpenPayload {
  open: boolean;
}

interface SetAddStakeholderOpenPayload {
  open: boolean;
}

interface SetLoadingPayload {
  isLoading: boolean;
}

interface SetStakeholdersLoadingPayload {
  stakeholdersLoading: boolean;
}

interface SetCreatingPayload {
  isCreating: boolean;
}

interface SetRemovingPayload {
  isRemoving: boolean;
}

interface SetErrorPayload {
  error: string | null;
}

interface AddStakeholderPayload {
  stakeholder: StakeholderData;
}

interface RemoveStakeholderPayload {
  stakeholderId: string;
}

interface UpdateStakeholderCountPayload {
  groupId: string;
  count: number;
}

const stakeholderSlice = createSlice({
  name: "stakeholder",
  initialState,
  reducers: {
    setStakeholderGroups: (state, action: PayloadAction<SetStakeholderGroupsPayload>) => {
      const { groups } = action.payload;
      state.groups = groups;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
      state.initialized = true;

      // Set default group if not already selected
      if (groups.length > 0 && !state.selectedGroupId) {
        const defaultGroup = groups.find(group => group.name === "Management");
        if (defaultGroup) {
          state.selectedGroupId = defaultGroup.id;
          state.selectedGroupInvitation = defaultGroup.invitation_token;
        }
      }
    },

    setStakeholders: (state, action: PayloadAction<SetStakeholdersPayload>) => {
      state.stakeholders = action.payload.stakeholders;
    },

    setSelectedGroup: (state, action: PayloadAction<SetSelectedGroupPayload>) => {
      const { groupId } = action.payload;
      state.selectedGroupId = groupId;
      
      // Update invitation token for selected group
      const group = state.groups.find(g => g.id === groupId);
      if (group) {
        state.selectedGroupInvitation = group.invitation_token;
      }
    },

    setSelectedGroupInvitation: (state, action: PayloadAction<SetSelectedGroupInvitationPayload>) => {
      state.selectedGroupInvitation = action.payload.invitation;
    },

    updateNewStakeholder: (state, action: PayloadAction<UpdateNewStakeholderPayload>) => {
      const { field, value } = action.payload;
      state.newStakeholder[field] = value;
    },

    resetNewStakeholder: (state) => {
      state.newStakeholder = { ...initialNewStakeholder };
    },

    setStakeholderListOpen: (state, action: PayloadAction<SetStakeholderListOpenPayload>) => {
      state.stakeholderListOpen = action.payload.open;
    },

    setAddStakeholderOpen: (state, action: PayloadAction<SetAddStakeholderOpenPayload>) => {
      state.addStakeholderOpen = action.payload.open;
    },

    setLoading: (state, action: PayloadAction<SetLoadingPayload>) => {
      state.isLoading = action.payload.isLoading;
    },

    setStakeholdersLoading: (state, action: PayloadAction<SetStakeholdersLoadingPayload>) => {
      state.stakeholdersLoading = action.payload.stakeholdersLoading;
    },

    setCreating: (state, action: PayloadAction<SetCreatingPayload>) => {
      state.isCreating = action.payload.isCreating;
    },

    setRemoving: (state, action: PayloadAction<SetRemovingPayload>) => {
      state.isRemoving = action.payload.isRemoving;
    },

    setError: (state, action: PayloadAction<SetErrorPayload>) => {
      state.error = action.payload.error;
      state.isLoading = false;
      state.isCreating = false;
      state.isRemoving = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    addStakeholder: (state, action: PayloadAction<AddStakeholderPayload>) => {
      state.stakeholders.push(action.payload.stakeholder);
    },

    removeStakeholder: (state, action: PayloadAction<RemoveStakeholderPayload>) => {
      state.stakeholders = state.stakeholders.filter(
        stakeholder => stakeholder.id !== action.payload.stakeholderId
      );
    },

    updateStakeholderCount: (state, action: PayloadAction<UpdateStakeholderCountPayload>) => {
      const { groupId, count } = action.payload;
      const group = state.groups.find(g => g.id === groupId);
      if (group) {
        group.stakeholder_count = count;
      }
    },

    resetStakeholder: (state) => {
      state.groups = [];
      state.stakeholders = [];
      state.selectedGroupId = '';
      state.selectedGroupInvitation = '';
      state.newStakeholder = { ...initialNewStakeholder };
      state.stakeholderListOpen = false;
      state.addStakeholderOpen = false;
      state.isLoading = false;
      state.stakeholdersLoading = false;
      state.isCreating = false;
      state.isRemoving = false;
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
  setStakeholderGroups,
  setStakeholders,
  setSelectedGroup,
  setSelectedGroupInvitation,
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
  removeStakeholder,
  updateStakeholderCount,
  resetStakeholder,
  setInitialized,
} = stakeholderSlice.actions;

export default stakeholderSlice.reducer;