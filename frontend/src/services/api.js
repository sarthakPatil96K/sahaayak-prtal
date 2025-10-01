const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

// Helper function for API calls
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw new Error('Unable to connect to server. Please check if the backend is running.');
  }
};

export const apiService = {
  // Applications
  async getApplications() {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications`);
  },

  async createApplication(applicationData) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  async getApplicationById(id) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications/${id}`);
  },

  async updateApplicationStatus(id, status) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
};