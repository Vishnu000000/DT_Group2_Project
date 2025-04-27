import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import LicenseManager from '../contracts/LicenseManager.json';

const LicenseContext = createContext();

const HEDERA_NETWORK = {
  testnet: {
    chainId: '0x128',
    chainName: 'Hedera Testnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
    rpcUrls: ['https://testnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/testnet'],
  },
  mainnet: {
    chainId: '0x127',
    chainName: 'Hedera Mainnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
    rpcUrls: ['https://mainnet.hashio.io/api'],
    blockExplorerUrls: ['https://hashscan.io/mainnet'],
  },
};

export function LicenseProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState('testnet');
  const [client, setClient] = useState(null);
  const [licenseContract, setLicenseContract] = useState(null);
  const [error, setError] = useState(null);

  const acctEnv = process.env.REACT_APP_HEDERA_ACCOUNT_ID;
  let keyEnv = process.env.REACT_APP_HEDERA_PRIVATE_KEY || '';
  const LICENSE_CONTRACT_ADDRESS = process.env.REACT_APP_LICENSE_CONTRACT_ADDRESS;

  if (keyEnv.startsWith('0x')) keyEnv = keyEnv.slice(2);

  let operatorId, operatorKey, configError;
  try {
    if (!acctEnv || !keyEnv || !LICENSE_CONTRACT_ADDRESS) {
      throw new Error(
        'Please set REACT_APP_HEDERA_ACCOUNT_ID, REACT_APP_HEDERA_PRIVATE_KEY, and REACT_APP_LICENSE_CONTRACT_ADDRESS in .env'
      );
    }
    operatorId = AccountId.fromString(acctEnv);
    operatorKey = PrivateKey.fromString(keyEnv);
  } catch (e) {
    configError = e.message;
  }

  useEffect(() => {
    if (configError) {
      setError(configError);
      return;
    }
    if (!window.ethereum) {
      setError('MetaMask not found');
      return;
    }

    const initClientAndContract = (net) => {
      try {
        const hederaClient =
          net === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
        hederaClient.setOperator(operatorId, operatorKey);
        setClient(hederaClient);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setLicenseContract(new ethers.Contract(
          LICENSE_CONTRACT_ADDRESS,
          LicenseManager.abi,
          signer
        ));
      } catch (err) {
        console.error('initClientAndContract error:', err);
        setError(err.message || 'Failed to initialize LicenseManager');
      }
    };

    window.ethereum.request({ method: 'eth_chainId' })
      .then(chainId => {
        if (chainId === HEDERA_NETWORK.mainnet.chainId) {
          setNetwork('mainnet');
          initClientAndContract('mainnet');
        } else if (chainId === HEDERA_NETWORK.testnet.chainId) {
          setNetwork('testnet');
          initClientAndContract('testnet');
        } else {
          setError('Please switch MetaMask to a Hedera network');
        }
      })
      .catch(console.error);

    window.ethereum.request({ method: 'eth_accounts' })
      .then(accts => { if (accts.length) setAccount(accts[0]); })
      .catch(console.error);

    const onAccounts = accts => accts.length ? setAccount(accts[0]) : setAccount(null);
    const onChain = chainId => {
      if (chainId === HEDERA_NETWORK.mainnet.chainId) {
        setNetwork('mainnet'); initClientAndContract('mainnet');
      } else if (chainId === HEDERA_NETWORK.testnet.chainId) {
        setNetwork('testnet'); initClientAndContract('testnet');
      } else {
        setError('Switch MetaMask to a Hedera network');
      }
    };
    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged', onChain);

    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts);
      window.ethereum.removeListener('chainChanged', onChain);
    };
  }, [configError]);

  const switchToHederaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HEDERA_NETWORK[network].chainId }],
      });
      return true;
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [HEDERA_NETWORK[network]],
        });
        return true;
      }
      setError('Could not switch to Hedera network');
      return false;
    }
  };

  const connect = async () => {
    try {
      const [acct] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(acct);
      if (!(await switchToHederaNetwork())) return;
    } catch (err) {
      console.error('connect error:', err);
      setError('Failed to connect');
    }
  };

  const disconnect = () => {
    setAccount(null);
    setClient(null);
    setLicenseContract(null);
    setError(null);
  };

  // ─── Contract Interactions ─────────────────────────────────────────────────
  const purchaseLicense = async (datasetCid) => {
    if (!licenseContract || !account) throw new Error('Wallet not connected');
    const tx = await licenseContract.purchaseLicense(datasetCid);
    await tx.wait();
  };

  const revokeLicense = async (datasetCid, licensee) => {
    if (!licenseContract) throw new Error('Contract not initialized');
    const tx = await licenseContract.revokeLicense(datasetCid, licensee);
    await tx.wait();
  };

  const isValidLicense = async (licenseId) => {
    if (!licenseContract) throw new Error('Contract not initialized');
    const isValid = await licenseContract.isValidLicense(licenseId);
    return isValid;
  };

  const getUserLicenses = async (userAddress) => {
    if ( !licenseContract) throw new Error('Contract not initialized');
    const licenses = await licenseContract.getUserLicenses(userAddress);
    return licenses;
  };

  // ─── Render & Provide ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: 20, color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <LicenseContext.Provider value={{
      account,
      network,
      client,
      licenseContract,
      connect,
      disconnect,
      purchaseLicense,
      revokeLicense,
      isValidLicense,
      getUserLicenses,
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error('useLicense must be used within a LicenseProvider');
  return ctx;
}
