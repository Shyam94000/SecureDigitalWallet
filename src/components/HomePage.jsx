import React, { useState, useEffect, useContext } from "react"; // Import useContext
import { TextField } from "@mui/material";
import {
  Typography,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  IconButton,
  Fade,
  Backdrop,
} from "@mui/material";
import {
  Security as SecurityIcon,
  CloudSync as CloudSyncIcon,
  VerifiedUser as VerifiedUserIcon,
  LinearScale as LinearScaleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import {
  Box,
  Grid,
  Paper,
  Container,
  Select,
  FormControl,
  Card,
  CardContent,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext'; // Import AuthContext

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [language, setLanguage] = useState("English");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const navigate = useNavigate(); // Initialize useNavigate
  const { isAuthenticated } = useContext(AuthContext); // Consume isAuthenticated from AuthContext

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    alert(`Language changed to ${event.target.value}`);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Function to handle "Get Started" button click
  const handleGetStartedClick = () => {
    // Check if the user is authenticated
    if (isAuthenticated) {
      navigate('/dashboard'); // If authenticated, go directly to dashboard
    } else {
      navigate('/auth'); // If not authenticated, go to login/register page
    }
  };

  const modernColors = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
    dark: "#0f172a",
    light: "#f8fafc",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    cardGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  };

  const coreIssues = [
    {
      title: "Lack of Official Identity Documents",
      description: "Millions lack proper identity documents, preventing access to banking, healthcare, and education services.",
      icon: "📄",
      color: "#ef4444",
      gradient: "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
    },
    {
      title: "Centralized System Vulnerabilities",
      description: "Traditional systems are prone to corruption, inefficiency, and single points of failure.",
      icon: "🏛️",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)",
    },
    {
      title: "Privacy & Data Control Concerns",
      description: "Users have no control over their personal data and how it's shared across platforms.",
      icon: "🔒",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)",
    },
    {
      title: "Exclusion of Marginalized Communities",
      description: "Vulnerable populations are systematically excluded from accessing vital services.",
      icon: "🌍",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    },
  ];

  const capabilities = [
    {
      title: "Self-Sovereign Identity",
      description: "Users own and control their digital identity with decentralized wallets, sharing only necessary information.",
      icon: "🔐",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Zero-Knowledge Verification",
      description: "Prove specific attributes (age, qualifications) without revealing underlying personal data.",
      icon: "🎯",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Tamper-Proof Blockchain",
      description: "Immutable ledger ensures all verifications are transparent, auditable, and corruption-resistant.",
      icon: "⛓️",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
  ];

  const solutions = [
    {
      title: "Digital Credentials from Trusted Sources",
      description: "Colleges, governments, and institutions issue verifiable digital documents with blockchain-anchored hashes.",
      icon: "🎓",
    },
    {
      title: "Privacy-Preserving Verification",
      description: "Share only what's needed through QR codes and cryptographic proofs without exposing full documents.",
      icon: "🔍",
    },
    {
      title: "Decentralized Storage & Encryption",
      description: "Documents stored safely on IPFS with AES-256 encryption, protected against server breaches.",
      icon: "☁️",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        backgroundColor: modernColors.light,
        overflow: "hidden",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(135deg, ${modernColors.light} 0%, rgba(99, 102, 241, 0.05) 100%)`,
          position: "relative",
          overflow: "hidden",
          pt: 4,
        }}
      >
        {/* Background Animation */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
            animation: "pulse 4s ease-in-out infinite alternate",
            "@keyframes pulse": {
              "0%": { opacity: 0.5 },
              "100%": { opacity: 1 },
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={heroVariants}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem", lg: "5rem" },
                fontWeight: 800,
                textAlign: "center",
                mb: 3,
                background: modernColors.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
              }}
            >
              Secure Digital Wallet
            </Typography>

            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                color: "#64748b",
                mb: 6,
                fontWeight: 400,
                maxWidth: "800px",
                mx: "auto",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
              }}
            >
              Digital Identity and Document Verification System - Empowering Self-Sovereign Identity with Blockchain Security
            </Typography>

            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 6,
                  py: 2,
                  background: modernColors.gradient,
                  color: "white",
                  fontWeight: 600,
                  borderRadius: "50px",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 40px rgba(99, 102, 241, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
                onClick={handleGetStartedClick} // This now conditionally navigates
              >
                Get Started
              </Button>
            </Box>
          </motion.div>

          {/* Hero Image/Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Box
              sx={{
                width: "100%",
                height: "400px",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  fontSize: "6rem",
                  opacity: 0.1,
                  fontWeight: 900,
                  background: modernColors.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Secure Digital Wallet
              </Typography>
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  background: "radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
                  animation: "rotate 20s linear infinite",
                  "@keyframes rotate": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Core Issues Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={heroVariants}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 700,
              textAlign: "center",
              mb: 2,
              color: modernColors.dark,
            }}
          >
            The Problem We're Solving
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: "#64748b",
              mb: 8,
              fontWeight: 400,
              maxWidth: "800px",
              mx: "auto",
            }}
          >
            Addressing the critical issues in traditional identity verification systems that exclude millions from basic services
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {coreIssues.map((issue, index) => (
            <Grid item xs={12} md={6} key={index}>
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 }
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    background: issue.gradient,
                    border: `2px solid ${issue.color}20`,
                    borderRadius: "20px",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 30px 60px rgba(0, 0, 0, 0.15)",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          flexShrink: 0,
                        }}
                      >
                        {issue.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 600,
                            mb: 2,
                            color: modernColors.dark,
                          }}
                        >
                          {issue.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#64748b",
                            lineHeight: 1.6,
                          }}
                        >
                          {issue.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Capabilities Section */}
      <Box
        sx={{
          py: 12,
          background: "linear-gradient(135deg, #f8fafc 0%, rgba(99, 102, 241, 0.05) 100%)",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={heroVariants}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 700,
                textAlign: "center",
                mb: 2,
                color: modernColors.dark,
              }}
            >
              Revolutionary Solution Features
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                color: "#64748b",
                mb: 8,
                fontWeight: 400,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Our novel approach to digital identity puts users in complete control
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {capabilities.map((capability, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      background: capability.gradient,
                      borderRadius: "20px",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "100px",
                        height: "100px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        transform: "translate(30px, -30px)",
                      }}
                    />
                    <CardContent sx={{ p: 4, textAlign: "center", position: "relative" }}>
                      <Typography
                        variant="h2"
                        sx={{
                          fontSize: "3rem",
                          mb: 3,
                          opacity: 0.9,
                        }}
                      >
                        {capability.icon}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                        }}
                      >
                        {capability.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          lineHeight: 1.6,
                        }}
                      >
                        {capability.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Solutions Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={heroVariants}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 700,
              textAlign: "center",
              mb: 2,
              color: modernColors.dark,
            }}
          >
            How Secure Digital Wallet Works
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              color: "#64748b",
              mb: 8,
              fontWeight: 400,
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            A comprehensive approach to secure, decentralized identity verification
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {solutions.map((solution, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
              >
                <Card
                  sx={{
                    height: "100%",
                    background: "white",
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Typography
                      variant="h2"
                      sx={{
                        fontSize: "3rem",
                        mb: 3,
                        color: modernColors.primary,
                      }}
                    >
                      {solution.icon}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: modernColors.dark,
                      }}
                    >
                      {solution.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#64748b",
                        lineHeight: 1.6,
                      }}
                    >
                      {solution.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          background: modernColors.dark,
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SecureVerify
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.7,
              mb: 2,
            }}
          >
            Digital Identity and Document Verification System
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.6,
              mb: 4,
              fontStyle: "italic",
            }}
          >
            Team Quarks | Leader: Thrisha R | Challenge 9 
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4 }}>
            <Button sx={{ color: "white", textTransform: "none" }}>Privacy Policy</Button>
            <Button sx={{ color: "white", textTransform: "none" }}>Terms of Service</Button>
            <Button sx={{ color: "white", textTransform: "none" }}>Contact</Button>
          </Box>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.5,
            }}
          >
            © 2025 SecureVerify by Team Quarks. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;