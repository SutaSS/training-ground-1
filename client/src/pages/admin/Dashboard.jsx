import { useState, useEffect } from 'react';
import { bookApi } from '../../api/bookAPI';
import { loanApi } from '../../api/loanApi';
import { fineApi } from '../../api/fineApi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalLoans: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalFines: 0,
    unpaidFines: 0,
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [booksRes, loansRes, finesRes] = await Promise.all([
        bookApi.getAllBooks(),
        loanApi.getMyLoans(),
        fineApi.getMyFines(),
      ]);

      const books = booksRes.data;
      const loans = loansRes.data;
      const fines = finesRes.data;

      // Calculate statistics
      const activeLoans = loans.filter(l => l.status === 'ACTIVE').length;
      const overdueLoans = loans.filter(l => l.status === 'OVERDUE').length;
      const unpaidFines = fines.filter(f => f.status === 'UNPAID');
      const totalFineAmount = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

      setStats({
        totalBooks: books.length,
        totalLoans: loans.length,
        activeLoans,
        overdueLoans,
        totalFines: totalFineAmount,
        unpaidFines: unpaidFines.length,
      });

      // Get 5 most recent loans
      setRecentLoans(loans.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Books */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Books</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBooks}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <span className="text-3xl">📚</span>
                  </div>
                </div>
              </div>

              {/* Active Loans */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Active Loans</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeLoans}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <span className="text-3xl">📖</span>
                  </div>
                </div>
              </div>

              {/* Overdue Loans */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Overdue Loans</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdueLoans}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <span className="text-3xl">⚠️</span>
                  </div>
                </div>
              </div>

              {/* Total Loans */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Loans</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLoans}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <span className="text-3xl">📋</span>
                  </div>
                </div>
              </div>

              {/* Unpaid Fines */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Unpaid Fines</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{stats.unpaidFines}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <span className="text-3xl">💰</span>
                  </div>
                </div>
              </div>

              {/* Total Fines Amount */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Fines</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      Rp {stats.totalFines.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <span className="text-3xl">💳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Loans */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Recent Loans</h2>
              </div>
              
              {recentLoans.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No recent loans</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentLoans.map((loan) => (
                        <tr key={loan.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {loan.bookCopy.book.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {loan.bookCopy.book.author}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(loan.borrowDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(loan.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                              loan.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
