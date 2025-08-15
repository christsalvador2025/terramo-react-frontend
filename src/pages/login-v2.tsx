// src/features/auth/Login.tsx
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useLoginUserMutation } from "../api/authApiSlice";

import { useLoginUserMutation } from "../lib/redux/features/auth/authApiSlice"
// import { useAppDispatch } from "../app/hooks";
import { useAppDispatch } from "../lib/redux/hooks/typedHooks";
// import { setCredentials } from "./authSlice";
import { setCredentials } from "../lib/redux/features/auth/authSlice"
import LoadingSpinner from "../components/LoadingSpinner";
 
// import { saveAuthToStorage } from "../utils/authPersistence";
import { toast } from "react-hot-toast";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  
  const [loginTerramoAdmin, { isLoading }] = useLoginUserMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const response = await loginTerramoAdmin({
        email: formData.email,
        password: formData.password
      }).unwrap();

      // Determine user type based on role
      // const userType = response.user.role === 'terramo_admin' ? 'admin' : 'client_admin';

      // Store authentication state and user data
      dispatch(setCredentials({
        access: response.access,
        refresh: response.refresh,
        user: response.user,
        userType: response.role
      }));


    
      
      toast.success("Login Successful");
      navigate("/stakeholders");
      
      // Reset form
      setFormData({ email: "", password: "" });
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("An error occurred");
    }
  };

  // if (isLoading) {
  //   return <LoadingSpinner fullScreen />;
  // }

  return (
    <Container maxWidth="sm" component="main">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Terramo
        </Typography>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          noValidate 
          sx={{ 
            mt: 1, 
            width: '100%', 
            maxWidth: 400,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;