import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  VerifiedUser,
  LocationOn,
  Cake,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { calculateAge } from '../utils/documentUtils';

const QRVerification = () => {
  const [searchParams] = useSearchParams();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadVerificationData = () => {
      try {
        setLoading(true);
        
        // Get QR data from URL parameters
        const qrData = searchParams.get('data');
        if (!qrData) {
          setError('No verification data found');
          setLoading(false);
          return;
        }

        // Parse the QR data
        const parsedData = JSON.parse(decodeURIComponent(qrData));
        setVerificationData(parsedData);
      } catch (err) {
        setError('Invalid verification data');
      } finally {
        setLoading(false);
      }
    };

    loadVerificationData();
  }, [searchParams]);

  const renderAgeVerification = () => {
    if (!verificationData.age) return null;
    
    const age = calculateAge(verificationData.age);
    const isAbove18 = age >= 18;
    
    return (
      <Card elevation={3} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Cake sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Age Verification</Typography>
          </Box>
          

          

          <Typography variant="body2" color="text.secondary" sx={{ 
            color: isAbove18 ? 'success.main' : 'error.main',
            fontWeight: 'bold'
          }}>
            Status: <strong>{isAbove18 ? '✓ User is above 18 and verified' : '✗ User is below 18'}</strong>
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderAddressVerification = () => {
    if (!verificationData.address) return null;
    
    return (
      <Card elevation={3} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Address Verification</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
            <Typography variant="body1">✅ Verified</Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Address:
          </Typography>
          <Typography variant="body1" sx={{ 
            p: 2, 
            backgroundColor: 'grey.50', 
            borderRadius: 1,
            fontFamily: 'monospace'
          }}>
            {verificationData.address}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        <VerifiedUser sx={{ mr: 1, verticalAlign: 'middle' }} />
        Verification Results
      </Typography>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Document Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Document Type: <strong>{verificationData.docType || 'N/A'}</strong>
          </Typography>
          {verificationData.username && (
            <Typography variant="body2" color="text.secondary">
              User: <strong>{verificationData.username}</strong>
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Verified At: <strong>{new Date(verificationData.verifiedAt).toLocaleString()}</strong>
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Verification Details
      </Typography>

      {renderAgeVerification()}
      {renderAddressVerification()}

      {!verificationData.age && !verificationData.address && (
        <Alert severity="info">
          No verification attributes found in the QR code.
        </Alert>
      )}
    </Box>
  );
};

export default QRVerification;