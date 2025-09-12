import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
	page: 1,
	clients: {}
};
interface SetCurrentClient {
	id: string;
	company_name: string;
	company_photo: string;
}
const clientSlice = createSlice({
	name: "client",
	initialState,
	reducers: {
		setCurrentPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		},
		setTerramoAdminCurrentClient: (state, action: PayloadAction<SetCurrentClient>)=>{
			state.clients = action.payload
		},
		setClientAdminCurrentClient: (state, action: PayloadAction<SetCurrentClient>)=>{
			state.clients = action.payload
		},
		setTerramoAdminCurrentClientNull: (state, action: PayloadAction<SetCurrentClient>)=>{
			state.clients = {}
		},
		setClientAdminCurrentClientNull: (state, action: PayloadAction<SetCurrentClient>)=>{
			state.clients = {}
		},
	},
});

export const { setCurrentPage,setTerramoAdminCurrentClient,setTerramoAdminCurrentClientNull } = clientSlice.actions;
export default clientSlice.reducer;
