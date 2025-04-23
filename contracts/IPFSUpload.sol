// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IPFSUpload is Ownable {
    struct Upload {
        string datasetName;
        string cid;
        uint256 timestamp;
    }

    mapping(string => Upload) public ipfsContent;
    mapping(address => string[]) public uploads;
    mapping(address => uint256) public uploadCounts;

    event DatasetUploaded(address indexed uploader, string datasetName, string cid);

    function uploadDataset(string memory datasetName, string memory cid) public {
        require(bytes(datasetName).length > 0, "Dataset name is required");
        require(bytes(cid).length > 0, "CID is required");

        ipfsContent[datasetName] = Upload({
            datasetName: datasetName,
            cid: cid,
            timestamp: block.timestamp
        });
        
        uploads[msg.sender].push(datasetName);
        uploadCounts[msg.sender]++;
        
        emit DatasetUploaded(msg.sender, datasetName, cid);
    }

    function getUploadCount(address user) public view returns (uint256) {
        return uploadCounts[user];
    }

    function getUserDataset(address user, uint256 index) public view returns (string memory) {
        require(index < uploads[user].length, "Index out of bounds");
        return uploads[user][index];
    }

    function getUploadDetails(string memory datasetName) public view returns (Upload memory) {
        return ipfsContent[datasetName];
    }
} 