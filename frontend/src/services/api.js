const API_BASE_URL = 'http://localhost:8080/api';

export const apiService = {
  async createApplication(applicationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
  },

  async getApplicationById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error('Unable to fetch application details.');
    }
  }
};

export default apiService;