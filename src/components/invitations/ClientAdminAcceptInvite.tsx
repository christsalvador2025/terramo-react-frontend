import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { Box, Button, Container, TextField, Typography, Alert } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../lib/redux/hooks/typedHooks";
import { setAuth } from "../../lib/redux/features/auth/authSlice";
import { 
    useAcceptInvitationByTokenQuery,
    useAcceptInvitationMutation
} from "../../lib/redux/features/clients/clientupdatedApiSlice";
import extractErrorMessage from "../../utils/extractErrorMessage";
import Spinner from "../../utils/spinner";

// Schema for email verification form
const emailVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type TEmailVerificationSchema = z.infer<typeof emailVerificationSchema>;

 
interface AcceptInvitationPageProps {
  token?: string | null;
}

export default function AcceptInvitationPage({ token }: AcceptInvitationPageProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [invitationStatus, setInvitationStatus] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

   
  const { 
    data: invitationData, 
    isLoading: isCheckingToken, 
    error: tokenError,
    refetch: refetchToken
  } = useAcceptInvitationByTokenQuery({ token }, { skip: !token });

  const [acceptInvitation, { isLoading: isSubmittingEmail }] = useAcceptInvitationMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TEmailVerificationSchema>({
    resolver: zodResolver(emailVerificationSchema),
    mode: "all",
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (invitationData) {
      const { message_stat, message, redirect_url } = invitationData;
      setStatusMessage(message);
      setInvitationStatus(message_stat);

      switch (message_stat) {
        case 'accepted_and_verified':
          toast.info(message);
          if (redirect_url) navigate(redirect_url);
          break;
        case 'email_verified':
          toast.success(message);
          setShowEmailForm(false);
          break;
        case 'accepted_and_for_verification':
          setShowEmailForm(true);
          toast.success(message);
          break;
        case 'invitation_not_found':
          toast.error(message);
          break;
        default:
          toast.info(message);
      }
    }
  }, [invitationData, navigate]);

  useEffect(() => {
    if (tokenError) {
      const errorMessage = extractErrorMessage(tokenError);
      toast.error(errorMessage || "Invalid or expired invitation token");
    }
  }, [tokenError]);

  const onSubmitEmail = async (values: TEmailVerificationSchema) => {
    try {
      const response = await acceptInvitation({
        email: values.email,
        token: token || "", // ✅ token is string now
      }).unwrap();

      if (response.access && response.refresh) {
        dispatch(setAuth());
        toast.success(response.message || "Login successful!");
        navigate("/client/dashboard/esg-check");
      } else {
        toast.success(response.message || "Email verified successfully");
        if (response.redirect_url) navigate(response.redirect_url);
      }
      
      reset();
    } catch (error) {
        console.log('errrror----',error)
      const errorMessage = extractErrorMessage(error);
      console.error('Email verification error:', errorMessage);
      if(error?.status === 400){
        console.log('error?.data?.error---',error?.data?.error)
         toast.error(error?.data?.error|| "Email doesn't match to invitation");
         
      }
      toast.error(errorMessage || "Failed to verify email");
    }
  };

  if (isCheckingToken) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spinner />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Verifying invitation...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (tokenError && !invitationData) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid or expired invitation link. Please contact support for assistance.
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
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Accept Invitation
        </Typography>

        {statusMessage && (
          <Alert 
            severity={
              invitationStatus === 'accepted_and_for_verification' ? 'success' : 
              invitationStatus === 'invitation_not_found' ? 'error' : 'info'
            } 
            sx={{ mb: 3 }}
          >
            {statusMessage}
          </Alert>
        )}

        {showEmailForm && (
          <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmitEmail)}>
            <Typography variant="h6" gutterBottom>
              Please verify your email address
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the email address that received the invitation to complete the verification process.
            </Typography>

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
                placeholder="Enter your email address"
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmittingEmail}
              sx={{ 
                background: "#026770", 
                color: "#FFFF",
                '&:hover': { background: "#024a52" }
              }}
            >
              {isSubmittingEmail ? 'Verifying...' : 'Verify Email & Login'}
            </Button>
          </form>
        )}

        {!showEmailForm && invitationStatus !== 'accepted_and_verified' && invitationStatus !== 'email_verified' && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => refetchToken()}
              disabled={isCheckingToken}
            >
              Retry Verification
            </Button>
          </Box>
        )}

        {invitationStatus === 'email_verified' && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Please check your email for the login link.
            </Typography>
            <Button
              variant="text"
              onClick={() => refetchToken()}
              sx={{ mt: 2 }}
            >
              Did not receive the email? Click to resend
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
