import { useState, useEffect } from 'react';
import { loanApi } from '../../api/loanApi';
import toast from 'react-hot-toast';

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const fetchMyLoans = async () => {
    setLoading(true);
    try {
      const response = await loanApi.getMyLoans();
      setLoans(response.data);
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    setActionLoading(loanId);
    try {
      await loanApi.returnBook(loanId);
      toast.success('Book returned successfully!');
      fetchMyLoans();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to return book');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenew = async (loanId) => {
    setActionLoading(loanId);
    try {
      await loanApi.renewLoan(loanId);
      toast.success('Loan renewed successfully!');
      fetchMyLoans();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to renew loan');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-blue-100 text-blue-800',
      returned: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      lost: 'bg-gray-100 text-gray-800',
    };

    const statusLabels = {
      active: 'Active',
      returned: 'Returned',
      overdue: 'Overdue',
      lost: 'Lost',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Loans</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading loans...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">You have no active loans</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{loan.copy?.book?.title || 'Unknown Book'}</h3>
                    <p className="text-gray-600 mb-1">Author: {loan.copy?.book?.authors || 'Unknown'}</p>
                    <p className="text-gray-600 mb-1">Copy Code: {loan.copy?.copyCode || 'N/A'}</p>
                    <p className="text-gray-600 mb-1">Condition: {loan.copy?.condition || 'N/A'}</p>
                    
                    <div className="mt-3 space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">Borrowed:</span> {formatDate(loan.loanDate)}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Due:</span>{' '}
                        <span className={isOverdue(loan.dueDate) && loan.status === 'active' ? 'text-red-600 font-bold' : ''}>
                          {formatDate(loan.dueDate)}
                        </span>
                      </p>
                      {loan.returnDate && (
                        <p className="text-sm">
                          <span className="font-semibold">Returned:</span> {formatDate(loan.returnDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col items-end gap-3">
                    {getStatusBadge(loan.status)}
                    
                    {loan.status === 'active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRenew(loan.id)}
                          disabled={actionLoading === loan.id}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 text-sm"
                        >
                          {actionLoading === loan.id ? 'Processing...' : 'Renew'}
                        </button>
                        <button
                          onClick={() => handleReturn(loan.id)}
                          disabled={actionLoading === loan.id}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm"
                        >
                          {actionLoading === loan.id ? 'Processing...' : 'Return'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Show fine if exists */}
                {loan.fine && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="font-semibold text-red-800">Outstanding Fine</p>
                    <p className="text-red-600">Amount: Rp {loan.fine.amountTotal?.toLocaleString() || 0}</p>
                    <p className="text-sm text-red-600">Reason: {loan.fine.reason}</p>
                    {loan.fine.status === 'unpaid' && (
                      <p className="text-xs text-red-500 mt-1">Please pay this fine before borrowing more books</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
