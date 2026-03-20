'use client';

import React, { useCallback, useEffect, useState } from "react";
import { AdminAuthService } from "@/services/admin/adminService";
import UpdateComplaintModal from "@/components/admin/UpdateComplaintModal";
import Pagination from "@/components/pagination";
import toast from "react-hot-toast";
import { ComplaintAdminResponseDTO } from "@/types/complaintTypes";
import { Table, TableColumn } from "@/components/admin/Table";
import { useDebounce } from "@/hooks/useDebounce";

const AdminComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintAdminResponseDTO[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintAdminResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickLocked, setClickLocked] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const itemsPerPage = 5;
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchComplaints = useCallback(async (page: number, search: string) => {
    try {
      setLoading(true);
      
      const response = await AdminAuthService.getAllComplaints(
        page,
        itemsPerPage,
        { search: search.trim() }
      );
       console.log("response",response)
      
      if (!response) throw new Error("Failed to fetch complaints");
      
      setComplaints(response.complaints);
      setTotalComplaints(response.total || 0);
    } catch (err) {
      setError("Error fetching complaints");
      console.error(err);
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchComplaints(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchComplaints]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalComplaints / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      open: "bg-blue-100 text-blue-800",
      in_review: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    
    const style = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800";
    const displayText = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return (
      <span className={`px-2 py-1 ${style} rounded-full text-xs font-medium`}>
        {displayText}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800",
    };
    
    const style = priorityStyles[priority as keyof typeof priorityStyles] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`px-2 py-1 ${style} rounded-full text-xs font-medium`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const totalPages = Math.ceil(totalComplaints / itemsPerPage);

  const tableData = complaints.map(complaint => ({
    title: complaint.title,
    category: complaint.category,
    userName: complaint?.raisedByUser?.fullName || "Unknown User",
    statusBadge: getStatusBadge(complaint.status),
    priorityBadge: getPriorityBadge(complaint.priority),
    formattedDate: formatDate(complaint.createdAt),
    _complaint: complaint,
  }));

  const columns: TableColumn[] = [
    { header: "Title", key: "title" },
    { header: "Category", key: "category" },
    { header: "User", key: "userName" },
    { header: "Status", key: "statusBadge" },
    { header: "Priority", key: "priorityBadge" },
    { header: "Created", key: "formattedDate" },
  ];

  const handleViewComplaint = (rowData: any) => {
    if (clickLocked) return;
    setClickLocked(true);
    setSelectedComplaint(rowData._complaint);
    setTimeout(() => setClickLocked(false), 500);
  };

  const handleComplaintUpdated = () => {
    fetchComplaints(currentPage, debouncedSearchTerm);
    setSelectedComplaint(null);
    toast.success("Complaint updated successfully");
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Complaint Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Complaint Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by title or category"
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
        {searchTerm ? (
          <>Showing {complaints.length} results{totalComplaints > itemsPerPage && ` (page ${currentPage} of ${totalPages})`} for "{searchTerm}"</>
        ) : (
          <>Total complaints: {totalComplaints}{totalComplaints > itemsPerPage && ` (page ${currentPage} of ${totalPages})`}</>
        )}
      </div>

      <Table
        columns={columns}
        data={tableData}
        showViewButton={true}
        onView={handleViewComplaint}
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

      {selectedComplaint && (
        <UpdateComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdated={handleComplaintUpdated}
        />
      )}
    </div>
  );
};

export default AdminComplaintsPage;