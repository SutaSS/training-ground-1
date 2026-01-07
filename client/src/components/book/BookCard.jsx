// client/src/components/book/BookCard.jsx
export default function BookCard({ book, onViewDetail }) {
  // Count available copies from the copies array
  const availableCopies = book.copies?.length || 0;
  const isAvailable = availableCopies > 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
      {/* Book Cover Placeholder */}
      <div className="bg-gray-200 h-48 rounded mb-3 flex items-center justify-center">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="h-full w-full object-cover rounded"
          />
        ) : (
          <span className="text-4xl">📚</span>
        )}
      </div>

      {/* Book Info */}
      <h3 className="font-bold text-lg mb-1 truncate" title={book.title}>
        {book.title}
      </h3>
      <p className="text-sm text-gray-600 mb-2 truncate" title={book.authors}>
        {book.authors || 'Unknown Author'}
      </p>
      <p className="text-xs text-gray-500 mb-3">
        {book.category || 'Uncategorized'}
      </p>

      {/* Status Badge */}
      <div className="flex justify-between items-center mb-3">
        {isAvailable ? (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            Available ({availableCopies})
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
            Not Available
          </span>
        )}
      </div>

      {/* Button */}
      <button
        onClick={() => onViewDetail(book)}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        View Details
      </button>
    </div>
  );
}