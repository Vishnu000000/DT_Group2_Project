const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Create form data
    const form = new FormData();
    
    // Read file as buffer
    const fileBuffer = fs.readFileSync('./test-dataset.txt');
    
    // Append file buffer with filename
    form.append('file', fileBuffer, {
      filename: 'test-dataset.txt',
      contentType: 'text/plain'
    });
    
    // Add other fields
    form.append('name', 'Test Dataset');
    form.append('description', 'Test Description');
    form.append('licenseType', '0');
    form.append('price', '1000000000000000000');

    console.log('Sending request...');
    
    const response = await axios.post('http://localhost:3000/api/datasets/upload', form, {
      headers: {
        ...form.getHeaders(),
        'Content-Length': form.getLengthSync()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testUpload(); 