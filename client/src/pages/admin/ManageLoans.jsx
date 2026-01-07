import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import toast from 'react-hot-toast';

export default function ManageLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, RETURNED, OVERDUE

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/loans');
      setLoans(response.data.data);
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleForceReturn = async (loanId) => {
    if (!confirm('Force return this loan?')) return;

    try {
      await axiosInstance.post(`/loans/${loanId}/return`);
      toast.success('Loan returned successfully!');
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to return loan');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (loan) => {
    if (loan.status !== 'active') return false;
    return new Date(loan.dueDate) < new Date();
  };

  const filteredLoans = loans.filter((loan) => {
    if (filter === 'ALL') return true;
    if (filter === 'OVERDUE') return isOverdue(loan);
    return loan.status === filter;
  });

  const getStatusBadge = (loan) => {
    if (isOverdue(loan)) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">OVERDUE</span>;
    }
    
    const statusColors = {
      active: 'bg-blue-100 text-blue-800',
      returned: 'bg-green-100 text-green-800',
      overdue: 'bg-orange-100 text-orange-800',
      lost: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[loan.status] || 'bg-gray-100 text-gray-800'}`}>
        {loan.status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Loans</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'RETURNED', 'OVERDUE'].map((status) => (
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
            <p className="mt-4 text-gray-600">Loading loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No loans found</p>
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
                    Copy Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrow Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
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
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className={isOverdue(loan) ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {loan.user?.email || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {loan.user?.profile?.fullName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {loan.copy?.book?.title || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {loan.copy?.book?.authors || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {loan.copy?.copyCode || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(loan.loanDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={isOverdue(loan) ? 'text-red-600 font-bold' : 'text-gray-900'}>
                        {formatDate(loan.dueDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(loan)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleForceReturn(loan.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Force Return
                        </button>
                      )}
                      {loan.fine && (
                        <span className="ml-4 text-red-600">
                          Fine: Rp {loan.fine.amountTotal?.toLocaleString() || 0}
                        </span>
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
            <p className="text-gray-600 text-sm">Total Loans</p>
            <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Active Loans</p>
            <p className="text-2xl font-bold text-blue-600">
              {loans.filter(l => l.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Overdue Loans</p>
            <p className="text-2xl font-bold text-red-600">
              {loans.filter(l => isOverdue(l)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Returned</p>
            <p className="text-2xl font-bold text-green-600">
              {loans.filter(l => l.status === 'returned').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
