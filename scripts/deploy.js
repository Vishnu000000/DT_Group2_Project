const hre = require("hardhat");

async function main() {
    const RegistryFactory = await hre.ethers.getContractFactory("TraindataRegistry");
    const registry = await RegistryFactory.deploy();

    await registry.waitForDeployment(); // ✅ Important: wait for the contract to finish deploying

    console.log("TraindataRegistry deployed to:", await registry.getAddress()); // ✅ Gets deployed address properly
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});