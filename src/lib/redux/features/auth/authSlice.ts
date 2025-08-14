

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
	id: number;
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
	userType: 'terramo_admin' | 'client_admin' | 'stakeholder' |null;
}

const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	client: null,
	accessToken: null,
	refreshToken: null,
	userType: null,
};

interface SetCredentialsPayload {
	access: string;
	refresh: string;
	user: User;
	client?: Client;
	userType?: 'terramo_admin' | 'client_admin' | 'stakeholder';
}

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setAuth: (state) => {
			state.isAuthenticated = true;
		},
		
		// NEW: Enhanced credentials setter for both admin and client admin
		setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
			const { access, refresh, user, client, userType = 'terramo_admin' } = action.payload;
			state.isAuthenticated = true;
			state.accessToken = access;
			state.refreshToken = refresh;
			state.user = user;
			state.client = client || null;
			state.userType = userType;
		},
		
		// NEW: Set client admin specific credentials
		setClientAdminCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
			const { access, refresh, user, client } = action.payload;
			state.isAuthenticated = true;
			state.accessToken = access;
			state.refreshToken = refresh;
			state.user = user;
			state.client = client || null;
			state.userType = 'client_admin';
		},
		
		setLogout: (state) => {
			state.isAuthenticated = false;
			state.user = null;
			state.client = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.userType = null;
		},
		
		// NEW: Update tokens (for refresh)
		updateTokens: (state, action: PayloadAction<{ access: string; refresh?: string }>) => {
			state.accessToken = action.payload.access;
			if (action.payload.refresh) {
				state.refreshToken = action.payload.refresh;
			}
		},
	},
});

export const { 
	setAuth, 
	setCredentials,
	setClientAdminCredentials,
	setLogout,
	updateTokens
} = authSlice.actions;

export default authSlice.reducer;