import QRCode from 'qrcode';
import { documentDB } from './documentDatabase';

// Real document processing using OCR
export const processDocumentImage = async (file, username) => {
  try {
    console.log('Starting OCR processing for file:', file.name);
    
    // Import Tesseract.js dynamically
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    
    // Perform OCR on the uploaded image
    const result = await worker.recognize(file);
    await worker.terminate();
    
    const extractedText = result.data.text;
    console.log('=== EXTRACTED TEXT FROM DOCUMENT ===');
    console.log(extractedText);
    console.log('=== END EXTRACTED TEXT ===');
    
    // Extract data from the OCR text
    const extractedData = extractDataFromText(extractedText);
    
    console.log('=== FINAL EXTRACTED DATA ===');
    console.log(extractedData);
    console.log('=== END FINAL DATA ===');
    
    // Store in database
    const documentId = await documentDB.storeDocument(username, extractedData);
    console.log('Document stored with ID:', documentId);
    
    // Return the extracted data with database ID
    const documentData = {
      ...extractedData,
      id: documentId,
      username: username,
      uploadedAt: new Date().toISOString(),
      originalText: extractedText // Store original text for debugging
    };
    
    return documentData;
  } catch (error) {
    console.error('Error processing document:', error);
    throw new Error('Failed to extract data from document image');
  }
};

// Clean up extracted name
const cleanName = (name) => {
  if (!name) return '';
  
  // Remove common OCR artifacts and clean up the name
  return name
    .replace(/[^\w\s]/g, ' ') // Remove special characters except spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .replace(/\b(NAME|Name|name)\b/g, '') // Remove "NAME" labels
    .trim();
};

// Extract personal data from OCR text
const extractDataFromText = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  let name = '', dob = '', address = '', mobile = '', aadhaar = '';
  
  console.log('Processing lines:', lines);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract Aadhaar number (12 digits, may have spaces/dashes)
    if (!aadhaar) {
      const aadhaarMatch = line.match(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/);
      if (aadhaarMatch) {
        aadhaar = aadhaarMatch[0].replace(/[\s\-]/g, '');
        console.log('Found Aadhaar:', aadhaar);
      }
    }
    
    // Extract mobile number (10 digits starting with 6-9)
    if (!mobile) {
      const mobileMatch = line.match(/(\+91[\-\s]?)?[6-9]\d{9}/);
      if (mobileMatch) {
        mobile = mobileMatch[0].replace(/\+91|[\-\s]/g, '');
        console.log('Found Mobile:', mobile);
      }
    }
    
    // Extract date of birth (various formats)
    if (!dob) {
      // DD/MM/YYYY or DD-MM-YYYY
      const dobMatch1 = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
      if (dobMatch1) {
        dob = dobMatch1[1];
        console.log('Found DOB (format 1):', dob);
      } else {
        // YYYY-MM-DD
        const dobMatch2 = line.match(/(\d{4}[\-\/]\d{1,2}[\-\/]\d{1,2})/);
        if (dobMatch2) {
          dob = dobMatch2[1];
          console.log('Found DOB (format 2):', dob);
        } else {
          // Just year (YYYY)
          const yearMatch = line.match(/(19|20)\d{2}/);
          if (yearMatch) {
            dob = yearMatch[0];
            console.log('Found Year:', dob);
          }
        }
      }
    }
    
    // Extract address (lines containing address keywords)
    if (!address && /road|street|nagar|layout|block|cross|main|colony|area|village|city|state|pin/i.test(line)) {
      address = line;
      console.log('Found Address:', address);
    }
    
    // Extract name (various patterns)
    if (!name) {
      console.log('Looking for name in line:', line);
      
      // Pattern: "Name: John Doe" or "NAME: JOHN DOE"
      const nameMatch1 = line.match(/^name[:\-]?\s*(.+)/i);
      if (nameMatch1) {
        name = cleanName(nameMatch1[1]);
        console.log('Found Name (pattern 1):', name);
      } else if (line === line.toUpperCase() && line.split(' ').length >= 2) {
        // All caps line with multiple words (likely a name)
        const nextLine = lines[i + 1] || '';
        if (/dob|birth|year|gender|father|mother/i.test(nextLine)) {
          name = cleanName(line);
          console.log('Found Name (pattern 2):', name);
        }
      } else if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(line)) {
        // Proper case name pattern
        name = cleanName(line);
        console.log('Found Name (pattern 3):', name);
      } else if (/^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$/.test(line)) {
        // Three word name pattern
        name = cleanName(line);
        console.log('Found Name (pattern 4):', name);
      } else if (/^[A-Z][a-z]+$/.test(line) && line.length > 3) {
        // Single word name (likely first name)
        const nextLine = lines[i + 1] || '';
        if (/^[A-Z][a-z]+$/.test(nextLine) && nextLine.length > 3) {
          // If next line is also a name word, combine them
          name = cleanName(`${line.trim()} ${nextLine.trim()}`);
          console.log('Found Name (pattern 5):', name);
        }
      } else if (/^[A-Z][A-Z\s]+$/.test(line) && line.split(' ').length >= 2) {
        // All caps name with spaces
        name = cleanName(line);
        console.log('Found Name (pattern 6):', name);
      } else if (/^[A-Z][a-z]+$/.test(line) && line.length > 3 && line.length < 15) {
        // Single word that looks like a name (not too short, not too long)
        name = cleanName(line);
        console.log('Found Name (pattern 7 - single word):', name);
      } else if (line.length > 5 && line.length < 50 && /^[A-Z][a-z\s]+$/.test(line)) {
        // Mixed case line that looks like a name
        name = cleanName(line);
        console.log('Found Name (pattern 8 - mixed case):', name);
      }
    }
  }
  
  // If we found a year but not full DOB, create a DOB
  if (dob && dob.length === 4) {
    dob = `01/01/${dob}`;
  }
  
  // Fallback: if no name found with specific patterns, look for any reasonable name-like text
  if (!name) {
    console.log('No name found with specific patterns, trying fallback...');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Look for lines that could be names (not too long, not too short, contains letters)
      if (line.length > 3 && line.length < 30 && /^[A-Za-z\s]+$/.test(line) && !line.includes(':')) {
        // Skip lines that are clearly not names
        if (!/aadhaar|mobile|phone|address|dob|birth|year|gender|father|mother|card|number|id/i.test(line.toLowerCase())) {
          name = cleanName(line);
          console.log('Found Name (fallback):', name);
          break;
        }
      }
    }
  }
  
  console.log('Final extracted data:', { name, dob, address, mobile, aadhaar });
  
  // Ensure we never return default names - only actual extracted data or "Not found"
  return {
    name: name || 'Not found',
    age: dob || 'Not found',
    address: address || 'Not found',
    mobile: mobile || 'Not found',
    aadhaar: aadhaar || 'Not found'
  };
};

