const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ethers } = require('ethers');
const { blockchainService, ipfsService } = require('../services');

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Upload dataset
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { name, description, licenseType, price } = req.body;
        const file = req.file;

        // Validate request
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (!name || !description || !licenseType || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('Uploading file to IPFS...');
        // Upload file to IPFS
        const cid = await ipfsService.uploadFile(file.buffer);
        console.log('File uploaded to IPFS with CID:', cid);

        // Upload dataset metadata to blockchain
        console.log('Uploading metadata to blockchain...');
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, blockchainService.provider);
        const tx = await blockchainService.uploadDataset(
            signer,
            cid,
            name,
            description,
            licenseType,
            price
        );
        console.log('Metadata uploaded to blockchain:', tx.hash);

        res.json({
            success: true,
            cid,
            transactionHash: tx.hash
        });
    } catch (error) {
        console.error('Error uploading dataset:', error);
        res.status(500).json({ 
            error: 'Failed to upload dataset',
            message: error.message
        });
    }
});

// Purchase license
router.post('/purchase/:datasetId', async (req, res) => {
    try {
        const { datasetId } = req.params;
        if (!datasetId) {
            return res.status(400).json({ error: 'Dataset ID is required' });
        }

        console.log('Purchasing license for dataset:', datasetId);
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, blockchainService.provider);
        
        const tx = await blockchainService.purchaseLicense(signer, datasetId);
        console.log('License purchased:', tx.hash);

        res.json({
            success: true,
            transactionHash: tx.hash
        });
    } catch (error) {
        console.error('Error purchasing license:', error);
        res.status(500).json({ 
            error: 'Failed to purchase license',
            message: error.message
        });
    }
});

// Get dataset details
router.get('/:datasetId', async (req, res) => {
    try {
        const { datasetId } = req.params;
        if (!datasetId) {
            return res.status(400).json({ error: 'Dataset ID is required' });
        }

        console.log('Fetching dataset:', datasetId);
        const dataset = await blockchainService.getDataset(datasetId);
        const provenance = await blockchainService.getProvenance(datasetId);
        
        res.json({
            ...dataset,
            provenance
        });
    } catch (error) {
        console.error('Error fetching dataset:', error);
        res.status(500).json({ 
            error: 'Failed to fetch dataset',
            message: error.message
        });
    }
});

// Get dataset file
router.get('/:datasetId/file', async (req, res) => {
    try {
        const { datasetId } = req.params;
        if (!datasetId) {
            return res.status(400).json({ error: 'Dataset ID is required' });
        }

        console.log('Fetching dataset file:', datasetId);
        const dataset = await blockchainService.getDataset(datasetId);
        
        // Check if user has license
        const hasLicense = await blockchainService.getLicenseStatus(
            req.user?.address || '0x0000000000000000000000000000000000000000',
            datasetId
        );
        
        if (!hasLicense) {
            return res.status(403).json({ error: 'License required to access this file' });
        }

        const fileBuffer = await ipfsService.getFile(dataset.cid);
        
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(fileBuffer);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ 
            error: 'Failed to fetch file',
            message: error.message
        });
    }
});

// Get all datasets
router.get('/', async (req, res) => {
    try {
        console.log('=== Getting All Datasets ===');
        const count = await blockchainService.getDatasetCount();
        console.log('Total datasets:', count.toString());
        
        const datasets = [];
        for (let i = 0; i < parseInt(count.toString()); i++) {
            try {
                console.log(`Fetching dataset ${i}...`);
                const dataset = await blockchainService.getDataset(i);
                console.log(`Dataset ${i} details:`, dataset);
                if (dataset) {
                    datasets.push({
                        id: i,
                        ...dataset
                    });
                }
            } catch (error) {
                console.error(`Error fetching dataset ${i}:`, error);
                console.error('Error stack:', error.stack);
            }
        }
        
        console.log('Final datasets array:', datasets);
        res.json(datasets);
    } catch (error) {
        console.error('Error getting datasets:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to get datasets',
            message: error.message,
            stack: error.stack
        });
    }
});

// Get dataset count
router.get('/count', async (req, res) => {
    try {
        console.log('=== Getting Dataset Count ===');
        console.log('Blockchain service initialized:', !!blockchainService);
        console.log('Contract address:', blockchainService.contract.address);
        const count = await blockchainService.getDatasetCount();
        console.log('Raw count from blockchain:', count);
        console.log('Count as string:', count.toString());
        res.json({ count: count.toString() });
    } catch (error) {
        console.error('Error getting dataset count:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to get dataset count',
            message: error.message,
            stack: error.stack
        });
    }
});

module.exports = router; 