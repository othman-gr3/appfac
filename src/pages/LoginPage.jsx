import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logoLogin.png";

const LoginPage = () => {
  const { login, userRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Navigate once role is known after login
  useEffect(() => {
    if (justLoggedIn && userRole !== null) {
      navigate(userRole === "admin" ? "/admin" : "/user");
    }
  }, [justLoggedIn, userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setJustLoggedIn(true);
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F2F4E7",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "#F2F4E7",
          border: "1px solid #E0E0D8",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: "40px 36px 36px" }}>
          {/* Logo */}
          <Box sx={{ mb: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
              component="img"
              src={logo}
              alt="AppFac"
              sx={{ width: 500, height: "auto", display: "block", mb: 1.5 }}
            />
            <Typography sx={{ fontSize: 12, color: "#6B6B6B", textAlign: "center", letterSpacing: "0.02em" }}>
              Connectez-vous à votre espace administrateur
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "#E0E0D8", mb: 3 }} />

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Email
            </Typography>
            <TextField
              id="login-email"
              type="email"
              fullWidth
              required
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5, ...inputStyle }}
            />

            <Typography
              sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}
            >
              Mot de passe
            </Typography>
            <TextField
              id="login-password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "#6B6B6B" }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3.5, ...inputStyle }}
            />

            <Button
              id="login-submit"
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.25,
                borderRadius: "4px",
                fontSize: 13,
                fontWeight: 500,
                bgcolor: "#2D6A4F",
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#245a42",
                  boxShadow: "none",
                },
                "&:disabled": {
                  bgcolor: "#E0E0D8",
                },
              }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : "Se connecter"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Clean outlined input — light mode
const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    fontSize: 13,
    "& fieldset": { borderColor: "#E0E0D8" },
    "&:hover fieldset": { borderColor: "#1C1C1E" },
    "&.Mui-focused fieldset": { borderColor: "#2D6A4F" },
  },
};

export default LoginPage;
