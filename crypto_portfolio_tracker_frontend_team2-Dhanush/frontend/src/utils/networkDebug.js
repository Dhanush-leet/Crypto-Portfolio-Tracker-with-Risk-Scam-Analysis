// Network debugging utilities
export const debugNetworkError = (error, url, method = 'GET') => {
  console.group(`🔴 Network Error: ${method} ${url}`);
  console.error('Error message:', error.message);
  console.error('Full error:', error);
  
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    console.warn('💡 This is likely a CORS issue or the backend is not running');
    console.warn('Check:');
    console.warn('1. Backend is running on the expected port');
    console.warn('2. CORS is properly configured');
    console.warn('3. No browser extensions blocking requests');
  }
  
  if (error.message.includes('401')) {
    console.warn('💡 Authentication issue - token may be expired or invalid');
  }
  
  if (error.message.includes('404')) {
    console.warn('💡 Endpoint not found - check the API URL and backend routes');
  }
  
  console.groupEnd();
};

export const logApiCall = (method, url, data = null) => {
  console.group(`🌐 API Call: ${method} ${url}`);
  if (data) {
    console.log('Request data:', data);
  }
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
};