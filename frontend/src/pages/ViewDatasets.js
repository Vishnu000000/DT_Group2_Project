import React, { useState, useEffect } from 'react';
import { useHedera } from '../context/HederaContext';

function ViewDatasets() {
  const { account, client } = useHedera();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'

  useEffect(() => {
    fetchDatasets();
  }, [account, client]);

  const fetchDatasets = async () => {
    if (!client || !account) return;

    setLoading(true);
    setError('');

    try {
      const fetchedDatasets = await client.getAvailableDatasets();
      setDatasets(fetchedDatasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('Failed to fetch datasets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleDownload = async (dataset) => {
    if (!client || !account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      // Here you would implement the actual download logic
      // This would involve checking permissions, paying HBAR if required, etc.
      await client.downloadDataset(dataset.id);
      alert('Dataset downloaded successfully!');
    } catch (error) {
      console.error('Error downloading dataset:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'public') return matchesSearch && dataset.isPublic;
    if (filter === 'private') return matchesSearch && !dataset.isPublic;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900">Available Datasets</h2>
        
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Datasets</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading datasets...</p>
            </div>
          ) : filteredDatasets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No datasets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDatasets.map((dataset) => (
                <div key={dataset.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{dataset.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{dataset.description}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          Price: {dataset.price} HBAR
                        </span>
                        <span className="text-sm text-gray-500">
                          {dataset.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(dataset)}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewDatasets; 