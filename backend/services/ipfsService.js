const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');

class IPFSService {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    async uploadFile(fileBuffer) {
        try {
            const formData = new FormData();
            const stream = Readable.from(fileBuffer);
            
            formData.append('file', stream, {
                filename: 'dataset-file',
                contentType: 'application/octet-stream'
            });

            // Use the direct upload endpoint instead of pinning
            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.apiSecret
                },
                maxBodyLength: Infinity,
                params: {
                    wrapWithDirectory: false,
                    cidVersion: 0
                }
            });

            console.log('File uploaded to IPFS with CID:', response.data.IpfsHash);
            return response.data.IpfsHash;
        } catch (error) {
            if (error.response?.data?.error?.reason === 'PAID_FEATURE_ONLY') {
                console.error('Error: Pinning is a paid feature. Using alternative upload method...');
                // If pinning fails, try using the regular IPFS add endpoint
                const formData = new FormData();
                const stream = Readable.from(fileBuffer);
                
                formData.append('file', stream, {
                    filename: 'dataset-file',
                    contentType: 'application/octet-stream'
                });

                const response = await axios.post('https://api.pinata.cloud/api/v1/add', formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.apiSecret
                    },
                    maxBodyLength: Infinity
                });

                console.log('File uploaded to IPFS with CID:', response.data.IpfsHash);
                return response.data.IpfsHash;
            }
            console.error('Error uploading file to IPFS:', error);
            throw error;
        }
    }

    async getFile(cid) {
        try {
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            console.error('Error retrieving file from IPFS:', error);
            throw error;
        }
    }
}

module.exports = IPFSService; 