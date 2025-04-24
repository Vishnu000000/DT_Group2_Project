import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import DatasetRegistry from '../contracts/DatasetRegistry.json';

const HederaContext = createContext();

// Hedera Network Configuration
const HEDERA_NETWORK = {
  testnet: {
    chainId: '0x128',
    chainName: 'Hedera Testnet',
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18
    },
    rpcUrls: ['https://testnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/testnet']
  },
  mainnet: {
    chainId: '0x127',
    chainName: 'Hedera Mainnet',
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/mainnet']
  }
};

// Contract address - replace with your deployed contract address
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0xYourContractAddress';

export function HederaProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
  const [network, setNetwork] = useState('testnet');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      setIsWalletInstalled(true);
      
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connect();
          }
        })
        .catch(console.error);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        if (chainId === HEDERA_NETWORK.testnet.chainId) {
          setNetwork('testnet');
        } else if (chainId === HEDERA_NETWORK.mainnet.chainId) {
          setNetwork('mainnet');
        } else {
          setError('Please switch to Hedera network');
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const addHederaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [HEDERA_NETWORK[network]]
      });
      return true;
    } catch (error) {
      console.error('Error adding Hedera network:', error);
      setError('Failed to add Hedera network to MetaMask');
      return false;
    }
  };

  const switchToHederaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HEDERA_NETWORK[network].chainId }]
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        return await addHederaNetwork();
      }
      console.error('Error switching to Hedera network:', error);
      setError('Failed to switch to Hedera network');
      return false;
    }
  };

  const connect = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      // Switch to Hedera network
      const switched = await switchToHederaNetwork();
      if (!switched) {
        return;
      }

      setAccount(account);
      setIsConnected(true);

      // Initialize Hedera client
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Initialize Hedera client
      const hederaClient = network === 'testnet' ? Client.forTestnet() : Client.forMainnet();
      setClient(hederaClient);

      // Initialize contract
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        DatasetRegistry.abi,
        signer
      );
      setContract(contractInstance);
      setError(null);

    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      setError(error.message);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setClient(null);
    setContract(null);
    setError(null);
  };

  // Contract interaction methods
  const registerDataset = async (cid, price, isPublic) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Convert price from HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
      const priceInTinybars = ethers.utils.parseUnits(price.toString(), 8);

      // Call the contract's registerDataset function
      const tx = await contract.registerDataset(cid, priceInTinybars, isPublic);
      
      // Wait for the transaction to be mined
      await tx.wait();

      return tx;
    } catch (error) {
      console.error('Error registering dataset:', error);
      throw error;
    }
  };

  const getAvailableDatasets = async () => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Get all dataset CIDs
      const cids = await contract.getDatasetCids();
      
      // Get details for each dataset
      const datasets = await Promise.all(
        cids.map(async (cid) => {
          const dataset = await contract.datasets(cid);
          return {
            id: cid,
            owner: dataset.owner,
            price: ethers.utils.formatUnits(dataset.price, 8), // Convert tinybars to HBAR
            isPublic: dataset.isPublic,
            isRemoved: dataset.isRemoved,
            uploadTimestamp: dataset.uploadTimestamp.toNumber(),
            name: dataset.name,
            description: dataset.description
          };
        })
      );

      // Filter out removed datasets
      return datasets.filter(dataset => !dataset.isRemoved);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  };

  const downloadDataset = async (cid) => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Call the contract's downloadDataset function
      const tx = await contract.downloadDataset(cid);
      
      // Wait for the transaction to be mined
      await tx.wait();

      return tx;
    } catch (error) {
      console.error('Error downloading dataset:', error);
      throw error;
    }
  };

  const value = {
    account,
    isConnected,
    isWalletInstalled,
    client,
    contract,
    error,
    network,
    connect,
    disconnect,
    registerDataset,
    getAvailableDatasets,
    downloadDataset
  };

  return (
    <HederaContext.Provider value={value}>
      {children}
    </HederaContext.Provider>
  );
}

export function useHedera() {
  const context = useContext(HederaContext);
  if (context === undefined) {
    throw new Error('useHedera must be used within a HederaProvider');
  }
  return context;
} 