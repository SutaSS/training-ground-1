// client/src/api/bookApi.js
import axiosInstance from './axiosConfig';

export const bookApi = {
  // Get all books
  getAllBooks: async (params = {}) => {
    const response = await axiosInstance.get('/books', { params });
    return response.data;
  },

  // Search books
  searchBooks: async (query) => {
    const response = await axiosInstance.get(`/books/search?q=${query}`);
    return response.data;
  },

  // Get book by ID
  getBookById: async (id) => {
    const response = await axiosInstance.get(`/books/${id}`);
    return response.data;
  },

  // Get available copies
  getAvailableCopies: async (id) => {
    const response = await axiosInstance.get(`/books/${id}/available-copies`);
    return response.data;
  },
};