import React, { useEffect, useState } from 'react';
import { getToken, getUser, getRole, isAuthenticated } from '../utils/auth';
import axios from 'axios';

const AuthDebug = () => {
  const token = getToken();
  const user = getUser();
  const role = getRole();
  const authed = isAuthenticated();
  const [backendCheck, setBackendCheck] = useState('Checking...');

  useEffect(() => {
    // Test if backend is reachable and token works
    const testBackend = async () => {
      try {
        const res = await axios.get('/products/view');
        setBackendCheck(`✅ Backend OK (${res.data.length} products)`);
      } catch (err) {
        if (err.response?.status === 403) {
          setBackendCheck(`⚠️ Backend 403: ${err.response?.data || 'Permission denied'}`);
        } else if (err.response?.status === 401) {
          setBackendCheck('❌ Backend 401: Token invalid/missing');
        } else if (err.code === 'ERR_NETWORK') {
          setBackendCheck('❌ Backend not running (ERR_NETWORK)');
        } else {
          setBackendCheck(`❌ Backend error: ${err.message}`);
        }
      }
    };
    if (authed) {
      testBackend();
    } else {
      setBackendCheck('Not authenticated');
    }
  }, [authed]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Authenticated:</strong> {authed ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Role:</strong> <span className="font-mono bg-gray-800 px-1 rounded">{role || 'None'}</span></div>
        <div><strong>Email:</strong> {user.email || 'None'}</div>
        <div><strong>Full Name:</strong> {user.fullName || 'None'}</div>
        <div><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</div>
        <div><strong>Backend:</strong> {backendCheck}</div>
        <div className="mt-2 pt-2 border-t border-gray-700">
          <strong>Permissions:</strong>
          <div className="ml-2">
            {role === 'Admin' && '✅ Can Add/Update/Delete Products'}
            {role === 'Manager' && '✅ Can Add/Update Products (no Delete)'}
            {role === 'Vendor' && '⚠️ Can only View Products'}
            {!role && '❌ Not logged in'}
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-700 text-yellow-300">
          <strong>Troubleshooting:</strong>
          <div className="ml-2 text-xs">
            {role === 'Admin' && backendCheck.includes('403') && (
              <>
                <div>1. Backend may have wrong role in DB</div>
                <div>2. Run fix_admin_role.sql script</div>
                <div>3. Restart backend</div>
              </>
            )}
            {!authed && '• Please login first'}
            {backendCheck.includes('not running') && '• Start backend: mvnw.cmd spring-boot:run'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;
