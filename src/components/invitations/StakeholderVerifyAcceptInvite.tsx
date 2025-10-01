import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useValidateStakeholderInvitationMutation,
  useSubmitStakeholderEmailMutation,
} from "../../lib/redux/features/stakeholders/stakeholderApiSlice";
import extractErrorMessage from "../../utils/extractErrorMessage";
import Spinner from "../../utils/spinner";

// Schema for email verification form
const emailVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type TEmailVerificationSchema = z.infer<typeof emailVerificationSchema>;

interface InvitationData {
  type: string;
  group_id: string;
  group_name: string;
  company_name: string;
  requires_email: boolean;
  token: string;
}

export default function StakeholderInvitation() {
  const navigate = useNavigate();
  const { token, client_id } = useParams<{ token: string; client_id: string }>();
  console.log("token----", token);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [hasValidated, setHasValidated] = useState(false); // Flag to prevent double validation

  const [validateInvitation] = useValidateStakeholderInvitationMutation();
  const [submitEmail, { isLoading: isSubmittingEmail }] = useSubmitStakeholderEmailMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TEmailVerificationSchema>({
    resolver: zodResolver(emailVerificationSchema),
    mode: "all",
    defaultValues: { email: "" },
  });

  // Validate token on component mount
  useEffect(() => {
    // Only run the validation logic if we haven't already
    if (hasValidated) {
      return;
    }

    const validateToken = async () => {
      if (!token || !client_id) {
        toast.error("Invalid invitation link");
        navigate("/");
        return;
      }

      try {
        setIsValidatingToken(true);
        const response = await validateInvitation({ token, client_id }).unwrap();
        setInvitationData(response);
        setShowEmailForm(true);
        // toast.success(`Welcome to ${response.company_name}!`);
        setHasValidated(true); // Set the flag to true after successful validation
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage || "Invalid or expired invitation token");
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token, client_id, validateInvitation, navigate, hasValidated]);

  const onSubmitEmail = async (values: TEmailVerificationSchema) => {
    if (!token || !client_id) {
      toast.error("Invalid invitation token or client ID");
      return;
    }

    try {
      const response = await submitEmail({
        email: values.email,
        token: token,
        client_id,
      }).unwrap();
      console.log("response->>", response);

      switch (response.action) {
        case "redirect_to_request_login":
          toast.success(response.message);
          if (response.redirect_url) {
            navigate(response.redirect_url);
          }
          break;
        case "complete_registration":
        case "register":
          toast.success(response.message);
          navigate("/stakeholder/register", {
            state: {
              email: response.email,
              token: response.token,
              client: response.client,
              from_invitation: true,
            },
          });
          break;
        case "auto_login":
            // Note: This case might not be reached with the new backend logic.
            // If it is, the action is now 'redirect_to_request_login'.
            toast.success(response.message);
            if (response.redirect_url) {
                navigate(response.redirect_url);
            }
            break;

        case "waiting_for_approval":
          toast(response.message || "Waiting for Approval.");
          return
          break;
        default:
          toast(response.message || "Action not recognized.");
      }

      reset();
    } catch (error) {
      console.log("Email submission error:", error);
      const errorMessage = extractErrorMessage(error);
      console.log('errorMessage-',error?.data?.email)
    
      if (error?.status === 400) {
        if(error?.data?.email[0]){
          toast.error(error?.data?.email[0] || "Please check your email and try again");
          return;
        }
        toast.error(error?.data?.message || "Please check your email and try again");
      }
      else {
        toast.error(errorMessage || "Failed to verify email");
      }
    }
  };

  if (isValidatingToken) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <Spinner />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Validating invitation...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!invitationData) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Invalid or expired invitation link. Please contact your administrator for assistance.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
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
              Join {invitationData.company_name}
            </Typography>

            <Alert severity="success" sx={{ mb: 3 }}>
              You've been invited to join{" "}
              <strong> {invitationData.group_name} </strong> at{" "}
              <strong> {invitationData.company_name} </strong>
            </Alert>

            {showEmailForm && (
              <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmitEmail)}>
                <Typography variant="h6" gutterBottom>
                  Enter Your Email Address
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please enter the email address that received this invitation to continue.
                </Typography>

                <Box sx={{ mb: 3 }}>
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
                    sx={{ mb: 2 }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmittingEmail}
                  sx={{
                    background: "#026770",
                    color: "#FFFFFF",
                    py: 1.5,
                    fontSize: "1.1rem",
                    "&:hover": { background: "#024a52" },
                    "&:disabled": { background: "#ccc" },
                  }}
                >
                  {isSubmittingEmail ? "Processing..." : "Continue"}
                </Button>
              </form>
            )}

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Having trouble? Contact your administrator for assistance.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}