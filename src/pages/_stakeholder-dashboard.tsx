// components/Layout.js
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
 
} from '@mui/material';

import {
  
  Logout as LogoutIcon,
 
} from '@mui/icons-material';
import Logo from "../assets/logo.svg";
import { setLogout } from "../lib/redux/features/auth/authSlice";
import { useAppDispatch } from '../lib/redux/hooks/typedHooks';
import { useLogoutUserMutation } from "../lib/redux/features/auth/authApiSlice";
import { resetStakeholderAnalysis } from '../lib/redux/features/stakeholders/stakeholderSlice';
 

import LoginAdminIcon from '../assets/dashboard-icons/account_circle.svg'

const StakeholderDashboardLayout = () => {
   
  const [logoutDialog, setLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutUser] = useLogoutUserMutation();
 

  // const handleLogout = async () => {
  //   try {
  //     // Call the logout API to invalidate the token on the server
  //     await logoutUser().unwrap();
  //   //   removeCookie("user_role");
  //     // Clear Redux state
  //     dispatch(setLogout());
  //     dispatch(resetStakeholderAnalysis());
  //     toast.success("You have been logged out.");
  //     setTimeout(()=>{
  //       navigate('/stakeholder/request-login/');
  //     }, )
  //     navigate('/stakeholder/request-login');
  //   } catch (error) {
  //     console.error('Logout error:', error);
      
  //     // Even if the API call fails, we should still clear local auth data
  //     dispatch(setLogout());
  //     dispatch(resetStakeholderAnalysis());
      
  //     // toast.success("You have been logged out.");
  //     navigate('/stakeholder/request-login');
  //   }
  // };

const handleLogout = async () => {
  try {
    await logoutUser().unwrap();

    dispatch(setLogout());
    dispatch(resetStakeholderAnalysis());

    toast.success("You have been logged out.");

    (() => {
      setTimeout(() => {
        navigate('/stakeholder/request-login/');
      }, 10);
    })();

  } catch (error) {
    console.error('Logout error:', error);

    dispatch(setLogout());
    dispatch(resetStakeholderAnalysis());

    toast.error("Logout failed, but you’ve been logged out locally.");

    navigate('/stakeholder/request-login/');
  }
};
   
  const handleLogoClick = () => {
    navigate('/client/dashboard/esg-check');
  };
 

  const handleLogoutClick = () => {
    handleLogout();
  };

  const handleLogoutConfirm = () => {
    console.log('User logged out');
    setLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialog(false);
  };

  // Get current active path for highlighting navigation items
   
  return (
   
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'white' }}>
        {/* Top Navigation Bar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'white',
            color: 'black',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={Logo} 
                alt="Logo" 
                style={{ 
                  width: "210px", 
                  marginRight: "2rem", 
                  cursor: "pointer" 
                }} 
                onClick={handleLogoClick}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
                  <img src={LoginAdminIcon} alt="Admin login icon"/>
           
                <Typography variant="body2">Angemeldet als: Admin</Typography>
              </Box>

              {/* Logout */}
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#026770' }} onClick={handleLogoutClick}>
                <IconButton >
                  <LogoutIcon sx={{color: '#026770', width: '17px', height: '17px'}}/>
                </IconButton>
                <Typography variant="body2">Logout</Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Logout Confirmation Dialog */}
        <Dialog
          open={logoutDialog}
          onClose={handleLogoutCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Logout bestätigen</DialogTitle>
          <DialogContent>
            <Typography>
              Sind Sie sicher, dass Sie sich abmelden möchten?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogoutCancel} color="primary">
              Abbrechen
            </Button>
            <Button onClick={handleLogoutConfirm} color="primary" variant="contained">
              Abmelden
            </Button>
            </DialogActions>
        </Dialog>

    
        
        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Outlet />
        </Box>
      </Box>
    
  );
};

export default StakeholderDashboardLayout;