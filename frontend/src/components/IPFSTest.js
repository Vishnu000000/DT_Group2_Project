import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import IPFSService from '../services/ipfsService';

const IPFSTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      await IPFSService.checkConnection();
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file.name, 'Size:', file.size, 'bytes');
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setUploadProgress('Starting upload...');

      // Test file upload
      console.log('Uploading file to IPFS...');
      const fileCID = await IPFSService.uploadFile(selectedFile);
      setUploadProgress('File uploaded, creating metadata...');
      
      // Test metadata upload
      const metadata = {
        filename: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        timestamp: new Date().toISOString()
      };
      console.log('Uploading metadata to IPFS...');
      const metadataCID = await IPFSService.uploadJSON(metadata);

      setResult({
        fileCID,
        metadataCID,
        metadata
      });
      setUploadProgress('Upload complete!');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          IPFS Connection Test
        </Typography>

        <Alert 
          severity={isConnected ? "success" : "error"} 
          sx={{ mb: 2 }}
        >
          IPFS Status: {isConnected ? 'Connected' : 'Not Connected'}
        </Alert>
        
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={checkConnection}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Check Connection
          </Button>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              disabled={!isConnected || loading}
            >
              Select Test File
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
            )}
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || !selectedFile || !isConnected}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Test Upload'}
        </Button>

        {uploadProgress && (
          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            {uploadProgress}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Upload successful!
            </Alert>
            <Typography variant="subtitle1">Results:</Typography>
            <Typography variant="body2">File CID: {result.fileCID}</Typography>
            <Typography variant="body2">Metadata CID: {result.metadataCID}</Typography>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Metadata:</Typography>
            <pre style={{ overflow: 'auto', maxWidth: '100%' }}>
              {JSON.stringify(result.metadata, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default IPFSTest; 