import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Container, TextField, Typography, Alert, Paper } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import extractErrorMessage from "../../utils/extractErrorMessage";
import Spinner from "../../utils/spinner";
import {
    useLazyProcessStakeholderInvitationQuery,
    useVerifyStakeholderEmailMutation,
    useRegisterStakeholderMutation,
} from "../../lib/redux/features/clients/_clientApiSlice";
import {
    emailVerificationSchema,
    stakeholderRegistrationSchema,
    TProcessInvitationResponse,
    TEmailVerificationSchema,
    TStakeholderRegistrationSchema,
} from "../../lib/_types/stakeholders";

type InvitationStep =
    | "initial"
    | "loading"
    | "error"
    | "email_verification"
    | "registration"
    | "completed"
    | "group_invitation_email";

export default function AcceptStakeholderInvitation() {
    const { token } = useParams<{ token: string }>();
    const { client } = useParams<{ client: string }>();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<InvitationStep>("initial");
    const [invitationDetails, setInvitationDetails] = useState<TProcessInvitationResponse | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>("");

    const [processInvitation] = useLazyProcessStakeholderInvitationQuery();
    const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyStakeholderEmailMutation();
    const [registerStakeholder, { isLoading: isRegistering }] = useRegisterStakeholderMutation();

    const emailForm = useForm<TEmailVerificationSchema>({
        resolver: zodResolver(emailVerificationSchema),
        mode: "all",
        defaultValues: { email: "", token: token || "" },
    });

    const registrationForm = useForm<TStakeholderRegistrationSchema>({
        resolver: zodResolver(stakeholderRegistrationSchema),
        mode: "all",
        defaultValues: { first_name: "", last_name: "", password: "", password2: "", token: token || "" },
    });

    // ✅ Fixed unwrap issue here
    useEffect(() => {
        if (!token) {
            setCurrentStep("error");
            setStatusMessage("Invalid invitation link. No token provided.");
            return;
        }
        console.log('client---------',client)
        const handleProcessToken = async () => {
            setCurrentStep("loading");

            try {
                console.log("🔍 Fetching invitation for token:", token);

                // unwrap() returns the data directly
                const data = await processInvitation(token).unwrap();
                console.log("✅ Invitation data:", data);

                setInvitationDetails(data);
                setStatusMessage(`Welcome to ${data.company_name}!`);

                switch (data.type) {
                    case "email_verification":
                        setCurrentStep("email_verification");
                        emailForm.setValue("token", data.token);
                        break;
                    case "registration":
                        setCurrentStep("registration");
                        registrationForm.setValue("token", data.token);
                        registrationForm.setValue("email", data.email || "");
                        break;
                    case "completed":
                        setCurrentStep("completed");
                        setStatusMessage(data.message || "Registration already completed for this invitation.");
                        break;
                    case "group_invitation":
                        setCurrentStep("group_invitation_email");
                        emailForm.setValue("token", data.token);
                        break;
                    default:
                        setCurrentStep("error");
                        setStatusMessage("An unknown invitation state was received.");
                }
            } catch (err) {
                console.error("❌ Invitation fetch error:", err);
                setCurrentStep("error");
                setStatusMessage(extractErrorMessage(err) || "Failed to process invitation token.");
                toast.error(extractErrorMessage(err) || "Failed to process invitation token.");
            }
        };

        handleProcessToken();
    }, [token, processInvitation, emailForm, registrationForm]);

    // Handle email verification form
    const onSubmitEmail = async (values: TEmailVerificationSchema) => {
        try {
            const response = await verifyEmail(values).unwrap();
            toast.success(response.message);
            setCurrentStep("registration");
            registrationForm.setValue("token", response.token);
            registrationForm.setValue("email", values.email);
        } catch (error) {
            toast.error(extractErrorMessage(error) || "Email verification failed.");
        }
    };

    // Handle registration form
    const onSubmitRegistration = async (values: TStakeholderRegistrationSchema) => {
        try {
            const response = await registerStakeholder(values).unwrap();
            toast.success(response.message);
            setCurrentStep("completed");
            setStatusMessage("Registration successful! Your account is pending approval.");
            setTimeout(() => navigate("/"), 5000);
        } catch (error) {
            toast.error(extractErrorMessage(error) || "Registration failed. Please try again.");
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case "loading":
                return <Spinner message="Verifying invitation..." />;

            case "email_verification":
            case "group_invitation_email":
                return (
                    <Box component="form" onSubmit={emailForm.handleSubmit(onSubmitEmail)} noValidate>
                        <Typography variant="h6" gutterBottom>
                            Please verify your email address
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter the email address that received the invitation to proceed.
                        </Typography>
                        <TextField
                            type="email"
                            label="Email Address"
                            variant="outlined"
                            fullWidth
                            required
                            {...emailForm.register("email")}
                            error={!!emailForm.formState.errors.email}
                            helperText={emailForm.formState.errors.email?.message}
                            sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" fullWidth disabled={isVerifyingEmail}>
                            {isVerifyingEmail ? "Verifying..." : "Verify Email"}
                        </Button>
                    </Box>
                );

            case "registration":
                return (
                    <Box component="form" onSubmit={registrationForm.handleSubmit(onSubmitRegistration)} noValidate>
                        <Typography variant="h6" gutterBottom>
                            Complete Your Registration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Please provide your details to finalize your account.
                        </Typography>
                        <TextField
                            label="First Name"
                            variant="outlined"
                            fullWidth
                            required
                            {...registrationForm.register("first_name")}
                            error={!!registrationForm.formState.errors.first_name}
                            helperText={registrationForm.formState.errors.first_name?.message}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Last Name"
                            variant="outlined"
                            fullWidth
                            required
                            {...registrationForm.register("last_name")}
                            error={!!registrationForm.formState.errors.last_name}
                            helperText={registrationForm.formState.errors.last_name?.message}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            type="password"
                            label="Password"
                            variant="outlined"
                            fullWidth
                            required
                            {...registrationForm.register("password")}
                            error={!!registrationForm.formState.errors.password}
                            helperText={registrationForm.formState.errors.password?.message}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            type="password"
                            label="Confirm Password"
                            variant="outlined"
                            fullWidth
                            required
                            {...registrationForm.register("password2")}
                            error={!!registrationForm.formState.errors.password2}
                            helperText={registrationForm.formState.errors.password2?.message}
                            sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" fullWidth disabled={isRegistering}>
                            {isRegistering ? "Registering..." : "Complete Registration"}
                        </Button>
                    </Box>
                );

            case "completed":
                return <Alert severity="success">{statusMessage}</Alert>;

            case "error":
                return <Alert severity="error">{statusMessage}</Alert>;

            default:
                return null;
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Accept Invitation
                </Typography>
                {invitationDetails && (
                    <Paper elevation={3} sx={{ p: 2, mb: 3, textAlign: "center" }}>
                        <Typography variant="h6">
                            You've been invited to join the {invitationDetails.group_name} group at{" "}
                            {invitationDetails.company_name}.
                        </Typography>
                    </Paper>
                )}
                {renderContent()}
            </Box>
        </Container>
    );
}
