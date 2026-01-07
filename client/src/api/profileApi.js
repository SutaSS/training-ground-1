import axiosInstance from './axiosConfig';

export const profileApi = {
  // Get user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/profile', profileData);
    return response.data;
  },

  // Update profile avatar
  updateAvatar: async (formData) => {
    const response = await axiosInstance.put('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/profile/change-password', passwordData);
    return response.data;
  },
};