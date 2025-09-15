import { Box, Button, Container, Typography, Card, CardContent, Alert } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircleOutline, HourglassEmpty } from "@mui/icons-material";

interface LocationState {
  email?: string;
  stakeholder_id?: string;
}

export default function StakeholderPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <HourglassEmpty sx={{ fontSize: 80, color: "#026770", mb: 2 }} />
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
              Registration Complete!
            </Typography>

            <Alert severity="success" sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {/* <CheckCircleOutline sx={{ mr: 1 }} /> */}
                <Typography variant="h6">Registration Successful</Typography>
              </Box>
              {state?.email && (
                <Typography variant="body2">
                  Your registration has been submitted for: <strong>{state.email}</strong>
                </Typography>
              )}
            </Alert>

            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Waiting for Administrator Approval
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Your registration has been successfully submitted and is currently under review. 
              A system administrator will review your application and approve your access.
            </Typography>

            <Box sx={{ mb: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                What happens next?
              </Typography>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Administrator reviews your registration
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • You'll receive an email when approved
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Use the login link in the email to access the system
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> This process may take 24-48 hours. You'll receive 
                an email notification once your account has been approved.
              </Typography>
            </Alert>

            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ 
                borderColor: "#026770",
                color: "#026770",
                '&:hover': { 
                  borderColor: "#024a52",
                  backgroundColor: "#f0f8ff"
                }
              }}
            >
              Return to Home
            </Button>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Have questions? Contact your system administrator for assistance.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}