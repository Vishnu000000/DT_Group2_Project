import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { injected } from '../utils/connectors';

const Navigation = () => {
  const { account, active, activate, deactivate } = useWeb3React();
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    try {
      deactivate();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AI Data Marketplace
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/compliance')}>
            Compliance
          </Button>
          {active ? (
            <>
              <Button color="inherit">
                {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connected'}
              </Button>
              <Button color="inherit" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 