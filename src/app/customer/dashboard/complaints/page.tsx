"use client";
import React, { useEffect, useState } from "react";
import { AlertCircle, Plus, X, Clock, CheckCircle, AlertTriangle, Eye, Download } from "lucide-react";
import { complaintService } from "@/services/common/complaintService";
import ComplaintForm from "@/components/common/CompliantForm";
import { Complaint,CreateComplaintDTO } from "@/types/complaintTypes";
import LoadingButton from "@/components/common/LoadingButton";
import Pagination from "@/components/pagination";
import { complaintSchema } from "@/lib/validation";
import toast from "react-hot-toast";
// import { useAuth } from "@/hooks/useAuth";

const ComplaintPage: React.FC = () => {
//   const user = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);
   const itemsPerPage = 3;
  const [formData, setFormData] = useState<CreateComplaintDTO>({
    bookingId: "",
    title: "",
    description: "",
    category: "car",
    complaintProof:"",
  });

  useEffect(() => {
    loadComplaints(currentPage);
  }, [currentPage]);

  const loadComplaints = async (page:number) => {
    const response= await complaintService.getMyComplaints(currentPage, itemsPerPage);
    setComplaints(response.complaints);
    setTotalComplaints(response.total||0)
  };

  const handleDownload = async (url?: string) => {
  try {
    if(url){
    const response = await fetch(url);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "complaint-proof"; 
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(blobUrl);}
  } catch (error) {
    console.error("Download failed", error);
  }
};
  const handleSubmit = async () => {
    setLoading(true);
    const result = complaintSchema.safeParse(formData);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => err.message)
      .join(", ");

    toast.error(errorMessages);
    setLoading(false);
    return;
  }
    try {
      await complaintService.createComplaint(formData);
      await loadComplaints(currentPage);
      setShowForm(false);
      setFormData({
        bookingId: "",
        title: "",
        description: "",
        category: "car",
        complaintProof:"",

      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const totalPages = Math.ceil(totalComplaints / itemsPerPage);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br  from-blue-200 to-yellow-200 p-6">
      <div className="max-w-6xl mx-auto">
  
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-xl mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Complaints</h1>
                <p className="text-blue-100 mt-1">Track and manage your service complaints</p>
              </div>
            </div>
            <LoadingButton
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showForm ? "Cancel" : "New Complaint"}
            </LoadingButton>
          </div>
        </div>

      
        {showForm && (
          <ComplaintForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        )}

    
        <div className="space-y-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-yellow-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800">Your Complaints</h2>
            <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500 to-transparent rounded-full"></div>
          </div>

          {complaints.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No complaints yet</p>
              <p className="text-gray-400 text-sm">Click "New Complaint" to submit one</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 overflow-hidden p-5"
                >
                  
                  <div className="flex items-start gap-4">
                    
                    <div className={`mt-0.5 p-2 rounded-lg border flex-shrink-0 ${getStatusColor(c.status)}`}>
                      {getStatusIcon(c.status)}
                    </div>

                
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{c.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 flex items-center gap-1 ${getStatusColor(c.status)}`}>
                          {c.status.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${getPriorityColor(c.priority)}`}>
                          {c.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1 line-clamp-1">{c.description}</p>

                      
                      {c.adminResponse && (
                        <p className="text-xs text-indigo-600 mt-1 bg-indigo-50 px-2 py-1 rounded-lg line-clamp-1">
                          <span className="font-semibold">Admin:</span> {c.adminResponse}
                        </p>
                      )}
                    </div>

                    
         

{c.complaintProof && (
  <div className="flex items-center gap-2 flex-shrink-0">
    <button
      onClick={() => handleDownload(c.complaintProof)}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors font-medium"
    >
      <Download className="w-3.5 h-3.5" />
      Download
    </button>
  </div>
)}
                  </div>
                </div>
              ))}
          
              {/* {totalPages > 1 && ( */}
                              <div className="flex justify-center">
                                <Pagination
                                  currentPage={currentPage}
                                  totalPages={totalPages}
                                  onPageChange={handlePageChange}
                                />
                              </div>
                            {/* )} */}
                              </div>
          )}

            </div>
            
          
        </div>
      </div>
    
  );
};

export default ComplaintPage;