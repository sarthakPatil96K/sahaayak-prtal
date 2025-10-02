const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
    backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'
  }
};

export default config;