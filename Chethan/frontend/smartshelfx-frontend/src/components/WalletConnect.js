import React from 'react';
import useWallet from '../utils/useWallet';

/**
 * Optional MetaMask wallet connection component
 * Safe wrapper that only connects on explicit user action
 * Prevents automatic connection errors in console
 */
export default function WalletConnect({ compact = false }) {
  const { 
    account, 
    error, 
    connect, 
    disconnect, 
    isConnecting, 
    isMetaMaskAvailable 
  } = useWallet();

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        {account ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </span>
            <button 
              onClick={disconnect}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={connect}
            disabled={!isMetaMaskAvailable || isConnecting}
            className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
        {error && <span className="text-xs text-red-500" title={error}>⚠️</span>}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Web3 Wallet (Optional)</h3>
      
      {!isMetaMaskAvailable && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mb-3">
          <strong>MetaMask not detected.</strong>
          <br />
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-yellow-800"
          >
            Install MetaMask extension
          </a>
        </div>
      )}

      {account ? (
        <div>
          <div className="text-sm mb-2">
            <strong className="text-gray-700">Connected:</strong>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
              {account}
            </div>
          </div>
          <button 
            onClick={disconnect}
            className="w-full text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <div>
          <button 
            onClick={connect}
            disabled={!isMetaMaskAvailable || isConnecting}
            className="w-full text-sm px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Blockchain features are optional and not required for inventory management.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
