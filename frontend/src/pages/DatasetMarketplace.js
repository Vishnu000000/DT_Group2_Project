import React, { useState, useEffect } from 'react';
import { useHedera } from '../context/HederaContext';
import { ethers } from 'ethers';
import { useLicense } from '../context/LicenseContext';
import { useToken } from '../context/TokenContext';

function DatasetMarketplace() {
  const { account, contract } = useHedera();
  const { licenseContract } = useLicense();
  const { tokenContract } = useToken();  // This should be an ERC-20 token contract
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [status, setStatus] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [isMinting, setIsMinting] = useState(false);
  const [mintAmount, setMintAmount] = useState('100');
  const [hasMinterRole, setHasMinterRole] = useState(false);
  const [isBuyingTokens, setIsBuyingTokens] = useState(false);
  const [buyAmount, setBuyAmount] = useState('100');
  const [exchangeRate, setExchangeRate] = useState('1000'); // 1 HBAR = 1000 DTT

  useEffect(() => {
    fetchDatasets();
    if (account && tokenContract) {
      fetchTokenBalance();
      checkMinterRole();
    }
  }, [account, tokenContract]);

  const checkMinterRole = async () => {
    if (!tokenContract || !account) return;
    try {
      const MINTER_ROLE = await tokenContract.MINTER_ROLE();
      const hasRole = await tokenContract.hasRole(MINTER_ROLE, account);
      setHasMinterRole(hasRole);
    } catch (error) {
      console.error('Error checking minter role:', error);
      setHasMinterRole(false);
    }
  };

  const fetchTokenBalance = async () => {
    if (!tokenContract || !account) return;
    try {
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.utils.formatUnits(balance, 10
      ));  // Ensure correct decimals
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setError('Failed to fetch token balance');
    }
  };

  const mintTokens = async () => {
    if (!tokenContract || !account) {
      setError('Wallet not connected');
      return;
    }

    if (!hasMinterRole) {
      setError('You do not have permission to mint tokens. Only accounts with MINTER_ROLE can mint tokens.');
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      setStatus('Minting tokens...');
      const amount = ethers.utils.parseUnits(mintAmount, 10);  // Adjusting for the token decimals
      const tx = await tokenContract.mint(account, amount, {
        gasLimit: 500000,
        maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
      });
      await tx.wait();
      setStatus('Tokens minted successfully!');
      await fetchTokenBalance();
    } catch (error) {
      console.error('Mint error:', error);
      if (error.message.includes('AccessControl')) {
        setError('You do not have permission to mint tokens');
      } else {
        setError('Failed to mint tokens: ' + error.message);
      }
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    async function loadDatasets() {
      if (!contract || !account) return;

      try {
        const count = await contract.getDatasetCount();
        const datasetList = [];

        for (let i = 0; i < count; i++) {
          const cid = await contract.getDatasetCid(i);
          const info = await contract.getDatasetInfo(cid);
          
          // Skip if dataset is removed
          if (info.isRemoved) {
            continue;
          }
          
          const hasLicense = await contract.hasLicense(cid, account.toString());

          // Store the raw BigNumber for price
          datasetList.push({
            cid,
            owner: info.owner,
            priceRaw: info.price, // Store raw BigNumber
            priceFormatted: ethers.utils.formatUnits(info.price, 18), // Changed from 18 to 8 decimals for HBAR
            isPublic: info.isPublic,
            name: info.name,
            description: info.description,
            hasLicense
          });
        }

        setDatasets(datasetList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading datasets:', error);
        setLoading(false);
      }
    }

    loadDatasets();
  }, [contract, account]);

  const purchaseDataset = async (dataset) => {
    if (!contract || !account || !licenseContract) {
      setError('Wallet not connected');
      return;
    }
  
    if (isPurchasing) {
      setError('Purchase already in progress');
      return;
    }
  
    setIsPurchasing(true);
    setError(null);
  
    try {
      setStatus('Preparing purchase...');
  
      // First check if the dataset is available and get its price
      const datasetInfo = await contract.getDatasetInfo(dataset.cid);
      console.log('Dataset info:', datasetInfo);
      
      if (datasetInfo.isPublic) {
        throw new Error('This dataset is public and does not require a license');
      }
      
      if (datasetInfo.isRemoved) {
        throw new Error('This dataset has been removed');
      }

      // Get price in HBAR (8 decimals)
      const priceInHBAR = dataset.priceRaw; // Use the raw BigNumber price
      console.log('Price in HBAR (raw):', priceInHBAR.toString());
      console.log('Price in HBAR (formatted):', ethers.utils.formatUnits(priceInHBAR, 8)); // Changed from 18 to 8 decimals

      console.log('Price in HBAR:', priceInHBAR);

      // Get the provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get the current gas price
      const gasPrice = await provider.getGasPrice();
      console.log('Current gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');

      // Use a fixed gas limit that's known to work for this transaction
      const gasLimit = ethers.BigNumber.from('500000');
      
      // Calculate gas cost in HBAR
      const gasCost = gasLimit.mul(gasPrice);
      console.log('Gas cost in HBAR:', ethers.utils.formatUnits(gasCost, 8));

      // Add 20% buffer to the base price to account for gas and fees
      const totalCost = priceInHBAR.mul(120).div(100);
      
      console.log('Cost breakdown:', {
        basePrice: ethers.utils.formatUnits(priceInHBAR, 8),
        gasCost: ethers.utils.formatUnits(gasCost, 8),
        totalCost: ethers.utils.formatUnits(totalCost, 8)
      });

      // Check if user already has a license
      const hasLicense = await contract.hasLicense(dataset.cid, account);
      console.log('Has license:', hasLicense);
      if (hasLicense) {
        throw new Error('You already have a license for this dataset');
      }

      // Check if the dataset owner is valid
      console.log('Dataset owner:', datasetInfo.owner);
      if (datasetInfo.owner === ethers.constants.AddressZero) {
        throw new Error('Invalid dataset owner');
      }

      // Check if the price is valid
      if (priceInHBAR.isZero()) {
        throw new Error('Invalid dataset price');
      }

      // Get user's HBAR balance
      const balance = await provider.getBalance(account);
      console.log('User balance:', ethers.utils.formatUnits(balance, 8), 'HBAR'); // Changed from 18 to 8 decimals

      if (balance.lt(totalCost)) {
        throw new Error(`Insufficient HBAR balance. Need ${ethers.utils.formatUnits(totalCost, 8)} HBAR but have ${ethers.utils.formatUnits(balance, 8)} HBAR`); // Changed from 18 to 8 decimals
      }
  
      setStatus('Purchasing license...');

      // Prepare transaction with fixed gas parameters
      console.log('Price in HBAR Before calling purchaseLicense:', priceInHBAR);
      const tx = await licenseContract.purchaseLicense(dataset.cid, {
        value: priceInHBAR,
        gasLimit: gasLimit,
        gasPrice: gasPrice
      });

      console.log('Transaction sent:', tx.hash);
  
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
  
      setStatus('License purchased successfully!');
      fetchDatasets();
    } catch (error) {
      console.error('Purchase error:', error);
      if (error.message.includes('Insufficient HBAR')) {
        setError(error.message);
      } else if (error.message.includes('License already active')) {
        setError('You already have an active license for this dataset.');
      } else if (error.message.includes('Dataset is public')) {
        setError('This dataset is public and does not require a license.');
      } else if (error.message.includes('Dataset is removed')) {
        setError('This dataset has been removed and is no longer available.');
      } else if (error.message.includes('already have a license')) {
        setError('You already have a license for this dataset.');
      } else if (error.message.includes('Invalid dataset owner')) {
        setError('This dataset has an invalid owner.');
      } else if (error.message.includes('Invalid dataset price')) {
        setError('This dataset has an invalid price.');
      } else if (error.code === -32603) {
        setError('Transaction rejected. Please check your HBAR balance and try again.');
      } else {
        setError('Failed to purchase license: ' + error.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };
  
  

  const checkAndApproveTokenAllowance = async (price) => {
    if (!licenseContract || !account) {
      throw new Error('Wallet not connected');
    }
    try {
      await licenseContract.checkAndApproveTokenAllowance(price);
    } catch (error) {
      console.error('Token allowance error:', error);
      throw new Error('Failed to approve token spending');
    }
  };

  const purchaseLicense = async (cid) => {
    if (!licenseContract || !account) {
      throw new Error('Wallet not connected');
    }
    try {
      const tx = await licenseContract.purchaseLicense(cid, {
        gasLimit: 500000,
        maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
      });
      return tx;
    } catch (error) {
      console.error('Purchase license error:', error);
      throw error;
    }
  };

  const fetchDatasets = async () => {
    if (!contract || !account) return;
    try {
      const count = await contract.getDatasetCount();
      const datasetList = [];

      for (let i = 0; i < count; i++) {
        const cid = await contract.getDatasetCid(i);
        const info = await contract.getDatasetInfo(cid);
        
        // Skip if dataset is removed
        if (info.isRemoved) {
          continue;
        }
        
        const hasLicense = await contract.hasLicense(cid, account.toString());

        // Store the raw BigNumber for price
        datasetList.push({
          cid,
          owner: info.owner,
          priceRaw: info.price, // Store raw BigNumber
          priceFormatted: ethers.utils.formatUnits(info.price, 8), // Changed from 18 to 8 decimals for HBAR
          isPublic: info.isPublic,
          name: info.name,
          description: info.description,
          hasLicense
        });
      }

      setDatasets(datasetList);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('Failed to fetch datasets');
    }
  };

  const buyTokensWithHBAR = async () => {
    if (!licenseContract || !account) {
      setError('Wallet not connected');
      return;
    }

    setIsBuyingTokens(true);
    setError(null);

    try {
      setStatus('Purchasing tokens...');

      const dttAmount = ethers.utils.parseUnits(buyAmount, 10);  // DTT token amount
      const hbarAmount = dttAmount.mul(ethers.utils.parseUnits('1', 10)).div(1000);  // Calculate HBAR equivalent

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const feeData = await provider.getFeeData();

      const tx = await licenseContract.buyTokens(dttAmount, {
        value: hbarAmount,
        gasLimit: 500000,
        maxFeePerGas: feeData.maxFeePerGas || ethers.utils.parseUnits('100', 'gwei'),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.utils.parseUnits('2', 'gwei'),
        type: 2 // EIP-1559
      });

      setStatus('Waiting for transaction confirmation...');
      await tx.wait();
      setStatus('Tokens purchased successfully!');
      await fetchTokenBalance();
    } catch (error) {
      console.error('Token purchase error:', error);
      if (error.message.includes('insufficient funds')) {
        setError('Insufficient HBAR balance. Please ensure you have enough HBAR for the purchase and gas fees.');
      } else {
        setError('Failed to purchase tokens: ' + error.message);
      }
    } finally {
      setIsBuyingTokens(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Dataset Marketplace</h2>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-medium">
              Your Balance: {tokenBalance} DTT
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Amount"
                min="1"
              />
              <button
                onClick={buyTokensWithHBAR}
                disabled={isBuyingTokens}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  isBuyingTokens ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isBuyingTokens ? 'Buying...' : 'Buy Tokens'}
              </button>
            </div>
            {hasMinterRole && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Amount"
                  min="1"
                />
                <button
                  onClick={mintTokens}
                  disabled={isMinting}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    isMinting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isMinting ? 'Minting...' : 'Mint Tokens'}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {status && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {status}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Exchange Rate: 1 HBAR = {exchangeRate} DTT
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <div key={dataset.cid} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {dataset.name ? dataset.name : 'Unnamed Dataset'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  CID: {dataset.cid}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {dataset.description ? dataset.description : 'No description provided'}
                </p>
                <div className="mt-4 space-y-1">
                  <div className="dataset-price">
                    Price: {dataset.priceFormatted} HBAR
                  </div>
                  <p className="text-sm text-gray-600">
                    Owner: {dataset.owner ? `${dataset.owner.toString().slice(0, 6)}...${dataset.owner.toString().slice(-4)}` : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Visibility: {dataset.isPublic ? 'Public' : 'Private'}
                  </p>
                </div>

                {dataset.hasLicense ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Licensed
                  </span>
                ) : (
                  <button
                    onClick={() => purchaseDataset(dataset)}
                    disabled={isPurchasing}
                    className={`mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isPurchasing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isPurchasing ? 'Purchasing...' : 'Buy License'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DatasetMarketplace;
