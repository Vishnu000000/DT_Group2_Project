import React, { useState } from 'react';
import { useHedera } from '../context/HederaContext';
import DatasetRegistry from '../contracts/DatasetRegistry.json';

function UploadDataset() {
  const { account, client } = useHedera();
  const [formData, setFormData] = useState({
    cid: '',
    price: '',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await client.registerDataset(
        formData.cid,
        formData.price,
        formData.isPublic
      );
      // Reset form and show success message
      setFormData({ cid: '', price: '', isPublic: false });
      alert('Dataset registered successfully!');
    } catch (error) {
      console.error('Error registering dataset:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900">Upload Dataset</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="cid" className="block text-sm font-medium text-gray-700">
              Dataset CID
            </label>
            <input
              type="text"
              name="cid"
              id="cid"
              value={formData.cid}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter IPFS CID"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (HBAR)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.0001"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter price in HBAR"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              id="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
              Make dataset public
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? 'Registering...' : 'Register Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDataset; 