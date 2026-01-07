import axiosInstance from './axiosConfig';

export const fineApi = {
  // Get user's fines
  getMyFines: async () => {
    const response = await axiosInstance.get('/fines/my-fines');
    return response.data;
  },

  // Pay fine
  payFine: async (fineId, paymentData) => {
    const response = await axiosInstance.post(`/fines/${fineId}/pay`, paymentData);
    return response.data;
  },
};