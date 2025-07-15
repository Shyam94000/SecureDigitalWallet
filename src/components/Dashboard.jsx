import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  FormControlLabel,
  Checkbox,
  FormGroup
} from '@mui/material';
import {
  Upload,
  QrCode,
  LocationOn,
  Person,
  VerifiedUser,
  Add,
  CheckBox
} from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import { 
  processDocumentImage, 
  generateCustomVerificationQR, 
  calculateAge, 
  hasUserDocument, 
  getUserDocument, 
  saveUserDocument 
} from '../utils/documentUtils';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [hasDocument, setHasDocument] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAttributes, setSelectedAttributes] = useState({
    age: false,
    address: false
  });
  const [showDebug, setShowDebug] = useState(false);

  // Check if user has uploaded document
  useEffect(() => {
    const loadDocument = async () => {
      if (currentUser) {
        const hasDoc = await hasUserDocument(currentUser.username);
        if (hasDoc) {
          setHasDocument(true);
          const docData = await getUserDocument(currentUser.username);
          setDocumentData(docData);
        }
      }
    };
    
    loadDocument();
  }, [currentUser]);

  const handleUploadDocument = () => {
    setUploadDialogOpen(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Process document image with username
      const documentData = await processDocumentImage(file, currentUser.username);
      
      setDocumentData(documentData);
      setHasDocument(true);
      setUploadDialogOpen(false);
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeChange = (attribute) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attribute]: !prev[attribute]
    }));
  };

  const generateCustomQR = async () => {
    try {
      setLoading(true);
      
      // Check if at least one attribute is selected
      const selectedCount = Object.values(selectedAttributes).filter(Boolean).length;
      if (selectedCount === 0) {
        setError('Please select at least one attribute to verify');
        setLoading(false);
        return;
      }

      // Generate QR code using utility function
      const qrCodeDataURL = await generateCustomVerificationQR(documentData, selectedAttributes);
      
      setQrCode(qrCodeDataURL);
      setQrDialogOpen(true);
    } catch (err) {
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const showAddress = () => {
    setAddressDialogOpen(true);
  };



  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
        <VerifiedUser sx={{ mr: 1, verticalAlign: 'middle' }} />
        Dashboard
      </Typography>
      {currentUser && (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back, {currentUser.username}! 👋
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {documentData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Document processed successfully! Age: {calculateAge(documentData.age)} years
          </Typography>
          <Button 
            size="small" 
            onClick={() => setShowDebug(!showDebug)}
            sx={{ mt: 1 }}
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </Button>
        </Alert>
      )}

      {showDebug && documentData && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>Debug Information</Typography>
          <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.8rem' }}>
            <strong>Extracted Text:</strong><br />
            {documentData.originalText}<br /><br />
            <strong>Parsed Data:</strong><br />
            DOB: {documentData.age}<br />
            Address: {documentData.address}<br />
            Mobile: {documentData.mobile}<br />
            Aadhaar: {documentData.aadhaar}
          </Typography>
        </Card>
      )}

      <Grid container spacing={3}>
        {!hasDocument ? (
          // Upload Document Card
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Upload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Document
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload your Aadhaar card or other government ID for verification
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  onClick={handleUploadDocument}
                  sx={{ px: 4 }}
                >
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          // Document Verified - Show Options
          <>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <QrCode sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Custom Verification QR
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select attributes to include in verification QR code
                  </Typography>
                  
                  <FormGroup sx={{ mb: 3, textAlign: 'left' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedAttributes.age}
                          onChange={() => handleAttributeChange('age')}
                          color="primary"
                        />
                      }
                      label={`Age Verification`}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedAttributes.address}
                          onChange={() => handleAttributeChange('address')}
                          color="primary"
                        />
                      }
                      label={`Address`}
                    />
                  </FormGroup>
                  
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<QrCode />}
                    onClick={generateCustomQR}
                    disabled={loading}
                    sx={{ px: 4 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Generate QR'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <LocationOn sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Display Address
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    View your registered address information
                  </Typography>
                  <Button
                    variant="contained"
                    color="info"
                    size="large"
                    startIcon={<LocationOn />}
                    onClick={showAddress}
                    sx={{ px: 4 }}
                  >
                    Show Address
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Upload Document Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Upload sx={{ mr: 1, verticalAlign: 'middle' }} />
          Upload Document
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please upload a clear image of your Aadhaar card or other government ID for verification.
          </Typography>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="document-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="document-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Choose Image File'}
            </Button>
          </label>

          {loading && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Processing document...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Age Verification QR Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
          Custom Verification QR Code
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            {qrCode && (
              <img 
                src={qrCode} 
                alt="Age Verification QR Code" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Scan this QR code to verify the selected attributes
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Address Display Dialog */}
      <Dialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
          Registered Address
        </DialogTitle>
        <DialogContent>
          {documentData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Address Information
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Date of Birth: <strong>{documentData.age}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ 
                  color: calculateAge(documentData.age) >= 18 ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  Age: <strong>{calculateAge(documentData.age) >= 18 ? '✓ Above 18 and verified' : '✗ Below 18'} ({calculateAge(documentData.age)} years)</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mobile: <strong>{documentData.mobile}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aadhaar: <strong>{documentData.aadhaar}</strong>
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <Typography variant="body1" sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                borderRadius: 1,
                fontFamily: 'monospace'
              }}>
                {documentData.address}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="Verified" 
                  color="success" 
                  icon={<VerifiedUser />}
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={`Age: ${calculateAge(documentData.age)} years`} 
                  color="primary"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;