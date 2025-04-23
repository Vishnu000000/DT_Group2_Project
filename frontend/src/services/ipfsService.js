import axios from 'axios';
import FormData from 'form-data';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class IPFSService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.api.post('/ipfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.cid;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  async uploadJSON(data) {
    try {
      const response = await this.api.post('/ipfs/upload-json', data);
      return response.data.cid;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw error;
    }
  }

  async getFile(cid) {
    try {
      const response = await this.api.get(`/ipfs/file/${cid}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file from IPFS:', error);
      throw error;
    }
  }

  async getJSON(cid) {
    try {
      const data = await this.getFile(cid);
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error('Error getting JSON:', error);
      throw new Error(`Failed to get JSON: ${error.message}`);
    }
  }

  async unpinFile(cid) {
    if (!cid) {
      throw new Error('No CID provided for unpinning');
    }

    try {
      await axios.delete(
        `${this.baseURL}/pinning/unpin/${cid}`,
        this.getHeaders()
      );
      console.log('File unpinned from Pinata:', cid);
      return true;
    } catch (error) {
      console.error('Error unpinning file from Pinata:', error);
      if (error.response) {
        throw new Error(`Failed to unpin file: ${error.response.data.error}`);
      }
      throw error;
    }
  }
}

export default new IPFSService(); 