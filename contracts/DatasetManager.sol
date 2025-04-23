// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DatasetManager is Ownable, ReentrancyGuard {
    struct Dataset {
        address owner;
        string cid;
        string name;
        string description;
        string licenseType;
        uint256 price;
        uint256 timestamp;
    }

    struct License {
        address licensee;
        uint256 datasetId;
        uint256 timestamp;
        bool active;
    }

    // State variables
    mapping(uint256 => Dataset) public datasets;
    mapping(address => mapping(uint256 => License)) public licenses;
    mapping(uint256 => address[]) public datasetLicensees;
    
    uint256 public datasetCount;
    IERC20 public token;

    // Events
    event DatasetUploaded(uint256 indexed id, address indexed owner, string cid);
    event LicenseGranted(uint256 indexed id, address indexed licensee);
    event LicenseRevoked(uint256 indexed id, address indexed licensee);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function uploadDataset(
        string memory _cid,
        string memory _name,
        string memory _description,
        string memory _licenseType,
        uint256 _price
    ) external {
        uint256 id = datasetCount++;
        datasets[id] = Dataset({
            owner: msg.sender,
            cid: _cid,
            name: _name,
            description: _description,
            licenseType: _licenseType,
            price: _price,
            timestamp: block.timestamp
        });

        emit DatasetUploaded(id, msg.sender, _cid);
    }

    function purchaseLicense(uint256 _datasetId) external nonReentrant {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        Dataset storage dataset = datasets[_datasetId];
        require(dataset.owner != msg.sender, "Owner cannot purchase license");
        require(!licenses[msg.sender][_datasetId].active, "Already licensed");

        // Transfer tokens from licensee to owner
        require(
            token.transferFrom(msg.sender, dataset.owner, dataset.price),
            "Token transfer failed"
        );

        // Create license
        licenses[msg.sender][_datasetId] = License({
            licensee: msg.sender,
            datasetId: _datasetId,
            timestamp: block.timestamp,
            active: true
        });

        datasetLicensees[_datasetId].push(msg.sender);
        emit LicenseGranted(_datasetId, msg.sender);
    }

    function revokeLicense(uint256 _datasetId, address _licensee) external {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        require(
            datasets[_datasetId].owner == msg.sender,
            "Only owner can revoke licenses"
        );
        require(
            licenses[_licensee][_datasetId].active,
            "License not active"
        );

        licenses[_licensee][_datasetId].active = false;
        emit LicenseRevoked(_datasetId, _licensee);
    }

    function getLicenseStatus(address _licensee, uint256 _datasetId)
        external
        view
        returns (bool)
    {
        return licenses[_licensee][_datasetId].active;
    }

    function getProvenance(uint256 _datasetId)
        external
        view
        returns (
            address owner,
            uint256 timestamp,
            string memory cid
        )
    {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        Dataset storage dataset = datasets[_datasetId];
        return (dataset.owner, dataset.timestamp, dataset.cid);
    }

    function getDatasetLicensees(uint256 _datasetId)
        external
        view
        returns (address[] memory)
    {
        return datasetLicensees[_datasetId];
    }
} 