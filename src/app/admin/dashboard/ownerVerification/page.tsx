
'use client';

import React, { useCallback, useEffect, useState } from "react";
import { Table, TableColumn } from "@/components/admin/Table";
import { AdminAuthService } from "@/services/admin/adminService";
import toast from "react-hot-toast";
import UserVerifyModal from "@/components/admin/UserVerifyModal";
import { Eye } from "lucide-react";
import Pagination from "@/components/pagination";
import { useDebounce } from "@/hooks/useDebounce";

interface User {
  id: string;
  name: string;
  email: string;
  document: string;
  verifyStatus: number;
  blockStatus: number;
  processStatus: number;
  createdAt: Date;
  phoneNumber?: string;
  altPhoneNumber?: string;
  address?: any;
}

interface OwnerVerifyProps {
  userType: "owner";
}

const OwnerVerifyPage: React.FC<OwnerVerifyProps> = ({ userType }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});
    const [clickLocked, setClickLocked] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
        const [currentPage, setCurrentPage] = useState(1);
        const [totalOwners, setTotalOwners] = useState(0);
        const itemsPerPage = 5;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);



  const fetchUnVerifiedOwners = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      
      const response = await AdminAuthService.getAllOwnerforVerify(page, 
        itemsPerPage, 
        { search: search.trim()});

      if (!response || !response.data) throw new Error("Failed to fetch users");

       setTotalOwners(response.total || 0);
       console.log(response.data)
      const filteredUsers = response.data
        .map((user: any) => ({
          id: user._id,
          name: user.fullName,
          email: user.email,
          document: user.idProof,
          verifyStatus: user.verifyStatus,
          blockStatus: user.blockStatus,
          processStatus: user.processStatus,
          createdAt: new Date(user.createdAt),
          phoneNumber: user.phoneNumber || undefined,
          altPhoneNumber: user.altPhoneNumber || undefined,
          address: user.address || undefined,
        }));

        console.log("filter",filteredUsers)
      setUsers(filteredUsers);
      
    } catch (err) {
      setError("Error fetching users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  },[itemsPerPage]);

    useEffect(() => {
            setCurrentPage(1);
          }, [debouncedSearchTerm]);
     
      useEffect(() => {
        fetchUnVerifiedOwners(currentPage, debouncedSearchTerm);
      }, [currentPage, debouncedSearchTerm, fetchUnVerifiedOwners]);

 const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
      };
      const totalPages = Math.ceil(totalOwners / itemsPerPage);
    
      const handlePageChange = (page: number) => {
        if (page >= 1 && page <= Math.ceil(totalOwners / itemsPerPage)) {
          setCurrentPage(page);
        }
      };
    
  const handleVerifyUser = async (userId: string, reason?: string) => {
    try {
      setIsProcessing((prev) => ({ ...prev, [userId]: true }));

      const newStatus = reason ? -1 : 1;
      
      const response = await AdminAuthService.updateVerifyStatus(
        userId, 
        newStatus, 
        userType,
        reason
      );
      
      if (response) {
      
        setUsers((prevUsers) => 
          prevUsers.filter((user) => user.id !== userId)
        );
        
   
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
        }
        
        toast.success(
          newStatus === 1 
            ? "User verified successfully" 
            : "User rejected successfully"
        );
        
     
        fetchUnVerifiedOwners(currentPage, debouncedSearchTerm);
      }
    } catch (err) {
      setError(reason ? "Failed to reject user" : "Failed to verify user");
      console.error(err);
    } finally {
      setIsProcessing((prev) => ({ ...prev, [userId]: false }));
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
    status: getStatusBadge(user.verifyStatus),
    joined: formatDate(user.createdAt),
    actions: (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedUser(user);
        }}
        className="p-2 rounded text-blue-600 hover:bg-blue-100 flex items-center justify-center"
        title="View Details"
        disabled={isProcessing[user.id]}
      >
        <Eye size={18} />
      </button>
    ),
    _user: user
  }));


  const columns: TableColumn[] = [
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Status", key: "status" },
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
        <h1 className="text-2xl font-bold mb-6">Car Owner Verification</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Car Owner Verification
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
            onChange={handleSearchChange}
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
              <>Showing {users.length} results{totalOwners > itemsPerPage && ` (page ${currentPage} of ${totalPages})`} for "{searchTerm}"</>
            ) : (
              <>Total Owners: {totalOwners}{totalOwners > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}</>
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
        <UserVerifyModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onVerifyUser={handleVerifyUser}
        />
      )}
    </div>
  );
};

export default OwnerVerifyPage;