const hre = require("hardhat");
const path = require('path');
const fs = require('fs');

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    // Get balance using provider
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", balance.toString());

    const DatasetManager = await hre.ethers.getContractFactory("DatasetManager");
    console.log("Deploying DatasetManager...");
    const datasetManager = await DatasetManager.deploy("0x0000000000000000000000000000000000000000");
    
    console.log("Waiting for deployment transaction to be mined...");
    // Wait for the transaction to be mined
    await datasetManager.waitForDeployment();
    
    // Get the deployed contract address
    const deployedAddress = await datasetManager.getAddress();
    
    if (!deployedAddress) {
      throw new Error("Contract deployment failed - no contract address returned");
    }

    console.log("DatasetManager deployed to:", deployedAddress);

    // Save the contract address
    const contractData = {
      address: deployedAddress,
      network: hre.network.name
    };

    console.log("Saving contract data:", contractData);

    // Save to root directory
    const rootPath = path.join(__dirname, '..', 'contract-address.json');
    fs.writeFileSync(rootPath, JSON.stringify(contractData, null, 2));
    console.log("Saved contract address to:", rootPath);

    // Save to backend directory
    const backendPath = path.join(__dirname, '..', 'backend', 'contract-address.json');
    fs.mkdirSync(path.dirname(backendPath), { recursive: true });
    fs.writeFileSync(backendPath, JSON.stringify(contractData, null, 2));
    console.log("Saved contract address to:", backendPath);

  } catch (error) {
    console.error("Deployment failed with error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });