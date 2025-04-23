const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DatasetRegistry", function () {
  let AIDataToken;
  let DatasetRegistry;
  let token;
  let registry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy AIDataToken
    AIDataToken = await ethers.getContractFactory("AIDataToken");
    token = await AIDataToken.deploy("AI Data Token", "AIDT", ethers.utils.parseEther("1000000"));
    await token.deployed();

    // Deploy DatasetRegistry
    DatasetRegistry = await ethers.getContractFactory("DatasetRegistry");
    registry = await DatasetRegistry.deploy(token.address);
    await registry.deployed();

    // Transfer tokens to test accounts
    await token.transfer(addr1.address, ethers.utils.parseEther("100"));
    await token.transfer(addr2.address, ethers.utils.parseEther("100"));
  });

  describe("Dataset Registration", function () {
    it("Should allow registering a dataset", async function () {
      const ipfsCID = "QmTestCID";
      const title = "Test Dataset";
      const description = "Test Description";
      const price = ethers.utils.parseEther("1");
      const categories = ["AI", "Machine Learning"];

      await expect(registry.registerDataset(ipfsCID, title, description, price, categories))
        .to.emit(registry, "DatasetUploaded")
        .withArgs(0, owner.address, ipfsCID);

      const dataset = await registry.datasets(0);
      expect(dataset.owner).to.equal(owner.address);
      expect(dataset.ipfsCID).to.equal(ipfsCID);
      expect(dataset.title).to.equal(title);
      expect(dataset.description).to.equal(description);
      expect(dataset.price).to.equal(price);
    });
  });

  describe("License Management", function () {
    beforeEach(async function () {
      // Register a dataset first
      const ipfsCID = "QmTestCID";
      const title = "Test Dataset";
      const description = "Test Description";
      const price = ethers.utils.parseEther("1");
      const categories = ["AI", "Machine Learning"];
      await registry.registerDataset(ipfsCID, title, description, price, categories);
    });

    it("Should allow purchasing a license", async function () {
      // Approve token transfer
      await token.connect(addr1).approve(registry.address, ethers.utils.parseEther("1"));

      await expect(registry.connect(addr1).purchaseLicense(0))
        .to.emit(registry, "LicenseGranted")
        .withArgs(0, addr1.address);

      const license = await registry.licenses(addr1.address, 0);
      expect(license.active).to.be.true;
    });

    it("Should not allow purchasing own dataset", async function () {
      await expect(registry.purchaseLicense(0))
        .to.be.revertedWith("Owner cannot purchase license");
    });

    it("Should allow revoking a license", async function () {
      // Purchase license first
      await token.connect(addr1).approve(registry.address, ethers.utils.parseEther("1"));
      await registry.connect(addr1).purchaseLicense(0);

      await expect(registry.revokeLicense(0, addr1.address))
        .to.emit(registry, "LicenseRevoked")
        .withArgs(0, addr1.address);

      const license = await registry.licenses(addr1.address, 0);
      expect(license.active).to.be.false;
    });
  });

  describe("Dataset Management", function () {
    beforeEach(async function () {
      // Register a dataset first
      const ipfsCID = "QmTestCID";
      const title = "Test Dataset";
      const description = "Test Description";
      const price = ethers.utils.parseEther("1");
      const categories = ["AI", "Machine Learning"];
      await registry.registerDataset(ipfsCID, title, description, price, categories);
    });

    it("Should allow updating price", async function () {
      const newPrice = ethers.utils.parseEther("2");
      await expect(registry.updatePrice(0, newPrice))
        .to.emit(registry, "PriceUpdated")
        .withArgs(0, newPrice);

      const dataset = await registry.datasets(0);
      expect(dataset.price).to.equal(newPrice);
    });

    it("Should allow adding categories", async function () {
      const newCategory = "Deep Learning";
      await expect(registry.addCategory(0, newCategory))
        .to.emit(registry, "CategoryAdded")
        .withArgs(0, newCategory);

      const categories = await registry.getDatasetCategories(0);
      expect(categories).to.include(newCategory);
    });

    it("Should allow revoking dataset", async function () {
      await expect(registry.revokeDataset(0))
        .to.emit(registry, "DatasetRevoked")
        .withArgs(0, owner.address);

      const dataset = await registry.datasets(0);
      expect(dataset.isRevoked).to.be.true;
    });
  });
}); 