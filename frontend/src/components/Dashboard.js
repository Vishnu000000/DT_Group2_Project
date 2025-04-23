import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  TablePagination,
  TableSortLabel,
  InputAdornment
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import BlockchainService from '../services/blockchainService';
import IPFSService from '../services/ipfsService';
import axios from 'axios';
import { ethers } from 'ethers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublishIcon from '@mui/icons-material/Publish';
import SearchIcon from '@mui/icons-material/Search';
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Dashboard = () => {
  const { account, library, active } = useWeb3React();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    price: '',
    licenseType: '0',
    file: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [blockchainService, setBlockchainService] = useState(null);
  const theme = useTheme();
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const initializeBlockchainService = async () => {
      if (account && library) {
        try {
          console.log('Initializing blockchain service with account:', account);
          const service = new BlockchainService();
          await service.initialize(library.getSigner());
          console.log('Blockchain service initialized successfully');
          setBlockchainService(service);
        } catch (error) {
          console.error('Error initializing blockchain service:', error);
          setSnackbar({
            open: true,
            message: 'Error connecting to blockchain: ' + error.message,
            severity: 'error'
          });
        }
      } else {
        console.log('Waiting for Web3 connection...', { account, library });
      }
    };

    initializeBlockchainService();
  }, [account, library]);

  const loadDatasets = useCallback(async () => {
    if (!blockchainService) {
      console.log('Blockchain service not initialized yet');
      return;
    }

    if (!account) {
      console.log('No account connected');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching datasets...');
      const loadedDatasets = await blockchainService.getDatasets();
      console.log('Loaded datasets:', loadedDatasets);
      setDatasets(loadedDatasets);
    } catch (error) {
      console.error('Error loading datasets:', error);
      setSnackbar({
        open: true,
        message: 'Error loading datasets: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [blockchainService, account]);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const getFilteredAndSortedDatasets = () => {
    return datasets
      .filter(dataset => {
        const matchesSearch = 
          dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dataset.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
          filterStatus === 'all' || 
          (filterStatus === 'active' && dataset.isActive) ||
          (filterStatus === 'inactive' && !dataset.isActive);
        
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const isAsc = order === 'asc';
        if (orderBy === 'title') {
          return isAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        } else if (orderBy === 'price') {
          return isAsc ? a.price - b.price : b.price - a.price;
        }
        return 0;
      });
  };

  const filteredDatasets = getFilteredAndSortedDatasets();

  const handleFileChange = (event) => {
    setUploadForm(prev => ({
      ...prev,
      file: event.target.files[0]
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    
    if (!blockchainService) {
      setSnackbar({
        open: true,
        message: 'Blockchain service not initialized',
        severity: 'error'
      });
      return;
    }

    if (!uploadForm.file) {
      setSnackbar({
        open: true,
        message: 'Please select a file',
        severity: 'error'
      });
      return;
    }

    if (!uploadForm.title || !uploadForm.description || !uploadForm.price) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('licenseType', uploadForm.licenseType);
      const priceInWei = ethers.utils.parseEther(uploadForm.price.toString());
      formData.append('price', priceInWei.toString());

      console.log('Uploading dataset...');
      const result = await blockchainService.uploadDataset(
        formData.get('file'),
        formData.get('name'),
        formData.get('description'),
        formData.get('licenseType'),
        formData.get('price')
      );

      console.log('Upload response:', result);

      setSnackbar({
        open: true,
        message: 'Dataset uploaded successfully',
        severity: 'success'
      });

      // Reset form
      setUploadForm({
        title: '',
        description: '',
        price: '',
        licenseType: '0',
        file: null
      });

      // Reload datasets
      const updatedDatasets = await blockchainService.getDatasets();
      setDatasets(updatedDatasets);

    } catch (error) {
      console.error('Error uploading dataset:', error);
      setError(error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || 'Error uploading dataset',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (datasetId) => {
    if (!blockchainService) {
      setSnackbar({
        open: true,
        message: 'Blockchain service not initialized',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const dataset = datasets.find(d => d.id === datasetId);
      
      await blockchainService.purchaseDataset(datasetId, dataset.price);
      
      setSnackbar({
        open: true,
        message: 'Dataset purchased successfully',
        severity: 'success'
      });

      // Refresh the dataset to update its status
      const updatedDataset = await blockchainService.getDataset(datasetId);
      setDatasets(datasets.map(d => d.id === datasetId ? { ...updatedDataset, id: datasetId } : d));

    } catch (error) {
      console.error('Error purchasing dataset:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error purchasing dataset',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (datasetId) => {
    if (!blockchainService) {
      setSnackbar({
        open: true,
        message: 'Blockchain service not initialized',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const dataset = datasets.find(d => d.id === datasetId);
      
      // Verify ownership or purchase
      const hasAccess = await blockchainService.hasDatasetAccess(datasetId);
      if (!hasAccess) {
        setSnackbar({
          open: true,
          message: 'You need to purchase this dataset first',
          severity: 'warning'
        });
        return;
      }

      // Download from backend
      const response = await axios.get(`http://localhost:3000/api/datasets/download/${dataset.ipfsHash}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataset.title}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Dataset downloaded successfully',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error downloading dataset:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error downloading dataset',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDatasetActions = (dataset) => {
    if (dataset.owner.toLowerCase() === account?.toLowerCase()) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleDownload(dataset.id)}
          disabled={loading}
        >
          Download
        </Button>
      );
    }

    return (
      <>
        {dataset.purchased ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleDownload(dataset.id)}
            disabled={loading}
          >
            Download
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handlePurchase(dataset.id)}
            disabled={loading}
          >
            Purchase ({ethers.utils.formatEther(dataset.price)} ETH)
          </Button>
        )}
      </>
    );
  };

  const renderLoadingState = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((index) => (
        <Grid item xs={12} md={4} key={index}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderErrorState = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 4,
      textAlign: 'center'
    }}>
      <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" color="error" gutterBottom>
        Error Loading Data
      </Typography>
      <Typography color="text.secondary" paragraph>
        {error?.message || 'An unexpected error occurred'}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setError(null);
          loadDatasets();
        }}
      >
        Retry
      </Button>
    </Box>
  );

  if (!active) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please connect your wallet to access the dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {error ? (
          renderErrorState()
        ) : loading ? (
          renderLoadingState()
        ) : (
          <>
            {/* Upload Form */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Typography variant="h6" gutterBottom>
                Upload New Dataset
              </Typography>
              <form onSubmit={handleUpload}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={uploadForm.title}
                      onChange={handleInputChange}
                      required
                      error={!uploadForm.title && uploadForm.file !== null}
                      helperText={!uploadForm.title && uploadForm.file !== null ? 'Title is required' : ''}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price (AIDT)"
                      name="price"
                      type="number"
                      value={uploadForm.price}
                      onChange={handleInputChange}
                      required
                      error={!uploadForm.price && uploadForm.file !== null}
                      helperText={!uploadForm.price && uploadForm.file !== null ? 'Price is required' : ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      multiline
                      rows={4}
                      value={uploadForm.description}
                      onChange={handleInputChange}
                      required
                      error={!uploadForm.description && uploadForm.file !== null}
                      helperText={!uploadForm.description && uploadForm.file !== null ? 'Description is required' : ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mr: 2 }}
                    >
                      Select File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>
                    {uploadForm.file && (
                      <Typography variant="body2" color="text.secondary">
                        Selected: {uploadForm.file.name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<PublishIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Uploading...' : 'Upload Dataset'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>

            {/* Search and Filter Bar */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search datasets..."
                    value={searchQuery}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={handleFilterChange}
                      label="Status"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Datasets Table */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                border: '1px solid', 
                borderColor: 'divider',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Typography variant="h6" gutterBottom>
                Available Datasets
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'title'}
                          direction={orderBy === 'title' ? order : 'asc'}
                          onClick={() => handleRequestSort('title')}
                        >
                          Title
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'price'}
                          direction={orderBy === 'price' ? order : 'asc'}
                          onClick={() => handleRequestSort('price')}
                        >
                          Price
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDatasets
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((dataset) => (
                        <TableRow key={dataset.id}>
                          <TableCell>{dataset.title}</TableCell>
                          <TableCell>{dataset.description}</TableCell>
                          <TableCell>{dataset.price} AIDT</TableCell>
                          <TableCell>
                            <Chip
                              label={dataset.isActive ? 'Active' : 'Inactive'}
                              color={dataset.isActive ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handlePurchase(dataset.id)}
                              disabled={loading}
                              sx={{ mr: 1 }}
                            >
                              Purchase
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/dataset/${dataset.id}`)}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredDatasets.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </>
        )}
      </Box>

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

export default Dashboard; 