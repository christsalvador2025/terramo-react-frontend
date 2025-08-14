import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const navigate = useNavigate();

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
  };

  // Dummy login logic
  const handleLoginSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsAuthenticated(true);
    navigate("/customers");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Anmelden
        </Typography>
        <form autoComplete="off" onSubmit={handleLoginSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              type="text"
              label="Benutzername"
              variant="outlined"
              fullWidth
              value={emailInput}
              onChange={handleUserChange}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              type="password"
              label="Passwort"
              variant="outlined"
              fullWidth
              value={passwordInput}
              onChange={handlePasswordChange}
            />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
