// Centralized API Configuration
const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  return 'https://blood-connect-8g8q.onrender.com';
};

export const API_BASE_URL = getApiUrl();
export default API_BASE_URL;