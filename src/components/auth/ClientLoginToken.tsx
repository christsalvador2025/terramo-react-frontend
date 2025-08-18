import { useEffect, useState } from 'react';
// import { useRouter, useParams } from 'next/navigation';
import { useNavigate, useParams } from "react-router-dom";
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
// import { useClientAdminTokenLoginMutation } from '@/lib/redux/features/auth/authApiSlice';
import { useClientAdminTokenLoginMutation } from "../../lib/redux/features/auth/authApiSlice"
import { useAppDispatch } from "../../lib/redux/hooks/typedHooks";
// import { setClientAdminCredentials, setAuth } from '@/lib/redux/features/auth/authSlice';
import { setClientAdminCredentials } from '../../lib/redux/features/auth/authSlice';
// import extractErrorMessage from '@/utils/extractErrorMessage';
import extractErrorMessage from '../../utils/extractErrorMessage';
import { setCookie } from "cookies-next";

interface TokenLoginResponse {
  message: string;
  message_stat: string;
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    last_login: string | null;
  };
  client: {
    id: number;
    company_name: string;
    email: string;
  };
}

export default function ClientAdminTokenLogin() {
  // const router = useRouter();
  const navigate = useNavigate();
  // const params = useParams();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [loginStatus, setLoginStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorStatus, setErrorStatus] = useState('');

  // RTK Query mutation
  const [tokenLogin, { isLoading }] = useClientAdminTokenLoginMutation();

  useEffect(() => {
    const handleTokenLogin = async () => {
      const token = params.token as string;
      
      if (!token) {
        setLoginStatus('error');
        setErrorMessage('Invalid login link');
        setErrorStatus('token_missing');
        return;
      }

      try {
        const response: TokenLoginResponse = await tokenLogin({ token }).unwrap();
        
        console.log("response->",response)
        // dispatch(setAuth());
        // Store authentication data
        dispatch(setClientAdminCredentials({
          access: response.access,
          refresh: response.refresh,
          user: response.user,
          client: response.client
        }));
        setCookie("user", JSON.stringify(response.user));
        // No need for localStorage - data is in Redux store now

        setLoginStatus('success');
        toast.success(response.message || 'Login successful!');

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          // router.push('/client-admin/dashboard');
          navigate("/client-admin/dashboard")
        }, 2000);

      } catch (error: any) {
        console.error('Token login error:', error);
        
        const errorMessage = extractErrorMessage(error);
        const status = error?.data?.status || '';
        
        setLoginStatus('error');
        setErrorMessage(errorMessage);
        setErrorStatus(status);

        // Show specific error messages
        if (status === 'token_invalid') {
          toast.error('Your login link has expired or is invalid. Please request a new one.');
        } else if (status === 'account_inactive') {
          toast.error('Your account is inactive. Please contact your administrator.');
        } else if (status === 'invitation_invalid') {
          toast.error('Your invitation status has changed. Please contact your administrator.');
        } else {
          toast.error(errorMessage || 'Login failed. Please try again.');
        }
        console.log('status=', status)
      }
    };

    handleTokenLogin();
  }, [params.token, tokenLogin, dispatch, navigate]);

  const handleRequestNewLink = () => {
    // router.push('/client-admin/login');
    navigate("/client-admin/request-login")
  };

  const getStatusContent = () => {
    switch (loginStatus) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 3, color: '#026770' }} />
            <Typography variant="h5" gutterBottom>
              Logging you in...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your login link.
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" component="div" gutterBottom>
                Login Successful!
              </Typography>
              <Typography variant="body2">
                You&apos;re being redirected to your dashboard...
              </Typography>
            </Alert>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" component="div" gutterBottom>
                Login Failed
              </Typography>
              <Typography variant="body2">
                {errorMessage}
              </Typography>
            </Alert>

            {/* Show specific help based on error status */}
            {errorStatus === 'token_invalid' && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Your login link has expired or been used already.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <button
                    onClick={handleRequestNewLink}
                    style={{
                      backgroundColor: '#026770',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Request New Login Link
                  </button>
                  <Typography variant="body2" color="text.secondary">
                    Click above to get a new login link sent to your email.
                  </Typography>
                </Box>
              </Box>
            )}

            {(errorStatus === 'account_inactive' || errorStatus === 'invitation_invalid') && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1">
                  Please contact your administrator for assistance.
                </Typography>
              </Box>
            )}

            {!['token_invalid', 'account_inactive', 'invitation_invalid'].includes(errorStatus) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Something went wrong. Please try requesting a new login link.
                </Typography>
                <button
                  onClick={handleRequestNewLink}
                  style={{
                    backgroundColor: '#026770',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Go to Login Page
                </button>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Client Admin Login
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          {getStatusContent()}
        </Box>

        {/* Help section */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Having trouble logging in?{' '}
            <a href="/support" style={{ color: '#026770' }}>
              Contact Support
            </a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}