const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testUpload() {
    try {
        console.log('Testing dataset upload...');
        
        // Create a test file
        const testFilePath = path.join(__dirname, 'test.txt');
        fs.writeFileSync(testFilePath, 'This is a test file for dataset upload');
        
        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFilePath));
        formData.append('name', 'Test Dataset');
        formData.append('description', 'A test dataset for API testing');
        formData.append('licenseType', '0');
        formData.append('price', '1000000000000000000'); // 1 ETH in wei

        // Make the request
        const response = await axios.post('http://localhost:3000/api/datasets/upload', formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Upload successful!');
        console.log('Response:', response.data);

        // Clean up
        fs.unlinkSync(testFilePath);
        
    } catch (error) {
        console.error('Upload failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testUpload(); 