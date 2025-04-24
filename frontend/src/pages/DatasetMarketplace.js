import React, { useState, useEffect } from 'react';
import { useHedera } from '../context/HederaContext';
import DatasetRegistry from '../contracts/DatasetRegistry.json';

function DatasetMarketplace() {
  const { account, client } = useHedera();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    async function loadDatasets() {
      if (!client || !account) return;

      try {
        const count = await client.getDatasetCount();
        const datasetList = [];

        for (let i = 0; i < count; i++) {
          const cid = await client.getDatasetCid(i);
          const info = await client.getDatasetInfo(cid);
          const hasLicense = await client.hasLicense(cid, account.toString());

          datasetList.push({
            cid,
            ...info,
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
  }, [client, account]);

  const purchaseDataset = async (cid, price) => {
    if (!client || !account) return;

    try {
      await client.grantLicense(cid, account.toString(), {
        value: price
      });
      // Refresh dataset list
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
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Dataset Marketplace</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {datasets.map((dataset) => (
            <div key={dataset.cid} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{dataset.cid}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Price: {dataset.price} HBAR
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Owner: {dataset.owner.toString().slice(0, 6)}...{dataset.owner.toString().slice(-4)}
                </p>
                <div className="mt-4">
                  {dataset.hasLicense ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Licensed
                    </span>
                  ) : (
                    <button
                      onClick={() => purchaseDataset(dataset.cid, dataset.price)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
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