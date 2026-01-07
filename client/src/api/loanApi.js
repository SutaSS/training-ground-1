import axiosInstance from './axiosConfig';

export const loanApi = {
  // Borrow a book
  borrowBook: async (bookId) => {
    const response = await axiosInstance.post('/loans/borrow', { bookId });
    return response.data;
  },

  // Get user's loans
  getMyLoans: async () => {
    const response = await axiosInstance.get('/loans/my-loans');
    return response.data;
  },

  // Return a book
  returnBook: async (loanId) => {
    const response = await axiosInstance.post(`/loans/${loanId}/return`);
    return response.data;
  },

  // Renew a loan
  renewLoan: async (loanId) => {
    const response = await axiosInstance.post(`/loans/${loanId}/renew`);
    return response.data;
  },
};