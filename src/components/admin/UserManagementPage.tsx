'use client';

import React, { useCallback, useEffect, useState } from "react";
import { TableColumn, Table } from "./Table";
import { AdminAuthService } from "@/services/admin/adminService";
import toast from "react-hot-toast";
import UserDetailsModal from "@/components/admin/UserDetailsModal";
import { Shield, ShieldOff, Eye } from "lucide-react";
import Pagination from "../pagination";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  id: string;
  name: string;
  email: string;
  blockStatus: number;
  document: string;
  verifyStatus: number;
  processStatus: number;
  createdAt: Date;
  phoneNumber?: string;
  altPhoneNumber?: string;
  address?: string;
}

interface UserManagementProps {
  userType: "customer" | "owner";
}

const UserManagementPage: React.FC<UserManagementProps> = ({ userType }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});

  const [searchTerm, setSearchTerm] = useState('');
        const [currentPage, setCurrentPage] = useState(1);
        const [totalUsers, setTotalUsers] = useState(0);
        const itemsPerPage = 3;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [clickLocked, setClickLocked] = useState(false);


  const fetchUsers = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      const response = userType === "customer"
        ? await AdminAuthService.getAllCustomers(page, itemsPerPage, { search: search.trim()})
        : await AdminAuthService.getAllCarOwners(page, itemsPerPage, { search: search.trim()});

      if (!response || !response.data) throw new Error("Failed to fetch users");

      const filteredUsers = response.data
        .map((user: any) => ({
          id: user._id||user.id,
          name: user.fullName,
          email: user.email,
          document: user.idProof,
          blockStatus: user.blockStatus || 0,
          processStatus: user.processStatus,
          verifyStatus: user.verifyStatus,
          createdAt: new Date(user.createdAt),
          altPhoneNumber: user.altPhoneNumber || undefined,
          phoneNumber: user.phoneNumber || undefined,
          address: user.address || undefined,
        }));
      setUsers(filteredUsers);
      setTotalUsers(response.total || 0);
    } catch {
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  },[itemsPerPage]);

  useEffect(() => {
              setCurrentPage(1);
            }, [debouncedSearchTerm]);
       
        useEffect(() => {
          fetchUsers(currentPage, debouncedSearchTerm);
        }, [currentPage, debouncedSearchTerm, fetchUsers]);
  
        const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(totalUsers / itemsPerPage)) {
          setCurrentPage(page);
        }
      };

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchTerm(e.target.value);
        };
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const handleToggleBlock = async (user: User) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [user.id]: true }));
      
      const newStatus = user.blockStatus === 0 ? 1 : 0;
      console.log(user.id);
      const response = await AdminAuthService.updateBlockStatus(user.id, newStatus, userType);
      
      if (response) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === user.id 
              ? { ...u, blockStatus: response.user.blockStatus }  
              : u
          )
        );
        
        setSelectedUser((prev) =>
          prev && prev.id === user.id
            ? { ...prev, blockStatus: response.user.blockStatus }
            : prev
        );
        
        toast.success("Updated successfully");
      }
    } catch {
      setError("Failed to update block status");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const getStatusBadge = (verifyStatus: number) => {
    switch (verifyStatus) {
      case -1:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
      case 0:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Not Verified</span>;
      case 1:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Verified</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
    }
  };

  const getBlockStatusBadge = (blockStatus: number) => {
    return blockStatus === 1 ? (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Blocked</span>
    ) : (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  
  const tableData = users.map(user => ({
    name: user.name,
    email: user.email,
    verifyStatus: getStatusBadge(user.verifyStatus),
    blockStatus: getBlockStatusBadge(user.blockStatus),
    joined: formatDate(user.createdAt),
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleBlock(user);
          }}
          disabled={isProcessing[user.id]}
          className={`p-1 rounded ${user.blockStatus === 1 ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'} ${isProcessing[user.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={user.blockStatus === 1 ? "Unblock User" : "Block User"}
        >
          {user.blockStatus === 1 ? <Shield size={18} /> : <ShieldOff size={18} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUser(user);
          }}
          className="p-1 rounded text-blue-600 hover:bg-blue-100"
          title="View Details"
        >
          <Eye size={18} />
        </button>
      </div>
    ),
       _user: user,
    _isBlocked: user.blockStatus === 1
  }));


  const columns: TableColumn[] = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Verify Status", key: "verifyStatus" },
    { header: "Block Status", key: "blockStatus" },
    { header: "Joined", key: "joined" },
    { header: "Actions", key: "actions" }
  ];

  const handleRowView = (rowData: any) => {
    if (clickLocked) return;
     setClickLocked(true);
    setSelectedUser(rowData._user);
    setTimeout(() => setClickLocked(false), 500);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {userType === "customer" ? "Customer Management" : "Car Owner Management"}
        </h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {userType === "customer" ? "Customer Management" : "Car Owner Management"}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}


      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

     <div className="mb-4 text-sm text-gray-600">
        
         <>
            {searchTerm ? (
              <>Showing {users.length} results{totalUsers > itemsPerPage && ` (page ${currentPage} of ${totalPages})`} for "{searchTerm}"</>
            ) : (
              <>Total Owners: {totalUsers}{totalUsers > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}</>
            )}
          </>
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

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onToggleBlock={handleToggleBlock}
        />
      )}
    </div>
  );
};

export default UserManagementPage;