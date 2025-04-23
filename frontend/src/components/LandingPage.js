import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorageIcon from '@mui/icons-material/Storage';

const LandingPage = () => {
  const navigate = useNavigate();
  const { active } = useWeb3React();
  const theme = useTheme();

  const handleGetStarted = () => {
    if (active) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Data Storage',
      description: 'Your datasets are encrypted and stored on IPFS, ensuring security and accessibility.'
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Transparent Licensing',
      description: 'Manage dataset licenses through smart contracts, with clear terms and conditions.'
    },
    {
      icon: <StorageIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Compliance Ready',
      description: 'Built-in compliance features for GDPR and other regulatory requirements.'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        my: 8, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography 
          variant="h1" 
          component="h1" 
          gutterBottom
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2
          }}
        >
          AI Data Marketplace
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}
        >
          A decentralized platform for secure and transparent AI training data management
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          sx={{ 
            mt: 4,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 2
          }}
        >
          Get Started
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ mt: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Box sx={{ mb: 3 }}>
                {feature.icon}
              </Box>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                {feature.title}
              </Typography>
              <Typography 
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LandingPage; 