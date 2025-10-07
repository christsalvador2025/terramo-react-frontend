
import React, { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from "react-hot-toast";
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
  DialogActions,
  CircularProgress
} from '@mui/material';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
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
import { setLogout } from "../lib/redux/features/auth/authSlice";
import { useAppDispatch } from '../lib/redux/hooks/typedHooks';
import { useLogoutUserMutation } from "../lib/redux/features/auth/authApiSlice";
import { resetStakeholderAnalysis } from '../lib/redux/features/stakeholders/stakeholderSlice';

// Dashboard icons
import EsGIcon from '../assets/dashboard-icons/fact_check.svg';
import StakeholderAnalysisIcon from '../assets/dashboard-icons/partner_exchange.svg'
import MaterialityIcon from '../assets/dashboard-icons/waterfall_chart.svg'
import NoImgDefault from '../assets/no-img.jpg'

const DRAWER_WIDTH = 280;

// Create Year Context
export const YearContext = createContext({
  selectedYear: '2025',
  setSelectedYear: () => {}
});

// Custom hook to use year context
export const useYearContext = () => {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error('useYearContext must be used within a YearProvider');
  }
  return context;
};

const ClientAdminDashboardLayout = () => {
  const clientadminState = useSelector((state) => state.clientadmin_data);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useAppDispatch();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleLogout = async () => {
    try {
      // Call the logout API to invalidate the token on the server
      await logoutUser().unwrap();
      // removeCookie("user_role");

      // Clear Redux state
      dispatch(setLogout());
      dispatch(resetStakeholderAnalysis());
      
      toast.success("You have been logged out.");
      // <CircularProgress size={20} color="inherit" />
      setTimeout(()=>{
        // alert('redirecting to .. client admin request')
         
        navigate('/client-admin/request-login/');
      }, 1)
      console.log('navigating to client admin..')
      navigate('/client-admin/request-login/');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if the API call fails, we should still clear local auth data
      dispatch(setLogout());
      dispatch(resetStakeholderAnalysis());
      // toast.success("You have been logged out.");
      navigate('/');
    }
  };

  const clientPurchasedProducts = clientadminState?.clients?.client_products?.map( item => item.product.slug) || []
 

  console.log('clientPurchasedProducts-----',clientPurchasedProducts)
  const navigationItems = [
    { 
      id: 'esg-check', 
      title: 'ESG-Check', 
      icon: EsGIcon, 
      path: '/client/dashboard/esg-check',
      disableMenu: false,
    },
    { 
      id: 'stakeholder-analyse',
      title: 'Stakeholder-Analyse', 
      icon: StakeholderAnalysisIcon, 
      path: '/client/dashboard/stakeholder-analyses',
      disableMenu:  !clientPurchasedProducts.includes("stakeholder-analyse"),
      // disableMenu: false,
    },
    { 
      id: 'double-materiality', 
      title: 'Doppelte Wesentlichkeit', 
      icon: MaterialityIcon, 
      path: '',
      disableMenu: true,
    },
    // { id: 'clients', title: 'Clients', icon: <GroupsIcon />, path: '/client/dashboard/stakeholder-analyses' },
    // { id: 'products', title: 'Products', icon: <GroupsIcon />, path: '/client/dashboard/products' },
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
    navigate('/client/dashboard/stakeholder-lists');
    setSettingsAnchor(null);
  };
  const handleESGCheckSettings = () => {
    navigate('/client/dashboard/esg-check-settings');
    setSettingsAnchor(null);
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
  const currentPath = location.pathname;
  const cloudinary_img = `${import.meta.env.VITE_CLOUDINARY_API_URL}/${import.meta.env.VITE_CLOUDINARY_NAME}`
  const sidebarClientImage = clientadminState?.clients.company_photo 
    ? `${cloudinary_img}/${clientadminState?.clients.company_photo}` 
    : NoImgDefault
  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
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
                  <GroupsOutlinedIcon sx={{ mr: 1 }} />
                  Einstellungen für Stakeholder
                </MenuItem>
                <MenuItem onClick={handleESGCheckSettings}>
                  <BarChartOutlinedIcon sx={{ mr: 1 }} />
                  ESGCheck Averages
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
                onChange={handleYearChange}
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
                  disabled={item.disableMenu}
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
                      {/* {item.icon} */}
                       <img src={item.icon}/>
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
            // position: 'absolute', 
            // bottom: 20, 
            // left: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            <Avatar sx={{ width: 120, height: 120, bgcolor: '#1976d2',  marginTop: '50%'}}>
              
                <img src={
                  sidebarClientImage
                  
                  }/>
              </Avatar>
          </Box>
        </Drawer>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </YearContext.Provider>
  );
};

export default ClientAdminDashboardLayout;