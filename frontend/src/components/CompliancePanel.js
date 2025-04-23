import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  TextField,
  Snackbar,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import BlockchainService from '../services/blockchainService';
import { ethers } from 'ethers';
import GavelIcon from '@mui/icons-material/Gavel';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import HistoryIcon from '@mui/icons-material/History';

const CompliancePanel = () => {
  const { account, library } = useWeb3React();
  const [complianceData, setComplianceData] = useState([]);
  const [auditTrails, setAuditTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openAuditDialog, setOpenAuditDialog] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [blockchainService, setBlockchainService] = useState(null);

  useEffect(() => {
    if (library) {
      const service = new BlockchainService(library);
      setBlockchainService(service);
    }
  }, [library]);

  useEffect(() => {
    if (account && blockchainService) {
      fetchComplianceData();
      fetchAuditTrails();
    }
  }, [account, blockchainService]);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      const datasets = await blockchainService.getDatasets();
      const complianceStatus = await Promise.all(
        datasets.map(async (dataset) => {
          const gdprStatus = await blockchainService.getGDPRStatus(dataset.id);
          const auditHistory = await blockchainService.getAuditHistory(dataset.id);
          return {
            id: dataset.id,
            name: dataset.name,
            status: gdprStatus.isCompliant ? 'Compliant' : 'Non-Compliant',
            lastAudit: auditHistory[0]?.timestamp || new Date().toISOString(),
            violations: auditHistory.filter(a => !a.passed).length,
            gdprConsent: gdprStatus.hasConsent,
            dataSubjectRights: gdprStatus.dataSubjectRights
          };
        })
      );
      setComplianceData(complianceStatus);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching compliance data',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  const fetchAuditTrails = async () => {
    try {
      const trails = await blockchainService.getAuditTrails();
      setAuditTrails(trails);
    } catch (error) {
      console.error('Error fetching audit trails:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching audit trails',
        severity: 'error'
      });
    }
  };

  const handleAudit = async () => {
    if (!selectedDataset || !auditNotes) return;

    try {
      await blockchainService.performAudit(
        selectedDataset.id,
        auditNotes,
        true // Assuming audit passes for this example
      );

      setSnackbar({
        open: true,
        message: 'Audit completed successfully',
        severity: 'success'
      });

      fetchComplianceData();
      fetchAuditTrails();
      setOpenAuditDialog(false);
      setAuditNotes('');
    } catch (error) {
      console.error('Error performing audit:', error);
      setSnackbar({
        open: true,
        message: 'Error performing audit',
        severity: 'error'
      });
    }
  };

  const handleGDPRUpdate = async (datasetId, consent) => {
    try {
      await blockchainService.updateGDPRConsent(datasetId, consent);
      setSnackbar({
        open: true,
        message: 'GDPR consent updated successfully',
        severity: 'success'
      });
      fetchComplianceData();
    } catch (error) {
      console.error('Error updating GDPR consent:', error);
      setSnackbar({
        open: true,
        message: 'Error updating GDPR consent',
        severity: 'error'
      });
    }
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
        <Typography variant="h4" gutterBottom>
          Compliance Panel
        </Typography>

        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
          <Tab icon={<GavelIcon />} label="Compliance Status" />
          <Tab icon={<PrivacyTipIcon />} label="GDPR Management" />
          <Tab icon={<HistoryIcon />} label="Audit Trails" />
        </Tabs>

        {selectedTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Dataset Compliance Status
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dataset</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Audit</TableCell>
                        <TableCell>Violations</TableCell>
                        <TableCell>GDPR Consent</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {complianceData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              color={item.status === 'Compliant' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(item.lastAudit).toLocaleString()}
                          </TableCell>
                          <TableCell>{item.violations}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.gdprConsent ? 'Consent Given' : 'No Consent'}
                              color={item.gdprConsent ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedDataset(item);
                                setOpenAuditDialog(true);
                              }}
                            >
                              Audit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        )}

        {selectedTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  GDPR Consent Management
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dataset</TableCell>
                        <TableCell>Current Consent</TableCell>
                        <TableCell>Data Subject Rights</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {complianceData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={item.gdprConsent}
                                  onChange={(e) => handleGDPRUpdate(item.id, e.target.checked)}
                                />
                              }
                              label={item.gdprConsent ? 'Consent Given' : 'No Consent'}
                            />
                          </TableCell>
                          <TableCell>
                            {item.dataSubjectRights?.map((right, index) => (
                              <Chip
                                key={index}
                                label={right}
                                color="primary"
                                size="small"
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                // TODO: Implement detailed GDPR management
                              }}
                            >
                              Manage Rights
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        )}

        {selectedTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Audit Trail History
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Dataset</TableCell>
                        <TableCell>Auditor</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditTrails.map((trail, index) => (
                        <TableRow key={index}>
                          <TableCell>{trail.datasetName}</TableCell>
                          <TableCell>{trail.auditor}</TableCell>
                          <TableCell>
                            {new Date(trail.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={trail.passed ? 'Passed' : 'Failed'}
                              color={trail.passed ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>{trail.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      <Dialog open={openAuditDialog} onClose={() => setOpenAuditDialog(false)}>
        <DialogTitle>Perform Audit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Audit Notes"
            fullWidth
            multiline
            rows={4}
            value={auditNotes}
            onChange={(e) => setAuditNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuditDialog(false)}>Cancel</Button>
          <Button onClick={handleAudit} variant="contained" color="primary">
            Submit Audit
          </Button>
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

export default CompliancePanel; 