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
  is_answered: boolean;
  avg_priority?: number;
  avg_status_quo?: number;
}

interface CategoryData {
  category_info: CategoryInfo;
  questions: Question[];
}

interface DashboardData {
  client: Client;
  year: number;
  question_response: Record<string, CategoryData>;
  categories?: Record<string, CategoryData>;
}

interface EsgState {
  data: DashboardData | null;
  responses: Record<string, {
    priority: number | null;
    status_quo: number | null;
    comment: string;
    response_id?: string;
  }>;
  hasChanges: boolean;
  activeTab: number;
  summaryTab: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastUpdated: string | null;
  initialized: boolean;
}

const initialState: EsgState = {
  data: null,
  responses: {},
  hasChanges: false,
  activeTab: 0,
  summaryTab: 0,
  isLoading: false,
  isSaving: false,
  error: null,
  lastUpdated: null,
  initialized: false,
};

// Payload interfaces
interface SetEsgDataPayload {
  data: DashboardData;
}

interface UpdateResponsePayload {
  questionId: string;
  field: 'priority' | 'status_quo' | 'comment';
  value: any;
}

interface SetActiveTabPayload {
  tab: number;
}

interface SetSummaryTabPayload {
  tab: number;
}

interface SetLoadingPayload {
  isLoading: boolean;
}

interface SetSavingPayload {
  isSaving: boolean;
}

interface SetErrorPayload {
  error: string | null;
}

const esgSlice = createSlice({
  name: "esg",
  initialState,
  reducers: {
    setEsgData: (state, action: PayloadAction<SetEsgDataPayload>) => {
      const { data } = action.payload;
      state.data = data;
      state.lastUpdated = new Date().toISOString();
      state.error = null;
      state.initialized = true;

      // Initialize responses from data
      const initial: Record<string, any> = {};
      Object.values(data.question_response).forEach((category: CategoryData) => {
        category.questions.forEach((q: Question) => {
          initial[q.question_id] = {
            priority: q.priority ?? null,
            status_quo: q.status_quo ?? null,
            comment: q.comment ?? "",
            response_id: q.response_id,
          };
        });
      });
      state.responses = initial;
      state.hasChanges = false;
    },

    updateResponse: (state, action: PayloadAction<UpdateResponsePayload>) => {
      const { questionId, field, value } = action.payload;
      
      if (!state.responses[questionId]) {
        state.responses[questionId] = {
          priority: null,
          status_quo: null,
          comment: "",
        };
      }
      
      state.responses[questionId][field] = value;
      state.hasChanges = true;
    },

    setActiveTab: (state, action: PayloadAction<SetActiveTabPayload>) => {
      state.activeTab = action.payload.tab;
    },

    setSummaryTab: (state, action: PayloadAction<SetSummaryTabPayload>) => {
      state.summaryTab = action.payload.tab;
    },

    setLoading: (state, action: PayloadAction<SetLoadingPayload>) => {
      state.isLoading = action.payload.isLoading;
    },

    setSaving: (state, action: PayloadAction<SetSavingPayload>) => {
      state.isSaving = action.payload.isSaving;
    },

    setError: (state, action: PayloadAction<SetErrorPayload>) => {
      state.error = action.payload.error;
      state.isLoading = false;
      state.isSaving = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetChanges: (state) => {
      state.hasChanges = false;
    },

    resetEsg: (state) => {
      state.data = null;
      state.responses = {};
      state.hasChanges = false;
      state.activeTab = 0;
      state.summaryTab = 0;
      state.isLoading = false;
      state.isSaving = false;
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
  setEsgData,
  updateResponse,
  setActiveTab,
  setSummaryTab,
  setLoading,
  setSaving,
  setError,
  clearError,
  resetChanges,
  resetEsg,
  setInitialized,
} = esgSlice.actions;

export default esgSlice.reducer;