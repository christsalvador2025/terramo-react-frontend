
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Container, TextField, Typography, Alert, Link } from "@mui/material";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
// import { useRequestClientAdminLoginLinkMutation } from "@/lib/redux/features/auth/authApiSlice";
import { useRequestClientAdminLoginLinkMutation } from "../../lib/redux/features/auth/authApiSlice"
// import extractErrorMessage from "@/utils/extractErrorMessage";
import extractErrorMessage from "../../utils/extractErrorMessage";

// Schema for login request form
const loginRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type TLoginRequestSchema = z.infer<typeof loginRequestSchema>;

export default function ClientAdminLoginRequest() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [errorStatus, setErrorStatus] = useState("");

  // RTK Query mutation
  const [requestLoginLink, { isLoading }] = useRequestClientAdminLoginLinkMutation();

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TLoginRequestSchema>({
    resolver: zodResolver(loginRequestSchema),
    mode: "all",
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: TLoginRequestSchema) => {
    try {
      setErrorStatus("");
      const response = await requestLoginLink({
        email: values.email,
      }).unwrap();

      // Success - show email sent message
      setEmailSent(true);
      setSentToEmail(values.email);
      toast.success(response.message || "Login link sent to your email!");
      reset();
      
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      const status = error?.data?.status || "";
      
      setErrorStatus(status);
      console.error('Login request error:', error);
      
      // Handle specific error statuses
      if (status === 'email_verification_required') {
        toast.error("Please verify your email first by clicking the invitation link.");
      } else if (status === 'invitation_pending') {
        toast.error("Please check your email for the invitation link or contact your administrator.");
      } else if (status === 'acceptance_pending') {
        toast.error("Please check your email and accept the invitation to complete setup.");
      } else if (status === 'invitation_not_found') {
        toast.error("No invitation found for this email. Please contact your administrator.");
      } else {
        toast.error(errorMessage || "Failed to send login link");
      }
    }
  };

  // Reset form to show email input again
  const handleSendAnother = () => {
    setEmailSent(false);
    setSentToEmail("");
    setErrorStatus("");
  };

  // Get help message based on error status
  const getHelpMessage = () => {
    switch (errorStatus) {
      case 'email_verification_required':
        return (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your email needs to be verified first. Please check your email for the invitation link 
              and complete the registration process.
            </Typography>
          </Alert>
        );
      case 'invitation_pending':
        return (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Please check your email for an invitation link. If you haven&apos;t received it, 
              contact your administrator for assistance.
            </Typography>
          </Alert>
        );
      case 'acceptance_pending':
        return (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Please check your email and accept the invitation to complete your account setup 
              before requesting a login link.
            </Typography>
          </Alert>
        );
      case 'invitation_not_found':
        return (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              No invitation found for this email address. Please contact your administrator 
              to get an invitation sent to your email.
            </Typography>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Client Admin Login
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your email address and we&apos;ll send you a secure login link.
        </Typography>

        {/* Show help message if there's an error status */}
        {errorStatus && getHelpMessage()}

        {!emailSent ? (
          // Email input form
          <form
            autoComplete="off"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <Box sx={{ mb: 2 }}>
              <TextField
                type="email"
                label="Email Address"
                variant="outlined"
                fullWidth
                required
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                placeholder="Enter your registered email address"
                autoFocus
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{ 
                background: "#026770", 
                color: "#FFFF",
                mb: 2,
                '&:hover': {
                  background: "#024a52"
                }
              }}
            >
              {isLoading ? 'Sending Login Link...' : 'Send Login Link'}
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              Don&apos;t have an account?{' '}
              <Link href="#" color="primary">
                Contact your administrator
              </Link>
            </Typography>
          </form>
        ) : (
          // Email sent confirmation
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" component="div" gutterBottom>
                Login Link Sent!
              </Typography>
              <Typography variant="body2">
                We&apos;ve sent a secure login link to <strong>{sentToEmail}</strong>
              </Typography>
            </Alert>

            <Typography variant="body1" sx={{ mb: 3 }}>
              Please check your email and click the login link to access your account.
              The link will expire in 1 hour.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleSendAnother}
                sx={{ 
                  borderColor: "#026770",
                  color: "#026770",
                  '&:hover': {
                    borderColor: "#024a52",
                    background: "rgba(2, 103, 112, 0.04)"
                  }
                }}
              >
                Send to Different Email
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Help section */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Having trouble logging in?{' '}
            <Link href="/support" color="primary">
              Contact Support
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}