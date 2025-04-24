import React, { useState } from 'react';
import { useHedera } from '../context/HederaContext';
import DatasetRegistry from '../contracts/DatasetRegistry.json';

function UploadDataset() {
  const { account, client } = useHedera();
  const [formData, setFormData] = useState({
    files: [],
    price: '',
    isPublic: false,
    description: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cid, setCid] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };

  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!client || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (formData.files.length === 0) {
      setError('Please select at least one file or folder to upload');
      return;
    }

    if (!formData.name) {
      setError('Please enter a dataset name');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Here you would typically upload the files to IPFS or your preferred storage
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Simulate file upload and get CID
      const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15);
      setCid(mockCid);

      // Register the dataset with the CID
      await client.registerDataset(
        mockCid,
        formData.price,
        formData.isPublic,
        formData.name,
        formData.description
      );

      // Reset form and show success message
      setFormData({
        files: [],
        price: '',
        isPublic: false,
        description: '',
        name: ''
      });
      setCid('');
      alert('Dataset uploaded and registered successfully!');
    } catch (error) {
      console.error('Error uploading dataset:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900">Upload Dataset</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Dataset Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter dataset name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter dataset description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Files or Folder
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file"
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or</p>
                  <label
                    htmlFor="folder-upload"
                    className="ml-2 relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload folder</span>
                    <input
                      id="folder-upload"
                      name="folder"
                      type="file"
                      webkitdirectory="true"
                      directory="true"
                      className="sr-only"
                      onChange={handleFolderChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">CSV, JSON, TXT, or any data files up to 100MB total</p>
              </div>
            </div>
            
            {formData.files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Selected Files:</h3>
                <ul className="mt-2 divide-y divide-gray-200">
                  {formData.files.map((file, index) => (
                    <li key={index} className="py-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {cid && (
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">CID: {cid}</p>
            </div>
          )}

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
              {loading ? 'Uploading...' : 'Upload Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDataset; 