// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract IPFSUpload {

   mapping(string => string) public ipfsContent;

    mapping(address => string[]) public uploads;

    function uploadDataset(string memory datasetName, string memory cid) public {
        require(bytes(datasetName).length > 0, "Dataset name is required");
        require(bytes(cid).length > 0, "CID is required");

        ipfsContent[datasetName] = cid;
        uploads[msg.sender].push(datasetName);
    }

    function getUploadCount(address user) public view returns (uint) {
        return uploads[user].length;
    }

    function getUserDataset(address user, uint index) public view returns (string memory) {
        require(index < uploads[user].length, "Index out of bounds");
        return uploads[user][index];
    }
}
