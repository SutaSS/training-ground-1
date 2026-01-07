import { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import toast from 'react-hot-toast';

export default function ManageFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNPAID, PAID, WAIVED

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/fines/statistics/summary');
      // Get all fines - we need to create an endpoint for this or use another approach
      const allFinesRes = await axiosInstance.get('/fines/my-fines');
      setFines(allFinesRes.data.data);
    } catch (error) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const handleWaiveFine = async (fineId) => {
    if (!confirm('Waive this fine? This action cannot be undone.')) return;

    try {
      await axiosInstance.post(`/fines/${fineId}/waive`);
      toast.success('Fine waived successfully!');
      fetchFines();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to waive fine');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredFines = fines.filter((fine) => {
    if (filter === 'ALL') return true;
    return fine.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      UNPAID: 'bg-red-100 text-red-800',
      PAID: 'bg-green-100 text-green-800',
      WAIVED: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const totalUnpaid = fines
    .filter(f => f.status === 'UNPAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPaid = fines
    .filter(f => f.status === 'PAID')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Fines</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            {['ALL', 'UNPAID', 'PAID', 'WAIVED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg ${
                  filter === status
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fines...</p>
          </div>
        ) : filteredFines.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No fines found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFines.map((fine) => (
                  <tr key={fine.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fine.loan.user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {fine.loan.user.profile?.fullName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fine.loan.bookCopy.book.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        Copy: {fine.loan.bookCopy.copyCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {fine.reason}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      Rp {fine.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(fine.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(fine.status)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {fine.status === 'UNPAID' && (
                        <button
                          onClick={() => handleWaiveFine(fine.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Waive Fine
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Fines</p>
            <p className="text-2xl font-bold text-gray-900">{fines.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Unpaid Fines</p>
            <p className="text-2xl font-bold text-red-600">
              {fines.filter(f => f.status === 'UNPAID').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Rp {totalUnpaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Paid Fines</p>
            <p className="text-2xl font-bold text-green-600">
              {fines.filter(f => f.status === 'PAID').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Rp {totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Waived Fines</p>
            <p className="text-2xl font-bold text-blue-600">
              {fines.filter(f => f.status === 'WAIVED').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
