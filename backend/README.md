# Backend Documentation

## Project Overview
This backend service handles the interaction between the frontend, smart contracts, and IPFS for the AI Data Marketplace.

## Completed Tasks

### Smart Contract Integration
1. **AIDataToken Contract Integration**
   - Token balance management
   - Faucet functionality integration
   - Token transfer handling
   - Event listening

2. **DatasetRegistry Contract Integration**
   - Dataset registration handling
   - License management integration
   - Price updates and category management
   - Dataset revocation handling
   - License status tracking

### Services
1. **BlockchainService**
   - Smart contract interaction
   - Dataset upload and management
   - License purchase and revocation
   - Dataset querying
   - Transaction monitoring

2. **IPFSService**
   - File upload to IPFS
   - CID retrieval
   - File pinning management
   - File metadata handling

### Testing
1. **Service Tests**
   - Blockchain service tests
   - IPFS service tests
   - Integration tests
   - Error handling tests

## Project Structure
```
backend/
├── services/
│   ├── blockchainService.js
│   └── ipfsService.js
├── test/
│   ├── blockchainService.test.js
│   └── ipfsService.test.js
└── README.md
```

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Create `.env` file with required variables
   - Set up IPFS node configuration
   - Configure blockchain network settings
   - Set contract addresses

3. Run tests:
   ```bash
   npm test
   ```

## Dependencies
- ethers.js
- ipfs-http-client
- dotenv
- jest (for testing)
- web3.js

## Next Steps
- Implement additional security measures
- Add more comprehensive error handling
- Enhance testing coverage
- Add rate limiting
- Implement caching mechanisms
- Add monitoring and logging 