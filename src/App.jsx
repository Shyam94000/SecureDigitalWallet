import React, { useState, useEffect, lazy, Suspense } from "react";
import { Container, Box, CircularProgress, Typography, Alert } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { loadModels } from "./components/loadModels";
import { AuthContext } from './components/AuthContext';

// Lazy load components
const DocumentScanner = lazy(() => import("./components/DocumentScanner"));
const FaceAuthentication = lazy(() => import("./components/FaceAuthentication"));
const AuthenticatedProfile = lazy(() => import("./components/AuthenticatedProfile"));
const Header = lazy(() => import("./components/Header"));
const TeamPage = lazy(() => import("./components/TeamPage"));
const HomePage = lazy(() => import("./components/HomePage"));
const AuthPage = lazy(() => import("./components/AuthPage.jsx"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const QRVerification = lazy(() => import("./components/QRVerification"));

// ProtectedRoute component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};

function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // ADD THESE MISSING STATE VARIABLES
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [authenticationResult, setAuthenticationResult] = useState(null);

  // Face Recognition & Document Data States
  const [scannedIdFaceDescriptor, setScannedIdFaceDescriptor] = useState(null);
  const [scannedIdFaceImage, setScannedIdFaceImage] = useState(null);
  const [extractedDocumentData, setExtractedDocumentData] = useState(null);

  // Model Loading States
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [hashVerificationError, setHashVerificationError] = useState(null);

  const navigate = useNavigate();

  // Auth Context Functions
  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setCurrentUser({ username });
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ username }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthenticatedUser(null); // Clear authenticated user
    setAuthenticationResult(null); // Clear authentication result
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    // Clear sensitive data
    setScannedIdFaceDescriptor(null);
    setScannedIdFaceImage(null);
    setExtractedDocumentData(null);
    navigate('/');
  };

  // Initial Load
  useEffect(() => {
    // Check local storage for persistent authentication
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('currentUser');
    if (storedAuth === 'true' && storedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(storedUser));
    }

    // Load Face API models
    loadModels(setModelsLoaded, setLoadingError, setHashVerificationError);
  }, []);

  // Handler for when face is scanned from document
  const handleFaceScannedFromDocument = (descriptor, image, ocrData) => {
    setScannedIdFaceDescriptor(descriptor);
    setScannedIdFaceImage(image);
    setExtractedDocumentData(ocrData);
    navigate("/face-authentication");
  };

  // Handler for successful live face authentication
  const handleAuthenticated = (user, result) => {
    if (user && result) {
      setAuthenticatedUser(user); // Now this setter exists
      setAuthenticationResult(result); // Now this setter exists
      navigate("/dashboard");
    }
  };

  // Loading and Error States
  if (loadingError || hashVerificationError) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadingError || hashVerificationError}
          </Alert>
          <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            There was an issue loading the necessary models. Please ensure your network is stable and try again.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!modelsLoaded) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Face Recognition Models...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
            This might take a moment depending on your connection.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, login: handleLogin, logout: handleLogout }}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Suspense fallback={<CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />}>
            <Header />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Routes */}
              <Route
                path="/scan-id"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <DocumentScanner
                      onFaceScanned={handleFaceScannedFromDocument}
                      modelsLoaded={modelsLoaded}
                      loadingError={loadingError}
                      hashVerificationError={hashVerificationError}
                    />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/face-authentication"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <FaceAuthentication
                      onAuthenticated={handleAuthenticated}
                      scannedIdFaceDescriptor={scannedIdFaceDescriptor}
                      scannedIdFaceImage={scannedIdFaceImage}
                      extractedDocumentData={extractedDocumentData}
                      modelsLoaded={modelsLoaded}
                      loadingError={loadingError}
                      hashVerificationError={hashVerificationError}
                    />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/TeamPage" element={<TeamPage />} />

              <Route path="/qr-verification" element={<QRVerification />} />

              <Route path="*" element={
                <Typography variant="h4" sx={{ textAlign: 'center', mt: 10 }}>
                  404 - Page Not Found
                </Typography>
              } />
            </Routes>
          </Suspense>
        </Box>
      </Container>
    </AuthContext.Provider>
  );
}

// Wrapper for BrowserRouter
export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}