// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DatasetRegistry is Ownable, ReentrancyGuard {
    struct Dataset {
        address owner;
        string ipfsCID;
        string title;
        string description;
        uint256 price;
        bool isLicensed;
        uint256 timestamp;
        string[] categories;
        bool isRevoked;
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
    mapping(uint256 => string[]) public datasetCategories;
    
    uint256 public datasetCount;
    IERC20 public token;

    // Events
    event DatasetUploaded(uint256 indexed id, address indexed owner, string ipfsCID);
    event LicenseGranted(uint256 indexed id, address indexed licensee);
    event LicenseRevoked(uint256 indexed id, address indexed licensee);
    event DatasetRevoked(uint256 indexed id, address indexed owner);
    event PriceUpdated(uint256 indexed id, uint256 newPrice);
    event CategoryAdded(uint256 indexed id, string category);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function registerDataset(
        string memory _ipfsCID,
        string memory _title,
        string memory _description,
        uint256 _price,
        string[] memory _categories
    ) external {
        uint256 id = datasetCount++;
        datasets[id] = Dataset({
            owner: msg.sender,
            ipfsCID: _ipfsCID,
            title: _title,
            description: _description,
            price: _price,
            isLicensed: false,
            timestamp: block.timestamp,
            categories: _categories,
            isRevoked: false
        });

        datasetCategories[id] = _categories;
        emit DatasetUploaded(id, msg.sender, _ipfsCID);
    }

    function updatePrice(uint256 _datasetId, uint256 _newPrice) external {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        require(datasets[_datasetId].owner == msg.sender, "Only owner can update price");
        datasets[_datasetId].price = _newPrice;
        emit PriceUpdated(_datasetId, _newPrice);
    }

    function purchaseLicense(uint256 _datasetId) external nonReentrant {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        Dataset storage dataset = datasets[_datasetId];
        require(dataset.owner != msg.sender, "Owner cannot purchase license");
        require(!licenses[msg.sender][_datasetId].active, "Already licensed");
        require(!dataset.isRevoked, "Dataset is revoked");

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

    function revokeDataset(uint256 _datasetId) external {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        require(datasets[_datasetId].owner == msg.sender, "Only owner can revoke dataset");
        datasets[_datasetId].isRevoked = true;
        emit DatasetRevoked(_datasetId, msg.sender);
    }

    function addCategory(uint256 _datasetId, string memory _category) external {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        require(datasets[_datasetId].owner == msg.sender, "Only owner can add categories");
        datasets[_datasetId].categories.push(_category);
        datasetCategories[_datasetId].push(_category);
        emit CategoryAdded(_datasetId, _category);
    }

    function getLicenseStatus(address _licensee, uint256 _datasetId)
        external
        view
        returns (bool)
    {
        return licenses[_licensee][_datasetId].active;
    }

    function getDatasetCategories(uint256 _datasetId)
        external
        view
        returns (string[] memory)
    {
        return datasetCategories[_datasetId];
    }

    function getDatasetLicensees(uint256 _datasetId)
        external
        view
        returns (address[] memory)
    {
        return datasetLicensees[_datasetId];
    }

    function getDatasetCount() external view returns (uint256) {
        return datasetCount;
    }
} 