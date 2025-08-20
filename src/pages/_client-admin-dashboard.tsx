// components/Layout.js
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Groups as GroupsIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  SupervisedUserCircle as SegmentIcon,
  Logout as LogoutIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import Logo from "../assets/logo.svg";
// import { setLogout } from "../../lib/redux/features/auth/authSlice";
import { setLogout } from "../lib/redux/features/auth/authSlice";
import { useAppDispatch } from '../lib/redux/hooks/typedHooks';
import { useLogoutUserMutation } from "../lib/redux/features/auth/authApiSlice";

const DRAWER_WIDTH = 280;

const ClientAdminDashboardLayout = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useAppDispatch();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();
   

  const handleLogout = async () => {
    try {
      // Call the logout API to invalidate the token on the server
      await logoutUser().unwrap();
      removeCookie("user_role");
      // Clear Redux state
      dispatch(setLogout());
      
      
      toast.success("You have been logged out.");
      navigate('/terramo-admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if the API call fails, we should still clear local auth data
      dispatch(setLogout());
      
      
      toast.success("You have been logged out.");
      navigate('/');
    }
  };

  const navigationItems = [
    // { id: 'home', title: 'Dashboard', icon: <HomeIcon />, path: '/client/dashboard/' },
    { id: 'esg-check', title: 'ESG-Check', icon: <AssessmentIcon />, path: '/client/dashboard/esg-check' },
    { id: 'stakeholder-analyse', title: 'Stakeholder-Analyse', icon: <GroupsIcon />, path: '/client/dashboard/stakeholder' },
    { id: 'stakeholder-lists', title: 'Stakeholder-List', icon: <SegmentIcon />, path: '/client/dashboard/stakeholder-lists' },
    // { id: 'doppelte-wesentlichkeit', title: 'Doppelte Wesentlichkeit', icon: <EditIcon />, path: '/client/dashboard/doppelte-wesentlichkeit' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogoClick = () => {
    navigate('/client/dashboard/esg-check');
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  const handleSettingsNavigate = () => {
    navigate('/settings');
    setSettingsAnchor(null);
  };

  const handleLogoutClick = () => {
    // setLogoutDialog(true);
    handleLogout();
  };

  const handleLogoutConfirm = () => {
    // Add your logout logic here (e.g., clear tokens, redirect to login)
    console.log('User logged out');
    // Example: localStorage.removeItem('authToken');
    // navigate('/login');
    setLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialog(false);
  };

  // Get current active path for highlighting navigation items
  const currentPath = location.pathname;

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
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
            {/* Settings */}
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleSettingsClick}>
              <IconButton>
                <SettingsIcon />
              </IconButton>
              <Typography variant="body2">Einstellungen</Typography>
            </Box>
            
            {/* Settings Menu */}
            <Menu
              anchorEl={settingsAnchor}
              open={Boolean(settingsAnchor)}
              onClose={handleSettingsClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleSettingsNavigate}>
                <SettingsIcon sx={{ mr: 1 }} />
                Einstellungen öffnen
              </MenuItem>
            </Menu>

            {/* Logout */}
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleLogoutClick}>
              <IconButton>
                <LogoutIcon />
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

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'white',
            borderRight: '1px solid #e0e0e0',
            mt: 8
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Year Selector */}
          <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
            Aus welchem Jahr möchten Sie Ihre Daten sehen?
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
            </Select>
          </FormControl>

          {/* Navigation Menu */}
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={currentPath === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(2, 103, 112, 0.1)',
                      '& .MuiListItemIcon-root': {
                        color: '#026770'
                      },
                      '& .MuiListItemText-primary': {
                        color: '#026770',
                        fontWeight: 600
                      }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(2, 103, 112, 0.1)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Company Logo */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.6rem' }}>
              IHR LOGO
            </Typography>
          </Avatar>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default ClientAdminDashboardLayout;