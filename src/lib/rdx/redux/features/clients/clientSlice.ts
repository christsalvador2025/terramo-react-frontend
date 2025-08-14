import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
	page: 1,
};

const clientSlice = createSlice({
	name: "client",
	initialState,
	reducers: {
		setCurrentPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		},
	},
});

export const { setCurrentPage } = clientSlice.actions;
export default clientSlice.reducer;
