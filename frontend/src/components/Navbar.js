import React from 'react';
import { Link } from 'react-router-dom';
import { useHedera } from '../context/HederaContext';

function Navbar() {
  const { account, isConnected, isWalletInstalled, connect, disconnect } = useHedera();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                AI Data Chain
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Marketplace
              </Link>
              <Link
                to="/upload"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Upload Dataset
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {account?.toString().slice(0, 6)}...{account?.toString().slice(-4)}
                </span>
                <button
                  onClick={disconnect}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className={`${
                  isWalletInstalled
                    ? 'bg-primary-600 hover:bg-primary-700'
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white px-4 py-2 rounded-md text-sm font-medium`}
                disabled={!isWalletInstalled}
              >
                {isWalletInstalled ? 'Connect HashPack' : 'Install HashPack'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 