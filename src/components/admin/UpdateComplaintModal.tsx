// "use client";

// import { useState } from "react";
// import { X, User, Mail, Calendar, Tag, AlertCircle, Clock, FileText, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react";
// import { ComplaintStatus,ComplaintPriority,UpdateComplaintModalProps } from "@/types/complaintTypes";
// import LoadingButton from "../common/LoadingButton";


// export default function UpdateComplaintModal({
//   complaint,
//   onClose,
//   onUpdated
// }: UpdateComplaintModalProps) {
//   const [status, setStatus] = useState<ComplaintStatus>(complaint.status as ComplaintStatus);
//   const [priority, setPriority] = useState<ComplaintPriority>(complaint.priority as ComplaintPriority);
//   const [response, setResponse] = useState(complaint.adminResponse || "");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const formatDate = (date: string) => {
//     return new Intl.DateTimeFormat('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     }).format(new Date(date));
//   };

//   const handleSubmit = async () => {
//     if (isSubmitting) return;
    
//     setIsSubmitting(true);
    
//     setTimeout(() => {
//       setIsSubmitting(false);
//       onUpdated();
//       onClose();
//     }, 1500);
//   };

//   const handleBackdropClick = (e: React.MouseEvent) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   const getStatusConfig = (status: string) => {
//     const configs = {
//       open: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", icon: AlertCircle },
//       in_review: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", icon: Clock },
//       resolved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", icon: CheckCircle },
//       rejected: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", icon: XCircle },
//     };
//     return configs[status as keyof typeof configs] || configs.open;
//   };

//   const getPriorityConfig = (priority: string) => {
//     const configs = {
//       low: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
//       medium: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
//       high: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
//     };
//     return configs[priority as keyof typeof configs] || configs.medium;
//   };

//   const currentStatusConfig = getStatusConfig(status);
//   const currentPriorityConfig = getPriorityConfig(priority);
//   const StatusIcon = currentStatusConfig.icon;

//   return (
//     <div 
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={handleBackdropClick}
//     >
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-3">
//               <div className="bg-white/20 p-2 rounded-lg">
//                 <StatusIcon className="w-6 h-6" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Complaint Details</h2>
//                 <p className="text-blue-100 text-sm mt-0.5">Review and update complaint status</p>
//               </div>
//             </div>
//             <LoadingButton
//               onClick={onClose} 
//               className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
//             >
//               <X className="w-6 h-6" />
//             </LoadingButton>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto px-6 py-6">
//           <div className="flex gap-3 mb-6">
//             <div className={`${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border} border-2 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm`}>
//               <StatusIcon className="w-4 h-4" />
//               {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
//             </div>
//             <div className={`${currentPriorityConfig.bg} ${currentPriorityConfig.text} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm`}>
//               <div className={`w-2 h-2 rounded-full ${currentPriorityConfig.dot} animate-pulse`}></div>
//               {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
//             </div>
//           </div>


//           <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
//             <div className="flex items-center gap-2 mb-4">
//               <FileText className="w-5 h-5 text-blue-600" />
//               <h3 className="font-bold text-gray-900 text-lg">{complaint.title}</h3>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div className="bg-white rounded-lg p-3 border border-blue-100">
//                 <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
//                   <Tag className="w-3.5 h-3.5 text-blue-500" />
//                   <span className="font-medium">Category</span>
//                 </div>
//                 <p className="text-gray-900 font-semibold">{complaint.category}</p>
//               </div>
//               <div className="bg-white rounded-lg p-3 border border-blue-100">
//                 <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
//                   <Calendar className="w-3.5 h-3.5 text-blue-500" />
//                   <span className="font-medium">Date Submitted</span>
//                 </div>
//                 <p className="text-gray-900 font-semibold">{formatDate(complaint.createdAt)}</p>
//               </div>
//             </div>
//           </div>

//             {complaint.description && (
//               <div>
//                 <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
//                   <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
//                   <span className="font-medium">Description</span>
//                 </div>
//                 <div className="bg-white rounded-lg p-4 border border-blue-100">
//                   <p className="text-gray-700 leading-relaxed text-sm">{complaint.description}</p>
//                 </div>
//               </div>
//             )}

//             {complaint.complaintProof && (
//               <div className="mt-4 pt-4 border-t border-blue-200">
//                 <div className="flex items-center gap-2 text-gray-600 text-xs mb-3">
//                   <Eye className="w-3.5 h-3.5 text-blue-500" />
//                   <span className="font-medium">Attachments</span>
//                 </div>
//                 <a
//                   href={complaint.complaintProof}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-md"
//                 >
//                   <Eye size={16} />
//                   View Document
//                 </a>
//               </div>
//             )}

//               {complaint.complaintProof && (
//             <div className="mb-6">
//               <h3 className="text-lg font-medium mb-4"> Attachments</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <a
//               href={complaint.complaintProof}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
//             >
//               <Eye className="mr-1" size={18} />
//               View Document
//             </a>
//               </div>
//             </div>
//           )}
//           </div>


