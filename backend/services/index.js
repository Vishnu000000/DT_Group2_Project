require('dotenv').config();
const BlockchainService = require('./blockchainService');
const IPFSService = require('./ipfsService');

// Initialize services
console.log('\n=== Initializing Services ===');
console.log('Environment variables:');
console.log('PROVIDER_URL:', process.env.PROVIDER_URL);
console.log('PINATA_API_KEY:', process.env.PINATA_API_KEY ? '****' : 'undefined');
console.log('PINATA_API_SECRET:', process.env.PINATA_API_SECRET ? '****' : 'undefined');

if (!process.env.PROVIDER_URL) {
    console.error('Error: PROVIDER_URL is not set in .env file');
    process.exit(1);
}

if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
    console.error('Error: Pinata credentials are not set in .env file');
    process.exit(1);
}

let blockchainService;
try {
    console.log('\nInitializing blockchain service...');
    blockchainService = new BlockchainService(process.env.PROVIDER_URL);
    console.log('Blockchain service initialized successfully');
} catch (error) {
    console.error('Error initializing blockchain service:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
}

let ipfsService;
try {
    console.log('\nInitializing IPFS service...');
    ipfsService = new IPFSService(
        process.env.PINATA_API_KEY,
        process.env.PINATA_API_SECRET
    );
    console.log('IPFS service initialized successfully');
} catch (error) {
    console.error('Error initializing IPFS service:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
}

module.exports = {
    blockchainService,
    ipfsService
}; 
