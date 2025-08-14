import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { Box, Button, Container, TextField, Typography, Alert, Card, CardContent } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { 
    useRegisterStakeholderMutation
} from "../../lib/redux/features/stakeholders/stakeholderApiSlice";
import extractErrorMessage from "../../utils/extractErrorMessage";

// Schema for stakeholder registration form
const registrationSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100, "First name is too long"),
  last_name: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
});

type TRegistrationSchema = z.infer<typeof registrationSchema>;

interface LocationState {
  email?: string;
  token?: string;
  from_invitation?: boolean;
}

export default function StakeholderRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const [registerStakeholder, { isLoading: isRegistering }] = useRegisterStakeholderMutation();
console.log('LocationState-->', state)
  const { register, handleSubmit, formState: { errors } } = useForm<TRegistrationSchema>({
    resolver: zodResolver(registrationSchema),
    mode: "all",
    defaultValues: { 
      first_name: "", 
      last_name: "" 
    },
  });

  
  useEffect(() => {
    // Check if we have email and token from the invitation flow
    if (state?.email && state?.token && state?.from_invitation) {
      setEmail(state.email);
      setToken(state.token);
      console.log("state.email -> ", state.email)
      console.log("state.token -> ", state.token)
    } else {
      // If not coming from invitation, redirect to home
      toast.error("Invalid access. Please use the invitation link.");
    //   navigate('/');
    }
  }, [state, navigate]);

  const onSubmitRegistration = async (values: TRegistrationSchema) => {
    if (!email || !token) {
      toast.error("Missing required information. Please use the invitation link.");
      return;
    }

    try {
      const response = await registerStakeholder({
        email: email,
        first_name: values.first_name,
        last_name: values.last_name,
        token: token,
      }).unwrap();

      toast.success(response.message);
      console.log('token===>',token)
      console.log('email===>',email)
      // Redirect to pending approval page or dashboard
      if (response.redirect_url) {
        navigate(response.redirect_url);
      } else {
        navigate('/stakeholder/pending', { 
          state: { 
            email: response.email,
            stakeholder_id: response.stakeholder_id 
          } 
        });
      }

    } catch (error) {
      console.log('Registration error:', error);
      const errorMessage = extractErrorMessage(error);
      
      if (error?.status === 400) {
        toast.error(error?.data?.error || "Registration failed. Please check your information.");
      } else {
        toast.error(errorMessage || "Failed to complete registration");
      }
    }
  };

  if (!email || !token) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid access. Please use the invitation link sent to your email.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ background: "#026770" }}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
              Complete Your Registration
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Registering with email: <strong>{email}</strong>
            </Alert>

            <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmitRegistration)}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Please provide your name to complete the registration process.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("first_name")}
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                  placeholder="Enter your first name"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Last Name"
                  variant="outlined"
                  fullWidth
                  required
                  {...register("last_name")}
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                  placeholder="Enter your last name"
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isRegistering}
                sx={{ 
                  background: "#026770", 
                  color: "#FFFFFF",
                  py: 1.5,
                  fontSize: "1.1rem",
                  '&:hover': { background: "#024a52" },
                  '&:disabled': { background: "#ccc" }
                }}
              >
                {isRegistering ? 'Registering...' : 'Complete Registration'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                After registration, you'll need to wait for administrator approval before you can access the system.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}