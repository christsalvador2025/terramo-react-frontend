// import { baseApiSlice } from "@/lib/redux/features/api/baseApiSlice";
// import authReducer from "@/lib/redux/features/auth/authSlice";


// export const rootReducer = {
// 	[baseApiSlice.reducerPath]: baseApiSlice.reducer,
// 	auth: authReducer,
 
// };

import { baseApiSlice } from "./api/baseApiSlice";
import authReducer from "./auth/authSlice";


export const rootReducer = {
	[baseApiSlice.reducerPath]: baseApiSlice.reducer,
	auth: authReducer,
 
};