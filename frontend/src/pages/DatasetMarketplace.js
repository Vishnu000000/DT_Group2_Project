import React, { useState, useEffect } from 'react';
import { useHedera } from '../context/HederaContext';
import { ethers } from 'ethers'; // Added this import
import { useLicense } from '../context/LicenseContext';

function DatasetMarketplace() {
  const { account, contract } = useHedera();
  const { licenseContract} = useLicense();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDatasets() {
      if (!contract || !account) return;

      try {
        const count = await contract.getDatasetCount();
        const datasetList = [];

        for (let i = 0; i < count; i++) {
          const cid = await contract.getDatasetCid(i);
          const info = await contract.getDatasetInfo(cid);
          const hasLicense = await contract.hasLicense(cid, account.toString());

          datasetList.push({
            cid,
            owner: info.owner,
            price: info.price,
            isPublic: info.isPublic,
            name: info.name,
            description: info.description,
            hasLicense
          });
        }

        setDatasets(datasetList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading datasets:', error);
        setLoading(false);
      }
    }

    loadDatasets();
  }, [contract, account]);

  const purchaseDataset = async (cid) => {
    if (!contract || !account) return;

    try {
      const clid=await licenseContract.purchaseLicense(cid);  // NO value sent here
      console.log(clid);
      window.location.reload();
    } catch (error) {
      console.error('Error purchasing dataset:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Dataset Marketplace</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <div key={dataset.cid} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {dataset.name ? dataset.name : 'Unnamed Dataset'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  CID: {dataset.cid}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {dataset.description ? dataset.description : 'No description provided'}
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-gray-600">
                    Price: {dataset.price ? ethers.utils.formatUnits(dataset.price, 8) : 'N/A'} HBAR
                  </p>
                  <p className="text-sm text-gray-600">
                    Owner: {dataset.owner ? `${dataset.owner.toString().slice(0, 6)}...${dataset.owner.toString().slice(-4)}` : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Visibility: {dataset.isPublic ? 'Public' : 'Private'}
                  </p>
                </div>

                <div className="mt-6">
                  {dataset.hasLicense ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Licensed
                    </span>
                  ) : (
                    <button
                      onClick={() => purchaseDataset(dataset.cid, dataset.price)}
                      className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Purchase License
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DatasetMarketplace;
