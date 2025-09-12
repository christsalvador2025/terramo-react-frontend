import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  role: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login: string | null;
}

interface Client {
  id: number;
  company_name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  client: Client | null;
  accessToken: string | null;
  refreshToken: string | null;
  userType: 'terramo_admin' | 'client_admin' | 'stakeholder' | null | undefined;
  initialized: boolean; //  
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  client: null,
  accessToken: null,
  refreshToken: null,
  userType: null,
  initialized: false, //  
};

interface SetCredentialsPayload {
  access: string;
  refresh: string;
  user: User;
  client?: Client;
  userType?: 'terramo_admin' | 'client_admin' | 'stakeholder' | null | undefined;
}

interface SetUserDataPayload {
  user: User;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state) => {
      state.isAuthenticated = true;
      state.initialized = true; //  
    },
    setUserData: (state, action: PayloadAction<SetUserDataPayload>) => {
      const { user } = action.payload;
      state.isAuthenticated = true;
      state.user = user || null; 
      state.initialized = true; //  
    },
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const { access, refresh, user, client, userType } = action.payload;
      state.isAuthenticated = true;
      state.accessToken = access;
      state.refreshToken = refresh;
      state.user = user;
      state.client = client || null;
      state.userType = userType;
      state.initialized = true; // 
    },
    setClientAdminCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const { access, refresh, user, client } = action.payload;
      state.isAuthenticated = true;
      state.accessToken = access;
      state.refreshToken = refresh;
      state.user = user;
      state.client = client || null;
      state.userType = 'client_admin';
      state.initialized = true; //  
    },
    setLogout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.client = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.userType = null;
      state.initialized = true; // 
    },
    updateTokens: (state, action: PayloadAction<{ access: string; refresh?: string }>) => {
      state.accessToken = action.payload.access;
      if (action.payload.refresh) {
        state.refreshToken = action.payload.refresh;
      }
      state.initialized = true; //  
    },
  },
});

export const { 
  setAuth, 
  setCredentials,
  setClientAdminCredentials,
  setLogout,
  updateTokens,
  setUserData
} = authSlice.actions;

export default authSlice.reducer;
