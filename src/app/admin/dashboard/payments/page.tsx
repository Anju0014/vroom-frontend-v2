'use client';

import React, { useCallback, useEffect, useState } from "react";
import { Table, TableColumn } from "@/components/admin/Table";
import { AdminAuthService } from "@/services/admin/adminService";
import toast from "react-hot-toast";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import Pagination from "@/components/pagination";
import { useDebounce } from "@/hooks/useDebounce";

interface OwnerWallet {
  id: string;
  ownerId: string;
  ownerName: string;
  email: string;
  balance: number;
  pendingPayout: number;
  totalWithdrawn: number;
  payoutEnabled: boolean;
  createdAt: Date;
}

interface PayoutConfirmModalProps {
  wallet: OwnerWallet;
  onClose: () => void;
  onConfirm: (walletId: string, ownerId: string) => void;
  isProcessing: boolean;
}

const PayoutConfirmModal: React.FC<PayoutConfirmModalProps> = ({
  wallet,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Confirm Payout</h2>

        <div className="mb-6 space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Owner</span>
            <span className="font-medium">{wallet.ownerName}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{wallet.email}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Current Balance</span>
            <span className="font-medium text-green-700">₹{wallet.balance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">Pending Payout</span>
            <span className="font-medium text-yellow-700">₹{wallet.pendingPayout.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Withdrawn So Far</span>
            <span className="font-medium">₹{wallet.totalWithdrawn.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to process the pending payout of{" "}
          <strong>₹{wallet.pendingPayout.toLocaleString()}</strong> to{" "}
          <strong>{wallet.ownerName}</strong>?
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          {wallet.payoutEnabled ? (
            <button
              onClick={() => onConfirm(wallet.id, wallet.ownerId)}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Processing...
                </>
              ) : (
                "Confirm Payout"
              )}
            </button>
          ) : (
            <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm flex items-center gap-1">
              <XCircle size={14} /> Payout Disabled
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const OwnerWalletPage: React.FC = () => {
  const [wallets, setWallets] = useState<OwnerWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<OwnerWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});
  const [clickLocked, setClickLocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWallets, setTotalWallets] = useState(0);
  const itemsPerPage = 5;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchOwnerWallets = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);

      const response = await AdminAuthService.getAllOwnerWallets(
        page,
        itemsPerPage,
        { search: search.trim() }
      );

      if (!response || !response.data) throw new Error("Failed to fetch wallets");

      setTotalWallets(response.total || 0);

      const mappedWallets: OwnerWallet[] = response.data.map((wallet: any) => ({
        id: wallet._id,
        ownerId: wallet.userId?._id,
        ownerName: wallet.userId?.fullName || wallet.userId?.name || "Unknown",
        email: wallet.userId?.email || "N/A",
        balance: wallet.balance ?? 0,
        pendingPayout: wallet.pendingPayout ?? 0,
        totalWithdrawn: wallet.totalWithdrawn ?? 0,
        payoutEnabled: wallet.userId?.payoutEnabled ?? false,
        createdAt: new Date(wallet.createdAt),
      }));

      setWallets(mappedWallets);
    } catch (err) {
      setError("Error fetching wallets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchOwnerWallets(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchOwnerWallets]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const totalPages = Math.ceil(totalWallets / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePayout = async (walletId: string, ownerId: string, amount: number) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [walletId]: true }));

      const response = await AdminAuthService.processOwnerPayout(ownerId, amount);;

      if (response) {
        setSelectedWallet(null);
        toast.success("Payout processed successfully");
        fetchOwnerWallets(currentPage, debouncedSearchTerm);
      }
    } catch (err) {
      setError("Failed to process payout");
      console.error(err);
      toast.error("Failed to process payout");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [walletId]: false }));
    }
  };

  const getPayoutStatusBadge = (enabled: boolean) => {
    return enabled ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1 w-fit">
        <CheckCircle size={12} /> Enabled
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1 w-fit">
        <XCircle size={12} /> Disabled
      </span>
    );
  };

  const tableData = wallets.map((wallet) => ({
    owner: wallet.ownerName,
    email: wallet.email,
    balance: <span className="font-medium text-gray-800">₹{wallet.balance.toLocaleString()}</span>,
    pendingPayout: (
      <span className={`font-medium ${wallet.pendingPayout > 0 ? "text-yellow-700" : "text-gray-400"}`}>
        ₹{wallet.pendingPayout.toLocaleString()}
      </span>
    ),
    totalWithdrawn: <span className="text-gray-600">₹{wallet.totalWithdrawn.toLocaleString()}</span>,
    payoutEnabled: getPayoutStatusBadge(wallet.payoutEnabled),
    actions: (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (wallet.payoutEnabled && wallet.pendingPayout > 0) {
            setSelectedWallet(wallet);
          } else if (!wallet.payoutEnabled) {
            toast.error("Payout is disabled for this owner");
          } else {
            toast("No pending payout for this owner", { icon: "ℹ️" });
          }
        }}
        className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 ${
          wallet.payoutEnabled && wallet.pendingPayout > 0
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
        disabled={isProcessing[wallet.id] || !wallet.payoutEnabled || wallet.pendingPayout <= 0}
        title={
          !wallet.payoutEnabled
            ? "Payout disabled"
            : wallet.pendingPayout <= 0
            ? "No pending payout"
            : "Process payout"
        }
      >
        {isProcessing[wallet.id] ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : wallet.payoutEnabled && wallet.pendingPayout > 0 ? (
          "Pay"
        ) : (
          "Disabled"
        )}
      </button>
    ),
    _wallet: wallet,
  }));

  const columns: TableColumn[] = [
    { header: "Owner", key: "owner" },
    { header: "Email", key: "email" },
    { header: "Balance", key: "balance" },
    { header: "Pending Payout", key: "pendingPayout" },
    { header: "Total Withdrawn", key: "totalWithdrawn" },
    { header: "Payout Enabled", key: "payoutEnabled" },
    { header: "Actions", key: "actions" },
  ];

  const handleRowView = (rowData: any) => {
    if (clickLocked) return;
    setClickLocked(true);
    setSelectedWallet(rowData._wallet);
    setTimeout(() => setClickLocked(false), 500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Owner Wallets & Payouts</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Owner Wallets & Payouts</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Count / pagination summary */}
      <div className="mb-4 text-sm text-gray-600">
        {searchTerm ? (
          <>
            Showing {wallets.length} results
            {totalWallets > itemsPerPage && ` (page ${currentPage} of ${totalPages})`} for "
            {searchTerm}"
          </>
        ) : (
          <>
            Total Owners: {totalWallets}
            {totalWallets > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}
          </>
        )}
      </div>

      <Table
        columns={columns}
        data={tableData}
        showViewButton={true}
        onView={handleRowView}
        isLoading={loading}
      />

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {selectedWallet && (
      <PayoutConfirmModal
  wallet={selectedWallet}
  onClose={() => setSelectedWallet(null)}
  onConfirm={() =>
    handlePayout(selectedWallet.id, selectedWallet.ownerId, selectedWallet.pendingPayout)
  }
  isProcessing={isProcessing[selectedWallet.id] ?? false}
/>
      )}
    </div>
  );
};

export default OwnerWalletPage;