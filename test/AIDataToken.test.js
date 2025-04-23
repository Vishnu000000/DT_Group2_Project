const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AIDataToken", function () {
  let AIDataToken;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy AIDataToken
    AIDataToken = await ethers.getContractFactory("AIDataToken");
    token = await AIDataToken.deploy("AI Data Token", "AIDT", ethers.utils.parseEther("1000000"));
    await token.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("AI Data Token");
      expect(await token.symbol()).to.equal("AIDT");
    });

    it("Should mint initial supply to owner", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000000"));
    });
  });

  describe("Faucet", function () {
    it("Should allow users to claim tokens once", async function () {
      const faucetAmount = ethers.utils.parseEther("100");
      
      await expect(token.connect(addr1).faucet())
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, faucetAmount);

      expect(await token.balanceOf(addr1.address)).to.equal(faucetAmount);
    });

    it("Should not allow users to claim tokens twice", async function () {
      await token.connect(addr1).faucet();
      await expect(token.connect(addr1).faucet())
        .to.be.revertedWith("Already claimed faucet");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      await expect(token.mint(addr1.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, amount);

      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const amount = ethers.utils.parseEther("1000");
      await expect(token.connect(addr1).mint(addr1.address, amount))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const amount = ethers.utils.parseEther("1000");
      await token.transfer(addr1.address, amount);

      await expect(token.connect(addr1).burn(amount))
        .to.emit(token, "Transfer")
        .withArgs(addr1.address, ethers.constants.AddressZero, amount);

      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should not allow users to burn more than they have", async function () {
      const amount = ethers.utils.parseEther("1000");
      await token.transfer(addr1.address, amount);

      await expect(token.connect(addr1).burn(amount.add(1)))
        .to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });
}); 