import { useState, useEffect } from 'react';
import { bookApi } from '../../api/bookAPI';
import { loanApi } from '../../api/loanApi';
import toast from 'react-hot-toast';

export default function BookDetailModal({ book, isOpen, onClose, onBorrowSuccess }) {
  const [availableCopies, setAvailableCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      fetchAvailableCopies();
    }
  }, [isOpen, book]);

  const fetchAvailableCopies = async () => {
    setLoading(true);
    try {
      const response = await bookApi.getAvailableCopies(book.id);
      setAvailableCopies(response.data);
    } catch (error) {
      toast.error('Failed to load available copies');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (availableCopies.length === 0) {
      toast.error('No copies available');
      return;
    }

    // Use the first available copy ID
    const copyId = availableCopies[0].id;

    setBorrowing(true);
    try {
      await loanApi.borrowBook(copyId);
      toast.success('Book borrowed successfully!');
      onBorrowSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{book.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Book Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Author</label>
              <p className="text-gray-900">{book.author}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">ISBN</label>
              <p className="text-gray-900">{book.isbn}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Publisher</label>
              <p className="text-gray-900">{book.publisher}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Publication Year</label>
              <p className="text-gray-900">{book.publicationYear}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Category</label>
              <p className="text-gray-900">{book.category}</p>
            </div>

            {book.description && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Description</label>
                <p className="text-gray-900">{book.description}</p>
              </div>
            )}

            {/* Availability */}
            <div>
              <label className="text-sm font-semibold text-gray-600">Availability</label>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${availableCopies.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {availableCopies.length} copies available
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleBorrow}
              disabled={borrowing || availableCopies.length === 0}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {borrowing ? 'Borrowing...' : 'Borrow Book'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
