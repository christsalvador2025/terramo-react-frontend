import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
    clients: {}
};
interface SetCurrentClient {
    id: string;
    company_name: string;
    company_photo: string;
    client_products: [];
}
const clientAdminSlice = createSlice({
    name: "clientAdmin",
    initialState,
    reducers: {

        setClientAdminCurrentClient: (state, action: PayloadAction<SetCurrentClient>)=>{
            state.clients = action.payload
        },
        setClientAdminCurrentClientNull: (state, action: PayloadAction<SetCurrentClient>)=>{
            state.clients = {}
        },
    },
});

export const { setClientAdminCurrentClient,setClientAdminCurrentClientNull } = clientAdminSlice.actions;
export default clientAdminSlice.reducer;
