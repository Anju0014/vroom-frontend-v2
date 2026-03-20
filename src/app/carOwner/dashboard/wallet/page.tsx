
"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
  BadgeIndianRupee,
} from "lucide-react";
import Pagination from "@/components/pagination";
import LoadingButton from "@/components/common/LoadingButton";
import { ITransaction, IOwnerWalletData, IOwnerWalletResponse } from "@/types/walletTypes";
import { OwnerAuthService } from "@/services/carOwner/authService";

const ITEMS_PER_PAGE = 5;

export default function OwnerWalletPage() {
  const [walletData, setWalletData] = useState<IOwnerWalletData | null>(null);
  const [payoutEnabled, setPayoutEnabled] = useState<boolean>(false);
  const [lastPayout, setLastPayout] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [payoutLoading, setPayoutLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchWalletData = async (page: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response: IOwnerWalletResponse =
        await OwnerAuthService.findOwnerWalletDetails(page, ITEMS_PER_PAGE);

      setWalletData({
        balance: response.data.wallet.balance,
        pendingBalance: response.data.wallet.pendingBalance,
        totalEarnings: response.data.wallet.pendingBalance,
        totalWithdrawn: response.data.wallet.totalEarnings,
        lastPayout:response.data.wallet.lastPayout,
        transactions: response.data.wallet.transactions,
      });

      
      setPayoutEnabled(response.data.payoutStatus ?? false);
      setLastPayout(response.data.wallet.lastPayout ?? 0);
      setTotalEarnings(response.data.wallet.totalEarnings ?? 0);
      setPendingBalance(response.data.wallet.pendingBalance ?? 0);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
      setCurrentPage(response.data.page);
    } catch (err: unknown) {
      console.error("Error fetching wallet data:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Failed to load wallet data");
      } else {
        setError("Failed to load wallet data");
      }
    } finally {
      setLoading(false);
    }
  };

  const enablePayouts = async (): Promise<void> => {
    try {
      setPayoutLoading(true);
      const res = await  OwnerAuthService.createConnectAccount();
    window.location.href = res.url;
    } catch (err) {
      console.error(err);
    } finally {
      setPayoutLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isCredit = (type: ITransaction["type"]) =>
    type === "refund" || type === "cancellation" || type === "other";

  const formatAmount = (amount: number, type: ITransaction["type"]) =>
    `${isCredit(type) ? "+" : "-"}₹${Math.abs(amount).toFixed(2)}`;

  const getTransactionIcon = (type: ITransaction["type"]) => {
    if (isCredit(type))
      return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
    return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
  };

  const getAmountColor = (type: ITransaction["type"]) =>
    isCredit(type) ? "text-emerald-600" : "text-rose-500";

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      paid: "bg-blue-50 text-blue-700 border border-blue-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-md flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-500 text-sm">Loading your wallet…</p>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-md text-center flex flex-col items-center gap-4">
          <X className="w-10 h-10 text-rose-500" />
          <p className="text-rose-600 font-semibold">{error}</p>
          <LoadingButton
            onClick={() => fetchWalletData(currentPage)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Retry
          </LoadingButton>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-[#F4F6FA] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

    
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <Wallet className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Owner Wallet</h1>
            <p className="text-sm text-gray-500">Manage your earnings & payouts</p>
          </div>
        </div>

        
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 shadow-xl text-white">
          
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

          <p className="text-indigo-200 text-sm mb-1">Available Balance</p>
          <p className="text-5xl font-extrabold tracking-tight mb-6">
            ₹{walletData?.balance?.toFixed(2) || "0.00"}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs mb-0.5">Last Payout</p>
              <p className="text-white font-semibold">₹{lastPayout.toFixed(2)}</p>
            </div>

            {!payoutEnabled ? (
              <button
                onClick={enablePayouts}
                disabled={payoutLoading}
                className="flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-70"
              >
                {payoutLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BadgeIndianRupee className="w-4 h-4" />
                )}
                {payoutLoading ? "Connecting…" : "Enable Payouts"}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-sm font-medium px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                Payouts Enabled
              </span>
            )}
          </div>
        </div>

    
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Earnings</p>
              <p className="text-lg font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Available Balance</p>
              <p className="text-lg font-bold text-emerald-600">
                ₹{walletData?.balance?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-xl">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Balance</p>
              <p className="text-lg font-bold text-amber-600">₹{pendingBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Transaction History</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          {walletData?.transactions && walletData.transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {walletData.transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-gray-100 p-1.5 rounded-lg">
                              {getTransactionIcon(tx.type)}
                            </div>
                            <span className="text-sm font-medium text-gray-800 capitalize">
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <p className="text-sm text-gray-500 truncate">
                            {tx.description || tx.bookingId || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tx.status && (
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusBadge(
                                tx.status
                              )}`}
                            >
                              {tx.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-500">
                            {formatDate(tx.date)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-bold ${getAmountColor(tx.type)}`}>
                            {formatAmount(tx.amount, tx.type)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="border-t border-gray-100">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <Wallet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-1">Your history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}