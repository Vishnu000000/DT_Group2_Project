# Smart Contract Development Guide

## Contract Overview

### DatasetManager.sol
The main contract that handles dataset management, licensing, and payments. It implements:
- Dataset upload and metadata storage
- License management with ERC20 token payments
- Provenance tracking
- Access control and security features

### TraindataRegistry.sol
A simpler registry contract that provides basic functionality for:
- Dataset registration
- IPFS CID storage
- Basic licensing
- Metadata management

## Development Environment Setup

1. Install Hardhat:
```bash
npm install --save-dev hardhat
```

2. Initialize Hardhat project:
```bash
npx hardhat
```

3. Install dependencies:
```bash
npm install @openzeppelin/contracts
```

## Compilation and Testing

1. Compile contracts:
```bash
npx hardhat compile
```

2. Run tests:
```bash
npx hardhat test
```

## Deployment

1. Configure network in hardhat.config.js:
```javascript
module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    testnet: {
      url: "YOUR_TESTNET_RPC_URL",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  }
};
```

2. Deploy to network:
```bash
npx hardhat run scripts/deploy.js --network testnet
```

## Security Best Practices

1. Access Control:
- Use OpenZeppelin's Ownable for ownership
- Implement proper role-based access
- Restrict sensitive functions

2. Reentrancy Protection:
- Use ReentrancyGuard
- Follow checks-effects-interactions
- Validate state changes

3. Input Validation:
- Validate all user inputs
- Use require statements
- Implement proper error messages

## Gas Optimization Tips

1. Storage:
- Use appropriate data types
- Minimize storage operations
- Use mappings instead of arrays where possible

2. Functions:
- Use view/pure where possible
- Optimize loop operations
- Implement batch operations

## Testing Guidelines

1. Unit Tests:
- Test all functions
- Cover edge cases
- Verify access control
- Test error conditions

2. Integration Tests:
- Test contract interactions
- Verify token transfers
- Check event emissions

## Documentation

1. NatSpec Comments:
```solidity
/// @title Contract Title
/// @author Author Name
/// @notice Brief description
/// @dev Detailed technical description
```

2. Events:
- Document all events
- Include parameter descriptions
- Explain when events are emitted

## Version Control

1. Branching:
- main: Production code
- develop: Development branch
- feature/*: New features
- fix/*: Bug fixes

2. Commit Messages:
- Use conventional commits
- Be descriptive
- Reference issues

## Troubleshooting

Common issues and solutions:

1. Compilation Errors:
- Check Solidity version
- Verify imports
- Check OpenZeppelin version

2. Deployment Issues:
- Verify network configuration
- Check gas limits
- Validate constructor parameters

3. Testing Problems:
- Check test environment
- Verify test accounts
- Review test parameters 