
import { API_BASE_URL } from '../../config';

// Helper function for API calls
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    console.log(`🌐 Making API call to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw new Error(error.message || `Unable to connect to server at ${url}. Please check if the backend is running on port 8080.`);
  }
};

export const apiService = {
  // Health check
  async healthCheck() {
    return await fetchWithErrorHandling(`${API_BASE_URL}/health`);
  },

  // ========== VICTIM APPLICATIONS ==========
  
  // Get all victim applications
  async getApplications() {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications`);
  },

  // Create new victim application
  async createApplication(applicationData) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Get victim application by ID
  async getApplicationById(id) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications/${id}`);
  },

  // Update victim application status
  async updateApplicationStatus(id, status) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete victim application
  async deleteApplication(id) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== MARRIAGE APPLICATIONS ==========

  // Get all marriage applications
  async getMarriageApplications() {
    return await fetchWithErrorHandling(`${API_BASE_URL}/intercaste-marriage`);
  },

  // Create new marriage application
  async createMarriageApplication(applicationData) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/intercaste-marriage`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Get marriage application by ID
  async getMarriageApplicationById(id) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/intercaste-marriage/${id}`);
  },

  // Update marriage application status
  async updateMarriageApplicationStatus(id, status) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/intercaste-marriage/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete marriage application
  async deleteMarriageApplication(id) {
    return await fetchWithErrorHandling(`${API_BASE_URL}/intercaste-marriage/${id}`, {
      method: 'DELETE',
    });
  },

  // ========== TEST ENDPOINTS ==========

  // Test database connection
  async testDatabase() {
    return await fetchWithErrorHandling(`${API_BASE_URL}/test/db-test`);
  },

  // Create test application
  async createTestApplication() {
    return await fetchWithErrorHandling(`${API_BASE_URL}/test/test-application`, {
      method: 'POST',
    });
  },

  // ========== COMBINED OPERATIONS ==========

  // Get all applications (both victim and marriage)
  async getAllApplications() {
    try {
      const [victimResponse, marriageResponse] = await Promise.all([
        this.getApplications(),
        this.getMarriageApplications()
      ]);

      return {
        success: true,
        data: {
          victimApplications: victimResponse.success ? victimResponse.data : [],
          marriageApplications: marriageResponse.success ? marriageResponse.data : [],
          totalCount: (victimResponse.success ? victimResponse.data.length : 0) + 
                     (marriageResponse.success ? marriageResponse.data.length : 0)
        }
      };
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw new Error('Failed to fetch applications from both endpoints');
    }
  },

  // Get application by ID (tries both endpoints)
  async findApplicationById(id) {
    try {
      // Try victim applications first
      const victimApp = await this.getApplicationById(id);
      if (victimApp.success) {
        return { ...victimApp, applicationType: 'victim' };
      }
    } catch (error) {
      // Continue to try marriage applications
    }

    try {
      // Try marriage applications
      const marriageApp = await this.getMarriageApplicationById(id);
      if (marriageApp.success) {
        return { ...marriageApp, applicationType: 'marriage' };
      }
    } catch (error) {
      // Application not found in either endpoint
    }

    throw new Error(`Application with ID ${id} not found`);
  },

  // Update application status (automatically detects type)
  async updateAnyApplicationStatus(id, status) {
    try {
      // Try victim application first
      return await this.updateApplicationStatus(id, status);
    } catch (error) {
      // If victim update fails, try marriage application
      return await this.updateMarriageApplicationStatus(id, status);
    }
  }
};

// Export default as well for compatibility
export default apiService;