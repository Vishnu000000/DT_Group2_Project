import React, { useState, useEffect } from 'react';
import { useHedera } from '../context/HederaContext';
import { ethers } from 'ethers'; // Make sure to import ethers if needed

function ViewDatasets() {
  const { account, contract } = useHedera();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'

  // Function to fetch datasets using the contract's methods
  const getAvailableDatasets = async () => {
    if (!contract) throw new Error('Contract not initialized');
  
    try {
      // const count = await contract.getDatasetCount();
      const num = 1;

      const datasets = [];
      // const indexAsUint256 = ethers.BigNumber.from(0);
      const cid = await contract.getDatasetCid(1);
      for (let i = 0; i < num; i++) {
        // const cid = await contract.getDatasetCid(i); // Get CID by index
        // const data = await contract.getDatasetInfo(cid); // Lookup dataset details by CID
  
        // if (data.isRemoved) continue;
  
        // datasets.push({
        //   id: cid,
        //   owner: data.owner,
        //   price: ethers.utils.formatUnits(data.price, 8),
        //   isPublic: data.isPublic,
        //   uploaded: new Date(data.uploadTimestamp.toNumber() * 1000),
        // });
      }
  
      return datasets;
    } catch (err) {
      console.error('Error in getAvailableDatasets:', err);
      throw new Error('Failed to retrieve datasets');
    }
  };

  // Fetch datasets when account or contract changes
  useEffect(() => {
    fetchDatasets();
  }, [account, contract]);

  const fetchDatasets = async () => {
    if (!contract || !account) return;

    setLoading(true);
    setError('');

    try {
      const fetchedDatasets = await getAvailableDatasets(); // Call the custom function
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
    if (!contract || !account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      // Check if user has license
      const hasLicense = await contract.hasLicense(dataset.id, account);
      
      if (!hasLicense) {
        // If no license, check if dataset is public
        if (!dataset.isPublic) {
          setError('You need a license to download this dataset');
          return;
        }
      }

      // Implement download logic here
      // This would involve getting the dataset content from IPFS or your storage solution
      console.log('Downloading dataset:', dataset.id);
      
    } catch (error) {
      console.error('Error downloading dataset:', error);
      setError('Failed to download dataset');
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
