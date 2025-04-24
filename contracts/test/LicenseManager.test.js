const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LicenseManager", function () {
  let DatasetToken;
  let DatasetRegistry;
  let LicenseManager;
  let token;
  let registry;
  let licenseManager;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy DatasetToken
    DatasetToken = await ethers.getContractFactory("DatasetToken");
    token = await DatasetToken.deploy("AI Dataset Token", "AIDT", ethers.utils.parseEther("1000000"));
    await token.deployed();

    // Deploy DatasetRegistry
    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    registry = await DatasetRegistry.deploy();
    await registry.deployed();

    // Deploy LicenseManager
    LicenseManager = await ethers.getContractFactory("LicenseManager");
    licenseManager = await LicenseManager.deploy(
      token.address,
      registry.address,
      100 // 1% platform fee
    );
    await licenseManager.deployed();

    // Register a private dataset
    await registry.registerDataset(
      "QmTestCID",
      ethers.utils.parseEther("1.0"),
      false // private
    );

    // Mint tokens to addr1
    await token.mint(addr1.address, ethers.utils.parseEther("2.0"));

    // Approve license manager to spend tokens
    await token.connect(addr1).approve(licenseManager.address, ethers.utils.parseEther("2.0"));

    // Grant COMPLIANCE_ROLE to owner
    const complianceRole = await licenseManager.COMPLIANCE_ROLE();
    await licenseManager.grantRole(complianceRole, owner.address);
  });

  describe("License Purchase", function () {
    it("Should purchase license successfully", async function () {
      const cid = "QmTestCID";
      const tx = await licenseManager.connect(addr1).purchaseLicense(cid);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      // Calculate license ID using the same method as the contract
      const licenseId = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "string", "uint256"],
          [addr1.address, cid, block.timestamp]
        )
      );
      
      await expect(tx)
        .to.emit(licenseManager, "LicenseGranted")
        .withArgs(licenseId, addr1.address, cid, block.timestamp + 365 * 24 * 60 * 60);
      
      const license = await licenseManager.licenses(licenseId);
      expect(license.isActive).to.be.true;
      expect(license.expirationTimestamp).to.be.gt(0);
    });

    it("Should not allow purchasing license for public dataset", async function () {
      // Register a public dataset
      await registry.registerDataset(
        "QmPublicCID",
        ethers.utils.parseEther("1.0"),
        true // public
      );
      
      // Try to purchase license for public dataset
      await expect(licenseManager.connect(addr1).purchaseLicense("QmPublicCID"))
        .to.be.revertedWith("Dataset is public, no license needed");
    });

    it("Should not allow purchasing license twice", async function () {
      const cid = "QmTestCID";
      
      // First purchase
      await licenseManager.connect(addr1).purchaseLicense(cid);
      
      // Try to purchase again
      await expect(licenseManager.connect(addr1).purchaseLicense(cid))
        .to.be.revertedWith("License already active");
    });

    it("Should revoke license successfully", async function () {
      const cid = "QmTestCID";
      
      // Purchase license
      const tx = await licenseManager.connect(addr1).purchaseLicense(cid);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      // Calculate license ID using the same method as the contract
      const licenseId = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "string", "uint256"],
          [addr1.address, cid, block.timestamp]
        )
      );
      
      // Revoke license
      await expect(licenseManager.revokeLicense(cid, addr1.address))
        .to.emit(licenseManager, "LicenseRevoked")
        .withArgs(licenseId);
      
      const license = await licenseManager.licenses(licenseId);
      expect(license.isActive).to.be.false;
    });
  });

  describe("License Revocation", function () {
    it("Should revoke license by compliance role", async function () {
      const cid = "QmTestCID";
      
      // Purchase license
      const tx = await licenseManager.connect(addr1).purchaseLicense(cid);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      // Calculate license ID using the same method as the contract
      const licenseId = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "string", "uint256"],
          [addr1.address, cid, block.timestamp]
        )
      );
      
      // Revoke license
      await licenseManager.revokeLicense(cid, addr1.address);
      const license = await licenseManager.licenses(licenseId);
      expect(license.isActive).to.be.false;
    });

    it("Should not allow non-compliance role to revoke license", async function () {
      const cid = "QmTestCID";
      
      // Purchase license
      await licenseManager.connect(addr1).purchaseLicense(cid);
      
      const complianceRole = await licenseManager.COMPLIANCE_ROLE();
      await expect(licenseManager.connect(addr1).revokeLicense(cid, addr1.address))
        .to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${complianceRole.toLowerCase()}`);
    });
  });

  describe("Platform Fee", function () {
    it("Should update platform fee by admin", async function () {
      await licenseManager.setPlatformFee(200); // 2%
      expect(await licenseManager.platformFee()).to.equal(200);
    });

    it("Should not allow non-admin to update platform fee", async function () {
      const adminRole = await licenseManager.ADMIN_ROLE();
      await expect(licenseManager.connect(addr1).setPlatformFee(200))
        .to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${adminRole.toLowerCase()}`);
    });

    it("Should not allow fee above 10%", async function () {
      await expect(licenseManager.setPlatformFee(1001))
        .to.be.revertedWith("Fee cannot exceed 10%");
    });
  });
}); 