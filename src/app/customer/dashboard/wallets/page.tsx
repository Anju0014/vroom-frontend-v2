
"use client"
import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthService } from '@/services/customer/authService'; 
import Pagination from '@/components/pagination';
import {ITransaction ,IWalletData, IWalletResponse }  from '@/types/walletTypes'
import LoadingButton from '@/components/common/LoadingButton';

const WalletPage: React.FC = () => {
  const [walletData, setWalletData] = useState<IWalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;

  const fetchWalletData = async (page: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
     const response: IWalletResponse =
  await AuthService.findCustomerWalletDetails(page, itemsPerPage);
  console.log("wallet",response)

setWalletData({
  balance: response.data.wallet.balance,
  transactions: response.data.wallet.transactions,
});

const totalPages = Math.ceil(response.data.total / itemsPerPage);
setTotalPages(totalPages);
setCurrentPage(response.data.page);

      
    } catch (err: unknown) {
      console.error('Error fetching wallet data:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to load wallet data');
      } else {
        setError('Failed to load wallet data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getTransactionIcon = (type: ITransaction['type']): React.ReactElement => {
    switch (type) {
      case 'refund':
      case 'cancellation':
      case 'other':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'payment':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: ITransaction['type']): string => {
    switch (type) {
      case 'refund':
      case 'cancellation':
      case 'other':
        return 'text-green-600';
      case 'payment':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


    
    const isCredit = (type: ITransaction["type"]) =>
    type === "refund" || type === "cancellation" || type === "other";
    const formatAmount = (amount: number, type: ITransaction["type"]) =>
    `${isCredit(type) ? "+" : "-"}₹${Math.abs(amount).toFixed(2)}`;

   

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-blue-200 to-yellow-200 p-4 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-blue-200 to-yellow-200 p-4 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <LoadingButton
            onClick={() => fetchWalletData(currentPage)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </LoadingButton>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-200 to-yellow-200 p-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
      
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-white text-2xl font-bold">My Wallet</h1>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-blue-100 text-sm mb-2">Available Balance</p>
            <p className="text-white text-5xl font-bold">
              ₹{walletData?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
            <p className="text-sm text-gray-500 mt-1">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          {walletData?.transactions && walletData.transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {walletData.transactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {transaction.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">
                            {transaction.description || 'No description'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.date)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                            {formatAmount(transaction.amount,transaction.type)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-2">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;

