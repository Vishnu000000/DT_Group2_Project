const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const DatasetManager = await ethers.getContractFactory("DatasetManager");
  const datasetManager = await DatasetManager.deploy("0x0000000000000000000000000000000000000000");
  
  console.log("DatasetManager address:", datasetManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 