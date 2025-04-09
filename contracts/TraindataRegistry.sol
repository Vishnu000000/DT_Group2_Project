// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TraindataRegistry {
    struct Dataset {
        address owner;
        string ipfsCID;
        string metadata;
        bool isLicensed;
    }

    uint256 public datasetCount;
    mapping(uint256 => Dataset) public datasets;

    event DatasetUploaded(uint256 datasetId, address indexed owner, string ipfsCID, string metadata);
    event DatasetLicensed(uint256 datasetId, address indexed licensedTo);

    function uploadDataset(string memory _ipfsCID, string memory _metadata) public {
        datasets[datasetCount] = Dataset(msg.sender, _ipfsCID, _metadata, false);
        emit DatasetUploaded(datasetCount, msg.sender, _ipfsCID, _metadata);
        datasetCount++;
    }

    function licenseDataset(uint256 _datasetId) public {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        require(!datasets[_datasetId].isLicensed, "Already licensed");

        datasets[_datasetId].isLicensed = true;
        emit DatasetLicensed(_datasetId, msg.sender);
    }

    function getDataset(uint256 _datasetId) public view returns (address, string memory, string memory, bool) {
        require(_datasetId < datasetCount, "Invalid dataset ID");
        Dataset memory d = datasets[_datasetId];
        return (d.owner, d.ipfsCID, d.metadata, d.isLicensed);
    }
}
