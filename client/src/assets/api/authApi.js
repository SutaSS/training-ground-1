import axiosInstance from './axiosConfig';

export const authApi = {
  // Register
  register: async (data) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await axiosInstance.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await axiosInstance.post('/profile/change-password', data);
    return response.data;
  },
};