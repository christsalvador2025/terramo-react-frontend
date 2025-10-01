import React, { useEffect } from 'react'; // Import useEffect
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../lib/redux/hooks/typedHooks';
import { removeRole } from "./redux/features/auth/authSlice";
import Spinner from "../utils/spinner";

const RequireAuth = () => {
    const { isAuthenticated, initialized, role } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const hasRole = role && role === 'stakeholder';

    // *** FIX: Run the side effect in a useEffect hook ***
    useEffect(() => {
        if (!isAuthenticated && hasRole) {
            console.log("Cleanup: Removing role and forcing stakeholder re-login.");
            // Dispatch the action here, after the render cycle.
            dispatch(removeRole());
        }
    }, [isAuthenticated, hasRole, dispatch]); // Dependency array ensures it runs when these values change

    if (!initialized) {
        return <div><Spinner/></div>;
    }

    if (!isAuthenticated) {
        console.log("Access denied - not authenticated", role);

        // Now, we only handle the redirection based on the state.
        if (hasRole) {
            return <Navigate to="/stakeholder/request-login/" replace/>;
        }
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the protected routes
    return <Outlet />;
};

export default RequireAuth;