//           {complaint.raisedByUser && (
//             <div className="bg-white border-2 border-blue-100 rounded-xl p-5 mb-6 shadow-sm">
//               <h3 className="font-bold text-blue-700 mb-4 text-lg flex items-center gap-2">
//                 <User className="w-5 h-5" />
//                 User Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-100">
//                   <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
//                     <User className="w-3.5 h-3.5 text-blue-500" />
//                     <span className="font-medium">Full Name</span>
//                   </div>
//                   <p className="text-gray-900 font-semibold">{complaint.raisedByUser.fullName}</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-100">
//                   <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
//                     <Mail className="w-3.5 h-3.5 text-blue-500" />
//                     <span className="font-medium">Email Address</span>
//                   </div>
//                   <p className="text-gray-900 font-semibold text-sm break-all">{complaint.raisedByUser.email}</p>
//                 </div>
//               </div>
//             </div>
//           )}


//           <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5 shadow-sm">
//             <h3 className="font-bold text-blue-700 mb-4 text-lg flex items-center gap-2">
//               <MessageSquare className="w-5 h-5" />
//               Update Complaint
//             </h3>
            
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className=" text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
//                     <AlertCircle className="w-4 h-4 text-blue-600" />
//                     Status
//                   </label>
//                   <select
//                     value={status}
//                     onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
//                     className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all"
//                   >
//                     <option value="open">Open</option>
//                     <option value="in_review">In Review</option>
//                     <option value="resolved">Resolved</option>
//                     <option value="rejected">Rejected</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
//                     <Tag className="w-4 h-4 text-blue-600" />
//                     Priority
//                   </label>
//                   <select
//                     value={priority}
//                     onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
//                     className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all"
//                   >
//                     <option value="low">Low</option>
//                     <option value="medium">Medium</option>
//                     <option value="high">High</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className=" text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
//                   <MessageSquare className="w-4 h-4 text-blue-600" />
//                   Admin Response
//                 </label>
//                 <textarea
//                   value={response}
//                   onChange={(e) => setResponse(e.target.value)}
//                   placeholder="Provide your detailed response to the complaint..."
//                   rows={4}
//                   className="w-full px-4 py-3 text-sm bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>


//         <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3">
//           <LoadingButton
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="px-6 py-2.5 text-sm text-gray-700 font-semibold bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
//           >
//             Cancel
//           </LoadingButton>
//           <LoadingButton
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//             className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
//           >
//             {isSubmitting && (
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//             )}
//             {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
//           </LoadingButton>
//         </div>
//       </div>
      
  
//   );
// }


"use client";

import { useState } from "react";
import { X, User, Mail, Calendar, Tag, AlertCircle, Clock, FileText, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react";
import { ComplaintStatus,ComplaintPriority,UpdateComplaintModalProps } from "@/types/complaintTypes";
import LoadingButton from "../common/LoadingButton";


export default function UpdateComplaintModal({
  complaint,
  onClose,
  onUpdated
}: UpdateComplaintModalProps) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status as ComplaintStatus);
  const [priority, setPriority] = useState<ComplaintPriority>(complaint.priority as ComplaintPriority);
  const [response, setResponse] = useState(complaint.adminResponse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      onUpdated();
      onClose();
    }, 1500);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      open: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", icon: AlertCircle },
      in_review: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", icon: Clock },
      resolved: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", icon: XCircle },
    };
    return configs[status as keyof typeof configs] || configs.open;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      low: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
      medium: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
      high: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const currentStatusConfig = getStatusConfig(status);
  const currentPriorityConfig = getPriorityConfig(priority);
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complaint Details</h2>
                <p className="text-blue-100 text-sm mt-0.5">Review and update complaint status</p>
              </div>
            </div>
            <button
              onClick={onClose} 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Status and Priority Badges */}
          <div className="flex gap-3 mb-6">
            <div className={`${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border} border-2 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm`}>
              <StatusIcon className="w-4 h-4" />
              {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            <div className={`${currentPriorityConfig.bg} ${currentPriorityConfig.text} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm`}>
              <div className={`w-2 h-2 rounded-full ${currentPriorityConfig.dot} animate-pulse`}></div>
              {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
            </div>
          </div>

          {/* Complaint Details */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-lg">{complaint.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">Category</span>
                </div>
                <p className="text-gray-900 font-semibold">{complaint.category}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">Date Submitted</span>
                </div>
                <p className="text-gray-900 font-semibold">{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            {/* Description */}
            {complaint.description && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">Description</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-gray-700 leading-relaxed text-sm">{complaint.description}</p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {complaint.complaintProof && (
              <div className="pt-4 border-t border-blue-200">
                <div className="flex items-center gap-2 text-gray-600 text-xs mb-3">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">Attachments</span>
                </div>
                <a
                  href={complaint.complaintProof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-md"
                >
                  <Eye size={16} />
                  View Document
                </a>
              </div>
            )}
          </div>

          {/* User Information */}
          {complaint.raisedByUser && (
            <div className="bg-white border-2 border-blue-100 rounded-xl p-5 mb-6 shadow-sm">
              <h3 className="font-bold text-blue-700 mb-4 text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium">Full Name</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{complaint.raisedByUser.fullName}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium">Email Address</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm break-all">{complaint.raisedByUser.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Update Form */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-blue-700 mb-4 text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Update Complaint
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all"
                  >
                    <option value="open">Open</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-blue-600" />
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Admin Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Provide your detailed response to the complaint..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4 flex justify-end gap-3">
          <LoadingButton
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm text-gray-700 font-semibold bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}