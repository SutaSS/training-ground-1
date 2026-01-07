import axiosInstance from './axiosConfig';

export const paymentApi = {
  // Get user's payment history
  getMyPayments: async () => {
    const response = await axiosInstance.get('/payments/my-payments');
    return response.data;
  },
};