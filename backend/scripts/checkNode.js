const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function checkNode() {
    console.log('\n=== Checking Local Node Status ===');
    
    // Check provider URL
    const providerUrl = process.env.PROVIDER_URL || 'http://localhost:8545';
    console.log('Provider URL:', providerUrl);
    
    try {
        // Initialize provider
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        console.log('Provider initialized');
        
        // Check network
        const network = await provider.getNetwork();
        console.log('Network:', network.name, '(Chain ID:', network.chainId, ')');
        
        // Check block number
        const blockNumber = await provider.getBlockNumber();
        console.log('Current block:', blockNumber);
        
        // Check contract deployment
        const contractAddress = process.env.CONTRACT_ADDRESS;
        if (contractAddress) {
            console.log('\n=== Checking Contract Deployment ===');
            console.log('Contract Address:', contractAddress);
            
            // Load contract ABI
            const contractPath = path.join(__dirname, '../../artifacts/contracts/DatasetManager.sol/DatasetManager.json');
            if (fs.existsSync(contractPath)) {
                const contractJson = require(contractPath);
                const contract = new ethers.Contract(contractAddress, contractJson.abi, provider);
                
                // Check contract owner
                try {
                    const owner = await contract.owner();
                    console.log('Contract Owner:', owner);
                    
                    // Check dataset count
                    const datasetCount = await contract.datasetCount();
                    console.log('Dataset Count:', datasetCount.toString());
                    
                    // Check token address
                    const tokenAddress = await contract.token();
                    console.log('Token Address:', tokenAddress);
                } catch (err) {
                    console.error('Error interacting with contract:', err.message);
                }
            } else {
                console.error('Contract artifact not found at:', contractPath);
            }
        } else {
            console.error('Contract address not found in environment variables');
        }
        
    } catch (error) {
        console.error('Error checking node:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Could not connect to the node. Is it running?');
        }
    }
}

// Run the check
checkNode().catch(console.error); 