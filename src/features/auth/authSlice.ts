import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../lib/constants';

interface AuthState {
  access_token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  userData: {
    userId?: string; 
    email?: string;
    roles?: string[];
  } | null;
}

const initialState: AuthState = {
  access_token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  isAuthenticated: false,
  userData: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || 'null'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        access_token: string;
        refreshToken: string;
        userData?: AuthState['userData'];
      }>
    ) => {
      state.access_token = action.payload.access_token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      
      if (action.payload.userData) {
        state.userData = action.payload.userData;
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(action.payload.userData)
        );
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
    },
    clearCredentials: (state) => {
      state.access_token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.userData = null;
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;