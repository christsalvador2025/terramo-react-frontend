import { baseApiSlice } from "./api/baseApiSlice";
import authReducer from "./auth/authSlice";
import esgReducer from './clients/esgSlice';
import stakeholderReducer from './clients/esgStakeholderSlice';
import stakeholderAnalysisReducer from "./stakeholders/stakeholderSlice"
import productsReducer from './products/productSlice'
import clientReducer from './clients/clientSlice'
import clientAdminDataReducer from './clients/clientAdminSlice'
export const rootReducer = {
    [baseApiSlice.reducerPath]: baseApiSlice.reducer,
    auth: authReducer,
    stakeholderAnalysis: stakeholderAnalysisReducer,
    products: productsReducer,
    esg: esgReducer,
    stakeholder: stakeholderReducer,
    terramoadmin_esg: clientReducer,
    clientadmin_data: clientAdminDataReducer,
};