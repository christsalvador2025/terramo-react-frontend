// import {  Navigate, Outlet } from "react-router-dom"

// import { useAppSelector } from '../app/hooks';

// // const { isAuthenticated } = useAppSelector((state) => state.auth);
// const RequireAuth = () => {
  
//     const { access_token, isAuthenticated } = useAppSelector(state => state.auth);
    
//      if (!access_token && !isAuthenticated) {

//         console.log("you dont have access!")
//         return <Navigate to="/login" />
//     }
//     return (
//         access_token && <Outlet />
            
//     )
// }
// export default RequireAuth


import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from '../lib/redux/hooks/typedHooks';

const RequireAuth = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  // Simple check - your PersistAuth handles cookie validation
  if (!isAuthenticated) {
    console.log("Access denied - not authenticated");
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected routes
  return <Outlet />;
};

export default RequireAuth;