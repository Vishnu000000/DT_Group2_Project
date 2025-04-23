const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DatasetManager", function () {
  let DatasetManager;
  let datasetManager;
  let owner;
  let addr1;
  let addr2;
  let token;

  beforeEach(async function () {
    // Deploy mock ERC20 token
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("Test Token", "TT", ethers.utils.parseEther("1000"));
    await token.deployed();

    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy DatasetManager
    DatasetManager = await ethers.getContractFactory("DatasetManager");
    datasetManager = await DatasetManager.deploy(token.address);
    await datasetManager.deployed();

    // Transfer tokens to test accounts
    await token.transfer(addr1.address, ethers.utils.parseEther("100"));
    await token.transfer(addr2.address, ethers.utils.parseEther("100"));
  });

  describe("Dataset Upload", function () {
    it("Should allow uploading a dataset", async function () {
      const cid = "QmTestCID";
      const name = "Test Dataset";
      const description = "Test Description";
      const licenseType = "MIT";
      const price = ethers.utils.parseEther("1");

      await expect(datasetManager.uploadDataset(cid, name, description, licenseType, price))
        .to.emit(datasetManager, "DatasetUploaded")
        .withArgs(0, owner.address, cid);

      const dataset = await datasetManager.datasets(0);
      expect(dataset.owner).to.equal(owner.address);
      expect(dataset.cid).to.equal(cid);
      expect(dataset.name).to.equal(name);
      expect(dataset.description).to.equal(description);
      expect(dataset.licenseType).to.equal(licenseType);
      expect(dataset.price).to.equal(price);
    });
  });

  describe("License Management", function () {
    beforeEach(async function () {
      // Upload a dataset first
      const cid = "QmTestCID";
      const name = "Test Dataset";
      const description = "Test Description";
      const licenseType = "MIT";
      const price = ethers.utils.parseEther("1");
      await datasetManager.uploadDataset(cid, name, description, licenseType, price);
    });

    it("Should allow purchasing a license", async function () {
      // Approve token transfer
      await token.connect(addr1).approve(datasetManager.address, ethers.utils.parseEther("1"));

      await expect(datasetManager.connect(addr1).purchaseLicense(0))
        .to.emit(datasetManager, "LicenseGranted")
        .withArgs(0, addr1.address);

      const license = await datasetManager.licenses(addr1.address, 0);
      expect(license.active).to.be.true;
    });

    it("Should not allow purchasing own dataset", async function () {
      await expect(datasetManager.purchaseLicense(0))
        .to.be.revertedWith("Owner cannot purchase license");
    });

    it("Should allow revoking a license", async function () {
      // Purchase license first
      await token.connect(addr1).approve(datasetManager.address, ethers.utils.parseEther("1"));
      await datasetManager.connect(addr1).purchaseLicense(0);

      await expect(datasetManager.revokeLicense(0, addr1.address))
        .to.emit(datasetManager, "LicenseRevoked")
        .withArgs(0, addr1.address);

      const license = await datasetManager.licenses(addr1.address, 0);
      expect(license.active).to.be.false;
    });
  });
}); 