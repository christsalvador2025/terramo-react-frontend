import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Container, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useStakeholderTokenLoginMutation } from "../../lib/redux/features/auth/authApiSlice";
import extractErrorMessage from "../../utils/extractErrorMessage";

export default function StakeholderTokenLogin() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loginStatus, setLoginStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");
  const [stakeholderData, setStakeholderData] = useState<any>(null);

  const [tokenLogin, { isLoading }] = useStakeholderTokenLoginMutation();

  useEffect(() => {
    if (token) {
      handleTokenLogin(token);
    }
  }, [token]);

  const handleTokenLogin = async (tokenValue: string) => {
    try {
      setLoginStatus('loading');
      const response = await tokenLogin({ token: tokenValue }).unwrap();

      // Success
      setLoginStatus('success');
      setStakeholderData(response.stakeholder);
      toast.success(response.message || "Login successful!");

      // Store stakeholder data in localStorage or context as needed
      // localStorage.setItem('stakeholder', JSON.stringify(response.stakeholder));
      
      // Redirect to stakeholder dashboard after a short delay
      setTimeout(() => {
        navigate('/stakeholder/dashboard');
      }, 2000);

    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      const status = error?.data?.status || "";
      
      setLoginStatus('error');
      console.error('Stakeholder token login error:', error);
      
      if (status === 'invalid_token') {
        setErrorMessage("This login link is invalid or has expired. Please request a new login link.");
      } else if (status === 'account_status_changed') {
        setErrorMessage("Your account status has changed. Please contact your administrator.");
      } else {
        setErrorMessage(errorMessage || "Login failed. Please try again.");
      }
      
      toast.error(errorMessage || "Login failed");
    }
  };

  const handleRequestNewLink = () => {
    navigate('/stakeholder/request-login');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        {loginStatus === 'loading' && (
          <Box>
            <CircularProgress size={60} sx={{ color: '#026770', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Logging you in...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your login link.
            </Typography>
          </Box>
        )}

        {loginStatus === 'success' && stakeholderData && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Welcome back, {stakeholderData.first_name || stakeholderData.email}!
              </Typography>
              <Typography variant="body2">
                You have successfully logged in to {stakeholderData.group_name}.
              </Typography>
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              Redirecting you to your dashboard...
            </Typography>
            
            <CircularProgress size={30} sx={{ color: '#026770' }} />
          </Box>
        )}

        {loginStatus === 'error' && (
          <Box>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Login Failed
              </Typography>
              <Typography variant="body2">
                {errorMessage}
              </Typography>
            </Alert>

            <Button
              variant="contained"
              onClick={handleRequestNewLink}
              sx={{ 
                background: "#026770", 
                color: "#FFFF",
                '&:hover': {
                  background: "#024a52"
                }
              }}
            >
              Request New Login Link
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}