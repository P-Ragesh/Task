// TaskPilot Enterprise — REST API Client Wrapper
// 
// For local development, this defaults to localhost.
// For production, replace 'YOUR_HUGGING_FACE_BACKEND_URL' with your Hugging Face Space URL (e.g., https://username-spacename.hf.space)
// Alternatively, you can override this URL dynamically in your browser console by running:
//   localStorage.setItem('tp_api_url', 'https://your-huggingface-space.hf.space/api');
const API_BASE_URL = localStorage.getItem('tp_api_url') || 
  ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://YOUR_HUGGING_FACE_BACKEND_URL/api');

const apiClient = {
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('tp_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async handleResponse(response) {
    if (response.status === 401) {
      // Session expired or unauthorized
      localStorage.removeItem('tp_token');
      localStorage.removeItem('tp_user');
      window.location.href = 'login.html';
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An API error occurred.');
    }
    return data;
  },

  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (err) {
      console.error(`API GET [${endpoint}] Error:`, err.message);
      throw err;
    }
  },

  async post(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await this.handleResponse(response);
    } catch (err) {
      console.error(`API POST [${endpoint}] Error:`, err.message);
      throw err;
    }
  },

  async put(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await this.handleResponse(response);
    } catch (err) {
      console.error(`API PUT [${endpoint}] Error:`, err.message);
      throw err;
    }
  },

  async patch(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });
      return await this.handleResponse(response);
    } catch (err) {
      console.error(`API PATCH [${endpoint}] Error:`, err.message);
      throw err;
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return await this.handleResponse(response);
    } catch (err) {
      console.error(`API DELETE [${endpoint}] Error:`, err.message);
      throw err;
    }
  }
};
