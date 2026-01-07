import { useState, useEffect } from 'react';
import { fineApi } from '../../api/fineApi';
import { paymentApi } from '../../api/paymentApi';
import toast from 'react-hot-toast';

export default function MyFines() {
  const [fines, setFines] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFine, setSelectedFine] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [finesRes, paymentsRes] = await Promise.all([
        fineApi.getMyFines(),
        paymentApi.getMyPayments(),
      ]);
      setFines(finesRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      toast.error('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      await fineApi.payFine(selectedFine.id, { paymentMethod });
      toast.success('Fine paid successfully!');
      setIsPaymentModalOpen(false);
      setSelectedFine(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const openPaymentModal = (fine) => {
    setSelectedFine(fine);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedFine(null);
    setPaymentMethod('CASH');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      UNPAID: 'bg-red-100 text-red-800',
      PAID: 'bg-green-100 text-green-800',
      WAIVED: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Fines</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fines...</p>
          </div>
        ) : (
          <>
            {/* Fines Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Fines</h2>
              {fines.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600 text-lg">You have no fines</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fines.map((fine) => (
                    <div key={fine.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">
                            {fine.loan.bookCopy.book.title}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            Reason: {fine.reason}
                          </p>
                          <p className="text-2xl font-bold text-red-600 mt-2">
                            Rp {fine.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Issued: {formatDate(fine.createdAt)}
                          </p>
                          {fine.paidAt && (
                            <p className="text-sm text-gray-500">
                              Paid: {formatDate(fine.paidAt)}
                            </p>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col items-end gap-3">
                          {getStatusBadge(fine.status)}
                          
                          {fine.status === 'UNPAID' && (
                            <button
                              onClick={() => openPaymentModal(fine)}
                              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment History Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Payment History</h2>
              {payments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">No payment history</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            Rp {payment.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {payment.status}
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

        {/* Payment Modal */}
        {isPaymentModalOpen && selectedFine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Pay Fine</h2>
              
              <div className="mb-4">
                <p className="text-gray-600">Book: {selectedFine.loan.bookCopy.book.title}</p>
                <p className="text-gray-600">Reason: {selectedFine.reason}</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  Rp {selectedFine.amount.toLocaleString()}
                </p>
              </div>

              <form onSubmit={handlePayment}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="TRANSFER">Bank Transfer</option>
                    <option value="E_WALLET">E-Wallet</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={paying}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {paying ? 'Processing...' : 'Pay Now'}
                  </button>
                  <button
                    type="button"
                    onClick={closePaymentModal}
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
