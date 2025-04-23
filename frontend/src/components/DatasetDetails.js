import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import BlockchainService from '../services/blockchainService';
import IPFSService from '../services/ipfsService';
import { ethers } from 'ethers';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
  Preview as PreviewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const DatasetDetails = () => {
  const { id } = useParams();
  const { account, library } = useWeb3React();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provenance, setProvenance] = useState([]);
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [downloadDialog, setDownloadDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [blockchainService, setBlockchainService] = useState(null);

  useEffect(() => {
    if (library) {
      try {
        const service = new BlockchainService(library);
        setBlockchainService(service);
      } catch (error) {
        console.error('Error initializing blockchain service:', error);
        setSnackbar({
          open: true,
          message: 'Error initializing blockchain service',
          severity: 'error'
        });
      }
    }
  }, [library]);

  const fetchDatasetDetails = useCallback(async () => {
    if (!blockchainService || !id) return;
    
    setLoading(true);
    try {
      const datasetData = await blockchainService.getDataset(id);
      setDataset(datasetData);

      // Fetch metadata from IPFS
      const metadataData = await IPFSService.getJSON(datasetData.cid);
      setMetadata(metadataData);

      // Fetch license status
      const licenseStatus = await blockchainService.getLicenseStatus(id);
      setLicenseInfo(licenseStatus);

      // Fetch provenance data
      const provenanceData = await blockchainService.getProvenance(id);
      setProvenance(provenanceData);
    } catch (error) {
      console.error('Error fetching dataset details:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching dataset details',
        severity: 'error'
      });
    }
    setLoading(false);
  }, [blockchainService, id]);

  useEffect(() => {
    if (account && blockchainService) {
      fetchDatasetDetails();
    }
  }, [account, blockchainService, fetchDatasetDetails]);

  const handlePurchaseLicense = async () => {
    try {
      await blockchainService.purchaseLicense(id);
      setSnackbar({
        open: true,
        message: 'License purchased successfully',
        severity: 'success'
      });
      fetchDatasetDetails();
    } catch (error) {
      console.error('Error purchasing license:', error);
      setSnackbar({
        open: true,
        message: 'Error purchasing license',
        severity: 'error'
      });
    }
  };

  const handleDownload = async () => {
    if (!metadata?.fileCID) {
      setSnackbar({
        open: true,
        message: 'No file CID found in metadata',
        severity: 'error'
      });
      return;
    }

    try {
      const fileData = await IPFSService.getFile(metadata.fileCID);
      const blob = new Blob([fileData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.name || 'dataset'}.bin`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      setSnackbar({
        open: true,
        message: 'Error downloading file',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handlePreview = async () => {
    if (!dataset) return;
    
    try {
      setPreviewLoading(true);
      const preview = await IPFSService.getPreview(dataset.ipfsHash);
      setPreviewData(preview);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Error loading preview:', error);
      setSnackbar({
        open: true,
        message: 'Error loading preview: ' + error.message,
        severity: 'error'
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderProvenanceTimeline = () => {
    if (!provenance || provenance.length === 0) {
      return (
        <Typography variant="body1" color="text.secondary">
          No provenance data available
        </Typography>
      );
    }

    return (
      <Timeline>
        {provenance.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={event.type === 'creation' ? 'primary' : 'secondary'} />
              {index < provenance.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle2">{event.type}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(event.timestamp * 1000).toLocaleString()}
              </Typography>
              <Typography variant="body2">{event.description}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  const renderUsageChart = () => {
    if (!provenance || provenance.length === 0) {
      return null;
    }

    const data = {
      labels: provenance.map(event => new Date(event.timestamp * 1000).toLocaleDateString()),
      datasets: [
        {
          label: 'Dataset Usage',
          data: provenance.map((_, index) => index + 1),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Dataset Usage Over Time'
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  const renderLicensingTerms = () => {
    if (!dataset) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Licensing Terms
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">License Type</Typography>
              <Typography variant="body1">{dataset.licenseType}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Price</Typography>
              <Typography variant="body1">{dataset.price} AIDT</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Usage Rights</Typography>
              <Typography variant="body1">
                {dataset.usageRights || 'Standard usage rights apply'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Restrictions</Typography>
              <Typography variant="body1">
                {dataset.restrictions || 'No specific restrictions'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Expiration</Typography>
              <Typography variant="body1">
                {dataset.expirationDate || 'No expiration date'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : dataset ? (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4">{dataset.title}</Typography>
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<PreviewIcon />}
                        onClick={handlePreview}
                        sx={{ mr: 1 }}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        disabled={!hasAccess}
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {dataset.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={dataset.isActive ? 'Active' : 'Inactive'}
                      color={dataset.isActive ? 'success' : 'error'}
                    />
                    <Chip label={`${dataset.price} AIDT`} variant="outlined" />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Overview" />
              <Tab label="Provenance" />
              <Tab label="Licensing" />
            </Tabs>

            {selectedTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Dataset Information
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Owner</TableCell>
                            <TableCell>{dataset.owner}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Size</TableCell>
                            <TableCell>{dataset.size}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Format</TableCell>
                            <TableCell>{dataset.format}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Created</TableCell>
                            <TableCell>
                              {new Date(dataset.timestamp * 1000).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Access Status
                    </Typography>
                    {hasAccess ? (
                      <Box sx={{ textAlign: 'center' }}>
                        <VerifiedIcon color="success" sx={{ fontSize: 48 }} />
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          You have access to this dataset
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <WarningIcon color="warning" sx={{ fontSize: 48 }} />
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          Purchase access to download this dataset
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={handlePurchase}
                          sx={{ mt: 2 }}
                        >
                          Purchase Access
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}

            {selectedTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Provenance Timeline
                    </Typography>
                    {renderProvenanceTimeline()}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Usage Statistics
                    </Typography>
                    {renderUsageChart()}
                  </Paper>
                </Grid>
              </Grid>
            )}

            {selectedTab === 2 && renderLicensingTerms()}
          </>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Dataset not found</Typography>
          </Paper>
        )}
      </Box>

      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Dataset Preview
          <IconButton
            aria-label="close"
            onClick={() => setPreviewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : previewData ? (
            <Box sx={{ mt: 2 }}>
              {previewData.type === 'image' && (
                <img
                  src={previewData.url}
                  alt="Dataset Preview"
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
              {previewData.type === 'text' && (
                <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                  <pre>{previewData.content}</pre>
                </Paper>
              )}
              {previewData.type === 'table' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {previewData.headers.map((header, index) => (
                          <TableCell key={index}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ) : (
            <Typography>No preview available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DatasetDetails; 