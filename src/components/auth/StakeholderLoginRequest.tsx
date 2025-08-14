import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Container, TextField, Typography, Alert, Link } from "@mui/material";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRequestStakeholderLoginLinkMutation } from "../../lib/redux/features/auth/authApiSlice";
import extractErrorMessage from "../../utils/extractErrorMessage";

// Schema for stakeholder login request form
const stakeholderLoginRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type TStakeholderLoginRequestSchema = z.infer<typeof stakeholderLoginRequestSchema>;

export default function StakeholderLoginRequest() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [errorStatus, setErrorStatus] = useState("");

  // RTK Query mutation
  const [requestLoginLink, { isLoading }] = useRequestStakeholderLoginLinkMutation();

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TStakeholderLoginRequestSchema>({
    resolver: zodResolver(stakeholderLoginRequestSchema),
    mode: "all",
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: TStakeholderLoginRequestSchema) => {
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
      console.error('Stakeholder login request error:', error);
      
      // Handle specific error statuses
      if (status === 'stakeholder_not_found') {
        toast.error("No registered stakeholder account found. Please contact your administrator or complete registration first.");
      } else if (status === 'account_inactive') {
        toast.error("Your account is inactive. Please contact your administrator.");
      } else if (status === 'email_send_failed') {
        toast.error("Failed to send email. Please try again later.");
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
      case 'stakeholder_not_found':
        return (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              No registered stakeholder account found for this email address. Please make sure you have:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Completed your stakeholder registration</li>
              <li>Been approved by your administrator</li>
              <li>Used the correct email address</li>
            </Box>
          </Alert>
        );
      case 'account_inactive':
        return (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your stakeholder account is inactive. Please contact your administrator 
              to reactivate your account.
            </Typography>
          </Alert>
        );
      case 'email_send_failed':
        return (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              There was a problem sending the email. Please check your internet connection 
              and try again in a few minutes.
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
          Stakeholder Login
        </Typography>

        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your registered email address and we&apos;ll send you a secure login link.
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
                placeholder="Enter your stakeholder email address"
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
              Not registered as a stakeholder?{' '}
              <Link href="#" color="primary">
                Contact your group administrator
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
              Please check your email and click the login link to access your stakeholder portal.
              The link will expire in 1 hour for security purposes.
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
            Need help with your stakeholder account?{' '}
            <Link href="/stakeholder/support" color="primary">
              Contact Support
            </Link>
          </Typography>
        </Box>

        {/* Additional info for stakeholders */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Note:</strong> Only approved and registered stakeholders can request login links. 
            If you&apos;re having trouble, please contact your group administrator.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}