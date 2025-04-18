const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Read API keys from secret.json
const { API_KEY, API_SECRET } = JSON.parse(fs.readFileSync('./secret.json', 'utf8'));

async function uploadFileToPinata(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  try {
    const res = await axios.post(url, data, {
      maxContentLength: Infinity,
      headers: {
        ...data.getHeaders(),
        pinata_api_key: API_KEY,
        pinata_secret_api_key: API_SECRET,
      },
    });

    console.log("File uploaded to IPFS:");
    console.log("CID:", res.data.IpfsHash);
    console.log("Gateway URL:", `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
  } catch (error) {
    console.error("sUpload failed:", error.message);
  }
}


uploadFileToPinata('./sample.jpeg');
