import React, { createContext, useState, useContext, useEffect } from 'react';
import { Client, AccountId } from '@hashgraph/sdk';

const HederaContext = createContext();

export function HederaProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState(null);
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);

  useEffect(() => {
    // Initialize Hedera client
    const hederaClient = Client.forTestnet();
    setClient(hederaClient);

    // Check if HashPack is installed
    const checkWallet = () => {
      if (typeof window !== 'undefined' && window.hashpack) {
        console.log('HashPack detected');
        setIsWalletInstalled(true);
        
        // Try to get the current account if already connected
        window.hashpack.getAccountInfo()
          .then(info => {
            console.log('Account info:', info);
            if (info && info.accountId) {
              setAccount(AccountId.fromString(info.accountId));
              setIsConnected(true);
            }
          })
          .catch(error => {
            console.log('Not connected to HashPack:', error);
            setIsConnected(false);
          });
      } else {
        console.log('HashPack not detected');
        setIsWalletInstalled(false);
      }
    };

    // Initial check
    checkWallet();

    // Listen for wallet installation
    if (typeof window !== 'undefined') {
      window.addEventListener('hashpack#initialized', checkWallet);
    }

    // Check periodically for wallet installation
    const interval = setInterval(checkWallet, 1000);

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashpack#initialized', checkWallet);
      }
      clearInterval(interval);
    };
  }, []);

  const connect = async () => {
    try {
      if (!window.hashpack) {
        window.open('https://www.hashpack.app/', '_blank');
        return;
      }

      console.log('Attempting to connect to HashPack...');
      const { accountId } = await window.hashpack.connect({
        network: 'testnet',
        dAppCode: 'AI Data Chain'
      });

      console.log('Connected with account:', accountId);
      if (accountId) {
        setAccount(AccountId.fromString(accountId));
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting to HashPack:', error);
      alert('Failed to connect to HashPack. Please try again.');
    }
  };

  const disconnect = async () => {
    try {
      if (window.hashpack) {
        await window.hashpack.disconnect();
      }
      setAccount(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting from HashPack:', error);
    }
  };

  return (
    <HederaContext.Provider
      value={{
        account,
        isConnected,
        client,
        isWalletInstalled,
        connect,
        disconnect
      }}
    >
      {children}
    </HederaContext.Provider>
  );
}

export function useHedera() {
  const context = useContext(HederaContext);
  if (!context) {
    throw new Error('useHedera must be used within a HederaProvider');
  }
  return context;
} 