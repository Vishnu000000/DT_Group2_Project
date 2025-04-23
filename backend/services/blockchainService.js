const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

class BlockchainService {
    constructor(providerUrl) {
        console.log('\n=== BlockchainService Initialization ===');
        console.log('Provider URL:', providerUrl);

        if (!providerUrl) {
            console.error('Missing required parameter: Provider URL');
            throw new Error('Provider URL is required');
        }

        try {
            // Load contract address from JSON file
            const contractAddressPath = path.join(__dirname, '../../contract-address.json');
            if (!fs.existsSync(contractAddressPath)) {
                throw new Error('Contract address file not found. Please deploy the contract first.');
            }
            const contractData = require(contractAddressPath);
            const contractAddress = contractData.address;
            
            if (!contractAddress) {
                throw new Error('Contract address not found in contract-address.json. Please deploy the contract first.');
            }
            
            console.log('Contract Address:', contractAddress);

            // Load contract ABI
            const contractPath = path.join(__dirname, '../../artifacts/contracts/DatasetManager.sol/DatasetManager.json');
            console.log('Contract artifact path:', contractPath);
            
            if (!fs.existsSync(contractPath)) {
                console.error('Contract artifact not found at:', contractPath);
                console.log('Current directory:', __dirname);
                console.log('Directory contents:', fs.readdirSync(path.join(__dirname, '../../artifacts/contracts')));
                throw new Error(`Contract ABI not found at ${contractPath}`);
            }
            
            const contractJson = require(contractPath);
            console.log('Contract JSON loaded successfully');
            console.log('ABI length:', contractJson.abi ? contractJson.abi.length : 'undefined');
            
            if (!contractJson.abi) {
                console.error('Contract JSON structure:', JSON.stringify(contractJson, null, 2));
                throw new Error('Contract ABI is missing in the JSON file');
            }

            // Initialize provider and contract
            console.log('Initializing provider...');
            this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
            console.log('Provider initialized successfully');
            
            console.log('Initializing contract...');
            this.contract = new ethers.Contract(
                contractAddress,
                contractJson.abi,
                this.provider
            );
            console.log('Contract initialized successfully');
            
            // Verify contract connection
            console.log('Verifying contract connection...');
            this.contract.provider.getNetwork().then(network => {
                console.log('Connected to network:', network.name, '(Chain ID:', network.chainId, ')');
            }).catch(err => {
                console.error('Error getting network info:', err);
            });
            
        } catch (error) {
            console.error('Detailed error in blockchain service initialization:', error);
            console.error('Stack trace:', error.stack);
            throw new Error(`Failed to initialize blockchain service: ${error.message}`);
        }
    }

    async uploadDataset(signer, cid, name, description, licenseType, price) {
        try {
            const contractWithSigner = this.contract.connect(signer);
            console.log('Uploading dataset:', { cid, name, description, licenseType, price });
            
            const tx = await contractWithSigner.uploadDataset(
                cid,
                name,
                description,
                licenseType,
                price
            );
            console.log('Transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.transactionHash);
            return receipt;
        } catch (error) {
            console.error('Error uploading dataset:', error);
            throw new Error(`Failed to upload dataset: ${error.message}`);
        }
    }

    async purchaseLicense(signer, datasetId) {
        try {
            const contractWithSigner = this.contract.connect(signer);
            console.log('Purchasing license for dataset:', datasetId);
            
            const tx = await contractWithSigner.purchaseLicense(datasetId);
            console.log('Transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.transactionHash);
            return receipt;
        } catch (error) {
            console.error('Error purchasing license:', error);
            throw new Error(`Failed to purchase license: ${error.message}`);
        }
    }

    async revokeLicense(signer, datasetId, licensee) {
        try {
            const contractWithSigner = this.contract.connect(signer);
            console.log('Revoking license:', { datasetId, licensee });
            
            const tx = await contractWithSigner.revokeLicense(datasetId, licensee);
            console.log('Transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.transactionHash);
            return receipt;
        } catch (error) {
            console.error('Error revoking license:', error);
            throw new Error(`Failed to revoke license: ${error.message}`);
        }
    }

    async getLicenseStatus(licensee, datasetId) {
        try {
            console.log('Getting license status:', { licensee, datasetId });
            const status = await this.contract.getLicenseStatus(licensee, datasetId);
            console.log('License status:', status);
            return status;
        } catch (error) {
            console.error('Error getting license status:', error);
            throw new Error(`Failed to get license status: ${error.message}`);
        }
    }

    async getProvenance(datasetId) {
        try {
            console.log('Getting provenance for dataset:', datasetId);
            const provenance = await this.contract.getProvenance(datasetId);
            console.log('Provenance:', provenance);
            return provenance;
        } catch (error) {
            console.error('Error getting provenance:', error);
            throw new Error(`Failed to get provenance: ${error.message}`);
        }
    }

    async getDatasetLicensees(datasetId) {
        try {
            console.log('Getting licensees for dataset:', datasetId);
            const licensees = await this.contract.getDatasetLicensees(datasetId);
            console.log('Licensees:', licensees);
            return licensees;
        } catch (error) {
            console.error('Error getting dataset licensees:', error);
            throw new Error(`Failed to get dataset licensees: ${error.message}`);
        }
    }

    async getDatasetCount() {
        try {
            console.log('\n=== Getting Dataset Count ===');
            console.log('Contract initialized:', !!this.contract);
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            console.log('Calling contract.datasetCount()...');
            const count = await this.contract.datasetCount();
            console.log('Raw count from contract:', count);
            console.log('Count as string:', count.toString());
            return count;
        } catch (error) {
            console.error('Detailed error getting dataset count:', error);
            console.error('Error stack:', error.stack);
            throw new Error(`Failed to get dataset count: ${error.message}`);
        }
    }

    async getDataset(datasetId) {
        try {
            console.log('\n=== Getting Dataset ===');
            console.log('Dataset ID:', datasetId);
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            
            // Convert datasetId to number and validate
            const id = parseInt(datasetId);
            if (isNaN(id)) {
                throw new Error('Invalid dataset ID');
            }
            
            console.log('Calling contract.datasets() with ID:', id);
            const dataset = await this.contract.datasets(id);
            console.log('Raw dataset from contract:', dataset);
            
            const formattedDataset = {
                id: id,
                owner: dataset.owner,
                cid: dataset.cid,
                name: dataset.name,
                description: dataset.description,
                licenseType: dataset.licenseType,
                price: dataset.price.toString(),
                timestamp: dataset.timestamp.toString()
            };
            console.log('Formatted dataset:', formattedDataset);
            
            return formattedDataset;
        } catch (error) {
            console.error('Detailed error getting dataset:', error);
            console.error('Error stack:', error.stack);
            throw new Error(`Failed to get dataset: ${error.message}`);
        }
    }
}

module.exports = BlockchainService; 