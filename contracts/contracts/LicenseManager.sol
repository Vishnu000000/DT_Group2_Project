// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./DatasetToken.sol";
import "./DatasetRegistry.sol";

contract LicenseManager is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    DatasetToken public token;
    DatasetRegistry public registry;
    uint256 public platformFee; // in basis points (1% = 100)

    struct License {
        address licensee;
        string datasetCid;
        uint256 purchaseTimestamp;
        uint256 expirationTimestamp;
        bool isActive;
    }

    mapping(bytes32 => License) public licenses;
    mapping(address => bytes32[]) public userLicenses;
    mapping(address => mapping(string => bytes32)) public userDatasetLicenses;

    event LicenseGranted(
        bytes32 indexed licenseId,
        address indexed licensee,
        string datasetCid,
        string name,
        string description,
        uint256 expirationTimestamp
    );
    event LicenseRevoked(bytes32 indexed licenseId);
    event LicenseRenewed(bytes32 indexed licenseId, uint256 newExpirationTimestamp);
    event PlatformFeeUpdated(uint256 newFee);

    constructor(
        address _token,
        address _registry,
        uint256 _platformFee
    ) {
        require(_token != address(0), "Invalid token address");
        require(_registry != address(0), "Invalid registry address");
        require(_platformFee <= 1000, "Fee cannot exceed 10%");

        token = DatasetToken(_token);
        registry = DatasetRegistry(_registry);
        platformFee = _platformFee;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(COMPLIANCE_ROLE, msg.sender);
    }

    function setPlatformFee(uint256 _platformFee) external onlyRole(ADMIN_ROLE) {
        require(_platformFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _platformFee;
        emit PlatformFeeUpdated(_platformFee);
    }

    function purchaseLicense(string memory datasetCid) external whenNotPaused {
        // Get dataset info first
        (
            address owner,
            string memory cid,
            string memory name,
            string memory description,
            uint256 price,
            bool isPublic,
            bool isRemoved,
            uint256 uploadTimestamp
        ) = registry.getDatasetInfo(datasetCid);
        
        require(!isPublic, "Dataset is public, no license needed");
        require(!isRemoved, "Dataset is removed");
        require(price > 0, "Dataset price must be greater than 0");

        // Check if license already exists
        bytes32 existingLicenseId = userDatasetLicenses[msg.sender][datasetCid];
        require(existingLicenseId == bytes32(0) || !licenses[existingLicenseId].isActive, "License already active");

        uint256 feeAmount = (price * platformFee) / 10000;
        uint256 ownerAmount = price - feeAmount;

        // Check token allowance
        require(token.allowance(msg.sender, address(this)) >= price, "Insufficient token allowance");

        // Transfer tokens
        require(token.transferFrom(msg.sender, address(this), price), "Token transfer failed");
        require(token.transfer(owner, ownerAmount), "Owner payment failed");
        if (feeAmount > 0) {
            require(token.transfer(address(this), feeAmount), "Fee transfer failed");
        }

        // Grant license
        uint256 purchaseTimestamp = block.timestamp;
        bytes32 licenseId = keccak256(abi.encodePacked(msg.sender, datasetCid, purchaseTimestamp));
        uint256 expirationTimestamp = purchaseTimestamp + 365 days; // 1 year license

        licenses[licenseId] = License({
            licensee: msg.sender,
            datasetCid: datasetCid,
            purchaseTimestamp: purchaseTimestamp,
            expirationTimestamp: expirationTimestamp,
            isActive: true
        });

        userLicenses[msg.sender].push(licenseId);
        userDatasetLicenses[msg.sender][datasetCid] = licenseId;
        emit LicenseGranted(licenseId, msg.sender, datasetCid, name, description, expirationTimestamp);
    }

    function revokeLicense(string memory datasetCid, address licensee) external onlyRole(COMPLIANCE_ROLE) whenNotPaused {
        bytes32 licenseId = userDatasetLicenses[licensee][datasetCid];
        require(licenseId != bytes32(0), "License does not exist");
        require(licenses[licenseId].isActive, "License is not active");
        licenses[licenseId].isActive = false;
        emit LicenseRevoked(licenseId);
    }

    function isValidLicense(bytes32 licenseId) external view returns (bool) {
        require(licenses[licenseId].licensee != address(0), "License does not exist");
        License memory license = licenses[licenseId];
        return license.isActive && block.timestamp < license.expirationTimestamp;
    }

    function getUserLicenses(address user) external view returns (bytes32[] memory) {
        return userLicenses[user];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
