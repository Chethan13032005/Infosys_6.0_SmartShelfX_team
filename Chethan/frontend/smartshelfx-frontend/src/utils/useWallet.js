import { useState, useEffect } from 'react';

/**
 * Safe MetaMask wallet connection hook
 * Only connects when user explicitly clicks - prevents automatic connection errors
 */
export default function useWallet() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  const connect = async () => {
    setError(null);
    setIsConnecting(true);

    if (!isMetaMaskAvailable()) {
      setError('MetaMask extension not detected. Please install MetaMask.');
      setIsConnecting(false);
      return null;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnecting(false);
        return accounts[0];
      } else {
        setError('No accounts found');
        setIsConnecting(false);
        return null;
      }
    } catch (err) {
      const errorMessage = err.message || 'Connection rejected by user';
      setError(errorMessage);
      setIsConnecting(false);
      console.warn('MetaMask connection error:', errorMessage);
      return null;
    }
  };

  const disconnect = () => {
    setAccount(null);
    setError(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskAvailable()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
      }
    };

    try {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    } catch (err) {
      console.warn('Could not set up MetaMask listeners:', err);
    }
  }, []);

  return { 
    account, 
    error, 
    connect, 
    disconnect,
    isConnecting,
    isMetaMaskAvailable: isMetaMaskAvailable()
  };
}
