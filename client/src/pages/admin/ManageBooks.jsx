import { useState, useEffect } from 'react';
import { bookApi } from '../../api/bookAPI';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosConfig';

export default function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    category: '',
    description: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await bookApi.getAllBooks();
      setBooks(response.data);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axiosInstance.put(`/books/${currentBook.id}`, formData);
        toast.success('Book updated successfully!');
      } else {
        await axiosInstance.post('/books', formData);
        toast.success('Book created successfully!');
      }
      closeModal();
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} book`);
    }
  };

  const handleDelete = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await axiosInstance.delete(`/books/${bookId}`);
      toast.success('Book deleted successfully!');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete book');
    }
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setCurrentBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publicationYear: new Date().getFullYear(),
      category: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setIsEditMode(true);
    setCurrentBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      category: book.category,
      description: book.description || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBook(null);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Books</h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            + Add New Book
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No books available</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.map((book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.isbn}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{book.publicationYear}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(book)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">
                {isEditMode ? 'Edit Book' : 'Add New Book'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ISBN *
                      </label>
                      <input
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publication Year *
                      </label>
                      <input
                        type="number"
                        value={formData.publicationYear}
                        onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher *
                    </label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="e.g. Fiction, Science, History"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                  >
                    {isEditMode ? 'Update Book' : 'Create Book'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
