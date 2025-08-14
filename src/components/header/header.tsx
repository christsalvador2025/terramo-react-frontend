import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { AppBar, Button, Container, Stack, Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeaderLogo from "./header-logo";
import NavLink from "./header-nav-link";
import { useLogoutUserMutation } from "../../lib/redux/features/auth/authApiSlice";
import { useAppDispatch } from '../../lib/redux/hooks/typedHooks';
import { setLogout } from "../../lib/redux/features/auth/authSlice";
import { toast } from 'react-hot-toast';
 

const Header = ({
  currentPath,
  isAuthenticated,
}: {
  currentPath: string;
  isAuthenticated: boolean;
}) => {
  const dispatch = useAppDispatch();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout API to invalidate the token on the server
      await logoutUser().unwrap();
      
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

  const handleLogin = () => {
    navigate("/terramo-admin/login");
  };

  return (
    <AppBar position="static" color="transparent">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems={"center"}
            width={"100%"}
          >
            <Stack direction="row" spacing={2}>
              <HeaderLogo />
              {/* Only show navigation links when authenticated */}
              {isAuthenticated && (
                <>
                  {/* <NavLink
                    href="/customers"
                    label="Kunden"
                    currentPath={currentPath}
                  />
                  <NavLink
                    href="/stakeholders"
                    label="Stakeholders"
                    currentPath={currentPath}
                  />
                  <NavLink
                    href="/persons"
                    label="Persons"
                    currentPath={currentPath}
                  />
                  <NavLink
                    href="/sample-form"
                    label="Upload"
                    currentPath={currentPath}
                  /> */}
                </>
              )}
            </Stack>
            <Button
              variant="contained"
              color="primary"
              startIcon={isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
              onClick={isAuthenticated ? handleLogout : handleLogin}
              disabled={isLoggingOut}
            >
              {isLoggingOut 
                ? "Logging out..." 
                : isAuthenticated 
                  ? "Logout" 
                  : "Login"
              }
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;