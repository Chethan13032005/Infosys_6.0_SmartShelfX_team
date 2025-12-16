// Prefer environment variable if provided; fallback to local backend
const config = {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8082/api'
};

// Backward-compatible named export for modules importing { API_BASE_URL }
export const API_BASE_URL = config.apiUrl;

export default config;