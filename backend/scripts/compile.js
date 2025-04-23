const fs = require('fs');
const path = require('path');
const solc = require('solc');

console.log('\n=== Contract Compilation Started ===');

// Function to find imports
function findImports(importPath) {
    console.log('Resolving import:', importPath);
    try {
        // Handle OpenZeppelin imports
        if (importPath.startsWith('@openzeppelin/')) {
            const openZeppelinPath = path.resolve(
                __dirname,
                '../node_modules/@openzeppelin/contracts',
                importPath.replace('@openzeppelin/contracts/', '')
            );
            console.log('Found OpenZeppelin import at:', openZeppelinPath);
            return { contents: fs.readFileSync(openZeppelinPath, 'utf8') };
        }
        console.error('Import not found:', importPath);
        return { error: 'File not found' };
    } catch (e) {
        console.error('Error resolving import:', e.message);
        return { error: e.message };
    }
}

// Read the contract source
const contractPath = path.resolve(__dirname, '../../contracts/DatasetManager.sol');
console.log('Reading contract from:', contractPath);

if (!fs.existsSync(contractPath)) {
    console.error('Contract file not found at:', contractPath);
    process.exit(1);
}

const source = fs.readFileSync(contractPath, 'utf8');
console.log('Contract source read successfully');

// Compile the contract
console.log('Starting compilation...');
const input = {
    language: 'Solidity',
    sources: {
        'DatasetManager.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

try {
    console.log('Running solc compiler...');
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    // Check for compilation errors
    if (output.errors) {
        console.error('\nCompilation errors:');
        output.errors.forEach(error => {
            if (error.severity === 'error') {
                console.error('Error:', error.formattedMessage);
            } else {
                console.warn('Warning:', error.formattedMessage);
            }
        });
        
        // Exit if there are errors
        if (output.errors.some(error => error.severity === 'error')) {
            process.exit(1);
        }
    }

    // Check if compilation was successful
    if (!output.contracts || !output.contracts['DatasetManager.sol'] || !output.contracts['DatasetManager.sol'].DatasetManager) {
        console.error('Compilation failed - no contract output found');
        console.error('Output structure:', JSON.stringify(output, null, 2));
        process.exit(1);
    }

    const compiledContract = output.contracts['DatasetManager.sol'].DatasetManager;

    // Ensure artifacts directory exists
    const artifactsDir = path.join(__dirname, '../../artifacts/contracts/DatasetManager.sol');
    if (!fs.existsSync(artifactsDir)) {
        console.log('Creating artifacts directory:', artifactsDir);
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    // Write the compiled output
    const outputPath = path.join(artifactsDir, 'DatasetManager.json');
    console.log('Writing compiled output to:', outputPath);
    
    fs.writeFileSync(outputPath, JSON.stringify(compiledContract, null, 2));
    console.log('Compilation completed successfully!');
    
    // Verify the output
    console.log('\nVerification:');
    console.log('- Contract name:', compiledContract.contractName);
    console.log('- ABI length:', compiledContract.abi ? compiledContract.abi.length : 'undefined');
    console.log('- Bytecode:', compiledContract.evm ? 'present' : 'missing');
    if (compiledContract.evm && compiledContract.evm.bytecode) {
        console.log('- Bytecode length:', compiledContract.evm.bytecode.object.length);
    }
    
} catch (error) {
    console.error('Compilation failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
} 