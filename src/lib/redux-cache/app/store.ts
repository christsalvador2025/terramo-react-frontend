import { configureStore } from '@reduxjs/toolkit';
// import projectInfoSlice from '../features/projects/projectInfoSlice';
// import { rootApi } from '../features/api/rootApi';
import { apiSlice } from '../features/api/apiSlice';
// import { projectApi } from '../features/projects/projectApi';
import authReducer from "../auth/authSlice";
import stakeholderAnalysisReducer from "../stakeholders/stakeholderSlice"

// import stakeholderAnalysisReducer from "./stakeholders/stakeholderSlice"

// export const rootReducer = {
//     [baseApiSlice.reducerPath]: baseApiSlice.reducer,
//     auth: authReducer,
//     stakeholderAnalysis: stakeholderAnalysisReducer,
// };

export const store = configureStore({
	reducer: {
        // [projectApi.reducerPath]: projectApi.reducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        stakeholderAnalysis: stakeholderAnalysisReducer,
        // projectInfo: projectInfoSlice,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: false,
 
});