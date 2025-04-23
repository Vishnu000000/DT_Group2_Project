import axios from 'axios';
import { ethers } from 'ethers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class BlockchainService {
  constructor(library) {
    this.library = library;
    this.contract = null;
    console.log('Initializing BlockchainService with API URL:', API_BASE_URL);
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.provider = null;
    this.signer = null;
  }

  async initialize(signer) {
    this.signer = signer;
    this.provider = signer.provider;
    return this;
  }

  // Dataset Management
  async uploadDataset(file, name, description, licenseType, price) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('licenseType', licenseType);
      formData.append('price', price);

      const response = await this.api.post('/api/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading dataset:', error);
      throw error;
    }
  }

  async getDataset(datasetId) {
    try {
      const response = await this.api.get(`/api/datasets/${datasetId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting dataset:', error);
      throw error;
    }
  }

  async getDatasets() {
    try {
      console.log('Fetching all datasets...');
      const count = await this.getDatasetCount();
      console.log('Total datasets:', count);
      
      const datasets = [];
      for (let i = 0; i < count; i++) {
        try {
          console.log(`Fetching dataset ${i}...`);
          const dataset = await this.getDataset(i);
          if (dataset) {
            datasets.push({
              id: i,
              ...dataset
            });
          }
        } catch (error) {
          console.error(`Error fetching dataset ${i}:`, error);
        }
      }
      
      console.log('Fetched datasets:', datasets);
      return datasets;
    } catch (error) {
      console.error('Error getting datasets:', error);
      throw error;
    }
  }

  async getDatasetCount() {
    try {
      console.log('Getting dataset count from:', `${API_BASE_URL}/api/datasets/count`);
      const response = await this.api.get('/api/datasets/count');
      console.log('Dataset count response:', response.data);
      return response.data.count;
    } catch (error) {
      console.error('Error getting dataset count:', error);
      throw error;
    }
  }

  // License Management
  async purchaseLicense(datasetId) {
    try {
      const response = await this.api.post(`/api/datasets/purchase/${datasetId}`);
      return response.data;
    } catch (error) {
      console.error('Error purchasing license:', error);
      throw error;
    }
  }

  async getLicenseStatus(datasetId) {
    try {
      const response = await this.api.get(`/api/datasets/${datasetId}/license`);
      return response.data;
    } catch (error) {
      console.error('Error getting license status:', error);
      throw error;
    }
  }

  async getGDPRStatus(datasetId) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const status = await this.contract.getGDPRStatus(datasetId);
      return {
        isCompliant: status.isCompliant,
        hasConsent: status.hasConsent,
        dataSubjectRights: status.dataSubjectRights
      };
    } catch (error) {
      console.error('Error getting GDPR status:', error);
      throw error;
    }
  }

  async updateGDPRConsent(datasetId, consent) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.updateGDPRConsent(datasetId, consent);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error updating GDPR consent:', error);
      throw error;
    }
  }

  async getAuditHistory(datasetId) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const history = await this.contract.getAuditHistory(datasetId);
      return history.map(entry => ({
        auditor: entry.auditor,
        timestamp: entry.timestamp.toNumber() * 1000,
        passed: entry.passed,
        notes: entry.notes
      }));
    } catch (error) {
      console.error('Error getting audit history:', error);
      throw error;
    }
  }

  async performAudit(datasetId, notes, passed) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.performAudit(datasetId, notes, passed);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('Error performing audit:', error);
      throw error;
    }
  }

  async getAuditTrails() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const trails = await this.contract.getAuditTrails();
      return trails.map(trail => ({
        datasetId: trail.datasetId,
        datasetName: trail.datasetName,
        auditor: trail.auditor,
        timestamp: trail.timestamp.toNumber() * 1000,
        passed: trail.passed,
        notes: trail.notes
      }));
    } catch (error) {
      console.error('Error getting audit trails:', error);
      throw error;
    }
  }
}

export default BlockchainService; 