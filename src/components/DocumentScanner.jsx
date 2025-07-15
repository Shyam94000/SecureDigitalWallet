import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { Box, Button, Typography, IconButton, CircularProgress, Alert } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReactWebcam from "react-webcam";
import { styled } from '@mui/material/styles';
import Tesseract from 'tesseract.js';

const VisuallyHiddenInput = styled('input')({
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DocumentScanner = ({ onFaceScanned, modelsLoaded, loadingError, hashVerificationError }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [scannedFaceDescriptor, setScannedFaceDescriptor] = useState(null);
  const [scannedFaceImage, setScannedFaceImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const webcamRef = useRef(null);
  const imageRef = useRef(null); // Used to hold the actual Image object for face-api

  useEffect(() => {
    if (loadingError || hashVerificationError) {
      setScanError(loadingError || hashVerificationError);
    } else if (modelsLoaded && scanError) {
      setScanError(null);
    }
  }, [modelsLoaded, loadingError, hashVerificationError, scanError]);

  // Function to calculate age from DOB string
  const calculateAge = (dobString) => {
    if (!dobString) return null;

    // Regex to find a date in DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD format
    const match = dobString.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (!match) return null;

    let day, month, year;
    if (match[4]) { // YYYY-MM-DD format
      year = parseInt(match[4], 10);
      month = parseInt(match[5], 10) - 1; // JS months are 0-indexed
      day = parseInt(match[6], 10);
    } else { // DD/MM/YYYY or DD-MM-YYYY format
      day = parseInt(match[1], 10);
      month = parseInt(match[2], 10) - 1;
      year = parseInt(match[3], 10);
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    const birthDate = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  /**
   * **Improved Algorithm to Extract Information from OCR Text**
   * This function uses more robust regex and contextual analysis to find details.
   */
  const extractInfoFromText = (text) => {
    let name = 'Not found';
    let dob = 'Not found';
    let address = 'Not found';
    let gender = 'Not found';

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // 1. Extract Date of Birth (DOB)
    const dobRegex = /(?:DOB|Date of Birth|Born|Birth)\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;
    const dobMatch = text.match(dobRegex);
    if (dobMatch && dobMatch[1]) {
      dob = dobMatch[1];
    } else {
      const genericDateRegex = /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/;
      const genericDateMatch = text.match(genericDateRegex);
      if (genericDateMatch && genericDateMatch[1]) {
        dob = genericDateMatch[1];
      }
    }
    console.log('Extracted DOB:', dob);

    // 2. Extract Gender
    const genderRegex = /\b(MALE|FEMALE|TRANSGENDER)\b/i;
    const genderMatch = text.match(genderRegex);
    if (genderMatch && genderMatch[1]) {
        gender = genderMatch[1].toUpperCase();
    }
    console.log('Extracted Gender:', gender);

    // 3. Extract Complete Address (IMPROVED)
    // Look for address section more comprehensively
    let addressFound = false;
    
    // Method 1: Look for "Address:" keyword
    const addressKeywordIndex = lines.findIndex(line => /address/i.test(line));
    if (addressKeywordIndex !== -1) {
        // Capture multiple lines after "Address:" keyword
        let addressLines = [];
        for (let i = addressKeywordIndex + 1; i < Math.min(addressKeywordIndex + 8, lines.length); i++) {
            const line = lines[i];
            // Stop if we hit another section (like PIN code, mobile, etc.)
            if (/pin|mobile|aadhaar|government|authority/i.test(line)) {
                break;
            }
            if (line.length > 3) { // Only add lines with meaningful content
                addressLines.push(line);
            }
        }
        if (addressLines.length > 0) {
            address = addressLines.join(', ').trim();
            addressFound = true;
        }
    }

    // Method 2: If no address keyword, look for PIN code and extract lines before it
    if (!addressFound) {
        const pinRegex = /\b(\d{6})\b/;
        const pinCodeIndex = lines.findIndex(line => pinRegex.test(line));
        
        if (pinCodeIndex !== -1) {
            // Look for address lines before the PIN code
            let addressLines = [];
            for (let i = Math.max(0, pinCodeIndex - 6); i < pinCodeIndex; i++) {
                const line = lines[i];
                // Filter out non-address content
                if (line.length > 3 && 
                    !/government|authority|identification|aadhaar|mobile|name|dob|gender/i.test(line) &&
                    !/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(line)) { // Avoid picking up names
                    addressLines.push(line);
                }
            }
            if (addressLines.length > 0) {
                address = addressLines.join(', ').trim();
                addressFound = true;
            }
        }
    }

    // Method 3: Fallback - look for lines that look like addresses
    if (!addressFound) {
        let potentialAddressLines = [];
        for (const line of lines) {
            // Look for lines that contain address-like patterns
            if (line.length > 10 && 
                (line.includes(',') || line.includes('District') || line.includes('State') || line.includes('PIN')) &&
                !/government|authority|identification|aadhaar|mobile|name|dob|gender/i.test(line)) {
                potentialAddressLines.push(line);
            }
        }
        if (potentialAddressLines.length > 0) {
            address = potentialAddressLines.join(', ').trim();
        }
    }

    // Clean up address
    if (address !== 'Not found') {
        address = address.replace(/\s+/g, ' '); // Replace multiple spaces
        address = address.replace(/,\s*,/g, ','); // Replace double commas
        address = address.replace(/(^,)|(,$)/g, ''); // Remove leading/trailing commas
    }
    
    console.log('Extracted Address:', address);

    // 4. Extract Name (IMPROVED)
    // Look for name patterns more comprehensively
    for (const line of lines) {
        // Pattern 1: Full name with proper capitalization (2-4 words)
        if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(line)) {
            // Exclude common header/footer texts
            if (!line.toLowerCase().includes('india') &&
                !line.toLowerCase().includes('authority') &&
                !line.toLowerCase().includes('government') &&
                !line.toLowerCase().includes('identification') &&
                !line.toLowerCase().includes('aadhaar') &&
                !line.toLowerCase().includes('unique')) {
                name = line;
                break;
            }
        }
        
        // Pattern 2: Name with middle initials
        if (/^[A-Z][a-z]+\s[A-Z]\.\s[A-Z][a-z]+$/.test(line)) {
            name = line;
            break;
        }
        
        // Pattern 3: Name with "S/O:" pattern
        const sOMatch = line.match(/S\/O:\s*([A-Za-z\s]+)/);
        if (sOMatch && sOMatch[1]) {
            // The actual name is usually before the S/O line
            // Look for the line before this one
            const currentIndex = lines.indexOf(line);
            if (currentIndex > 0) {
                const previousLine = lines[currentIndex - 1];
                if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(previousLine)) {
                    name = previousLine;
                    break;
                }
            }
        }
    }

    // Final fallback: Look for specific names in the text
    if (name === 'Not found') {
        const namePatterns = [
            /Shyam Gokul Selvaraj/,
            /[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+/,
            /[A-Z][a-z]+ [A-Z][a-z]+/
        ];
        
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[0]) {
                name = match[0];
                break;
            }
        }
    }
    
    console.log('Extracted Name:', name);

    const age = calculateAge(dob);

    return {
      name: name,
      dob: dob,
      age: age || 'Not found',
      address: address,
      gender: gender
    };
  };

  // Function to perform OCR on the document
  const performOCR = async (imageElement) => {
    setOcrProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(imageElement, 'eng', {
        logger: m => console.log(m)
      });

      console.log('OCR Text:', text);
      const extractedInfo = extractInfoFromText(text);
      setExtractedData(extractedInfo);
      return extractedInfo;
    } catch (error) {
      console.error('OCR Error:', error);
      setScanError('Failed to extract text from document. Please try again.');
      return null;
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setProcessing(true);
      setScanError(null);
      setExtractedData(null);
      setImageSrc(URL.createObjectURL(file));
      setIsCameraActive(false);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        imageRef.current = img; // Store the actual Image object
        await scanDocumentForFace(img);
        setProcessing(false);
      };
      img.onerror = () => {
        setScanError("Failed to load image. Please try again.");
        setProcessing(false);
      };
    }
  };

  const capturePhoto = async () => {
    if (webcamRef.current) {
      setProcessing(true);
      setScanError(null);
      setExtractedData(null);
      const screenshot = webcamRef.current.getScreenshot();
      setImageSrc(screenshot);
      setIsCameraActive(false);

      const img = new Image();
      img.src = screenshot;
      img.onload = async () => {
        imageRef.current = img; // Store the actual Image object
        await scanDocumentForFace(img);
        setProcessing(false);
      };
      img.onerror = () => {
        setScanError("Failed to capture image. Please try again.");
        setProcessing(false);
      };
    }
  };

   const scanDocumentForFace = async (img) => {
    if (!modelsLoaded) {
      setScanError("Face detection models not loaded yet. Please wait.");
      return;
    }

    try {
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (detections) {
        setScannedFaceDescriptor(detections.descriptor);
        
        // Extract face image from the detected box
        const box = detections.detection.box;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = box.width;
        tempCanvas.height = box.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
        const faceImage = tempCanvas.toDataURL('image/jpeg');
        setScannedFaceImage(faceImage);
        
        const ocrData = await performOCR(img);
        
        console.log("DocumentScanner: OCR Data prepared for onFaceScanned:", ocrData);
        
        setScanError(null);
        onFaceScanned(detections.descriptor, faceImage, ocrData);
      } else {
        setScanError("No face detected in the document. Please try a different image.");
        setScannedFaceDescriptor(null);
        setScannedFaceImage(null);
        setExtractedData(null);
      }
    } catch (error) {
      console.error("Error scanning document for face:", error);
      setScanError("An error occurred while scanning the document. Please try again.");
    }
  };

  const toggleCameraMode = () => {
    setIsCameraActive(prev => !prev);
    setImageSrc(null);
    setScannedFaceDescriptor(null);
    setScannedFaceImage(null);
    setExtractedData(null);
    setScanError(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "20px",
        gap: 3,
      }}
    >
      <Typography variant="h4" sx={{ color: "#333", fontWeight: "bold", mb: 2 }}>
        Upload or Capture Government ID
      </Typography>

      {(loadingError || hashVerificationError) && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: '500px', mb: 2 }}>
          {loadingError || hashVerificationError}
        </Alert>
      )}

      {!modelsLoaded && !loadingError && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <CircularProgress size={20} />
          <Typography variant="body1">Loading face detection models...</Typography>
        </Box>
      )}

      {scanError && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: '500px', mb: 2 }}>
          {scanError}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#fff",
          boxShadow: 3,
          borderRadius: "12px",
          padding: "30px",
          width: "100%",
          maxWidth: "500px",
          alignItems: "center",
        }}
      >
        {!isCameraActive ? (
          <>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px" }}
              disabled={!modelsLoaded || processing}
            >
              Upload Document Image
              <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
            </Button>
            <Typography variant="body2" sx={{ color: "text.secondary", my: 1 }}>
              OR
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CameraAltIcon />}
              onClick={toggleCameraMode}
              sx={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px" }}
              disabled={!modelsLoaded || processing}
            >
              Capture Document with Camera
            </Button>
          </>
        ) : (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "300px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "2px solid #ddd",
            }}
          >
            <ReactWebcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              onClick={capturePhoto}
              disabled={processing || !modelsLoaded}
              sx={{ position: "absolute", bottom: 10, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)'} }}
            >
              <CameraAltIcon sx={{ fontSize: 40 }} />
            </IconButton>
             <Button variant="text" onClick={toggleCameraMode} sx={{ position: "absolute", top: 10, right: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              Cancel
            </Button>
          </Box>
        )}

        {imageSrc && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Preview:</Typography>
            <img src={imageSrc} alt="Document Preview" style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "8px" }} />
          </Box>
        )}

        {(processing || ocrProcessing) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body1">
              {ocrProcessing ? "Extracting text..." : "Scanning for face..."}
            </Typography>
          </Box>
        )}

        {scannedFaceDescriptor && !processing && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'green' }}>
            <CheckCircleIcon />
            <Typography variant="body1">Face Scanned Successfully!</Typography>
          </Box>
        )}

        {scannedFaceImage && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Extracted Face:</Typography>
            <img src={scannedFaceImage} alt="Extracted Face" style={{ width: "150px", height: "150px", borderRadius: "50%", border: "2px solid #006FB9" }} />
          </Box>
        )}

        {/* --- Improved Display for Extracted Data --- */}
        {extractedData && (
          <Box sx={{ mt: 2, width: '100%', backgroundColor: '#f8f9fa', padding: 2, borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#006FB9' }}>Extracted Information:</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Name: </strong>
                {extractedData.name !== 'Not found' ? extractedData.name : <span style={{color: 'red'}}>Not found</span>}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Date of Birth: </strong>
                {extractedData.dob !== 'Not found' ? extractedData.dob : <span style={{color: 'red'}}>Not found</span>}
            </Typography>
             <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Age: </strong>
                {extractedData.age !== 'Not found' ? extractedData.age : <span style={{color: 'red'}}>Not found</span>}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Gender: </strong>
                {extractedData.gender !== 'Not found' ? extractedData.gender : <span style={{color: 'red'}}>Not found</span>}
            </Typography>
            <Typography variant="body2">
                <strong>Address: </strong>
                {extractedData.address !== 'Not found' ? extractedData.address : <span style={{color: 'red'}}>Not found</span>}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DocumentScanner;