// Test function to verify OCR is working
export const testOCR = async (file) => {
  try {
    console.log('=== TESTING OCR ===');
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    
    const result = await worker.recognize(file);
    await worker.terminate();
    
    console.log('OCR Test Result:', result.data.text);
    return result.data.text;
  } catch (error) {
    console.error('OCR Test Error:', error);
    throw error;
  }
};

// Generate custom verification QR code
export const generateCustomVerificationQR = async (documentData, selectedAttributes) => {
  try {
    // Create QR data with only selected attributes from stored data
    const qrData = {
      docType: 'Document Verification',
      verifiedAt: new Date().toISOString(),
      ...(documentData.username && { username: documentData.username }),
      ...(selectedAttributes.name && { name: documentData.name }),
      ...(selectedAttributes.age && { age: documentData.age }),
      ...(selectedAttributes.address && { address: documentData.address })
    };

    console.log('Generating QR with data:', qrData);

    // Generate QR code with verification URL
    const verificationUrl = `${window.location.origin}/qr-verification?data=${encodeURIComponent(JSON.stringify(qrData))}`;
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Calculate age from date of birth
export const calculateAge = (dob) => {
  if (!dob || dob === 'Not found') return 0;
  
  try {
    let birthDate;
    
    // Handle different date formats
    if (dob.includes('/')) {
      // DD/MM/YYYY format
      const [day, month, year] = dob.split('/');
      birthDate = new Date(year, month - 1, day);
    } else if (dob.includes('-')) {
      // YYYY-MM-DD or DD-MM-YYYY format
      const parts = dob.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        birthDate = new Date(dob);
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts;
        birthDate = new Date(year, month - 1, day);
      }
    } else if (dob.length === 4) {
      // Just year (YYYY)
      birthDate = new Date(dob, 0, 1);
    } else {
      // Try parsing as is
      birthDate = new Date(dob);
    }
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      console.error('Invalid date format:', dob);
      return 0;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  } catch (error) {
    console.error('Error calculating age from DOB:', dob, error);
    return 0;
  }
};

// Check if user has uploaded document
export const hasUserDocument = async (username) => {
  return await documentDB.hasDocument(username);
};

// Get user document data
export const getUserDocument = async (username) => {
  return await documentDB.getDocumentByUsername(username);
};

// Save user document data
export const saveUserDocument = async (documentData, username) => {
  return await documentDB.storeDocument(username, documentData);
}; 