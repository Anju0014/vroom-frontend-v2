
import React, { useEffect, useState } from "react";
import { X, User, Mail, Phone, MapPin, FileText, Shield, AlertCircle } from "lucide-react";
import LoadingButton from "../common/LoadingButton";

interface UserDetailsModalProps {
  user: any;
  onClose: () => void;
  onToggleBlock: (user: any) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
  onToggleBlock,
}) => {
  const [updatedUser, setUpdatedUser] = useState(user);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setUpdatedUser(user);
  }, [user]);

    const formatAddress = (address: any) => {
    if (!address) return "Not provided";
    return [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ]
      .filter(Boolean)
      .join(", ");
  };

  const handleToggleBlock = async () => {
    setIsProcessing(true);
    try {
      await onToggleBlock(updatedUser);
    } finally {
      setIsProcessing(false);
    }
  };

  const InfoCard = ({ icon: Icon, label, value, fullWidth = false }: any) => (
    <div className={`bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-lg p-4 ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
        <Icon size={16} className="text-blue-500" />
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-gray-900 font-semibold text-sm break-words">{value}</p>
    </div>
  );

  return (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                bg-black/30 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Car Owner Details</h2>
            <p className="text-blue-100 text-sm">Review owner information and status</p>
          </div>
          <LoadingButton
            onClick={onClose} 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <X size={24} />
          </LoadingButton>
        </div>

      
          <div className="p-6 overflow-y-auto flex-1">
        
          <div className="mb-6 flex items-center gap-3">
            <Shield size={24} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500 mb-1">Verification Status</p>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getStatusText(updatedUser.verifyStatus).color}`}>
                {getStatusText(updatedUser.verifyStatus).icon}
                <span className="ml-2">{getStatusText(updatedUser.verifyStatus).text}</span>
              </span>
            </div>
          </div>

      
          <div className="mb-6">
            <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <User size={20} />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={User} label="Full Name" value={updatedUser.name} />
              <InfoCard icon={Mail} label="Email Address" value={updatedUser.email} />
            </div>
          </div>

      
          <div className="mb-6">
            <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <Phone size={20} />
              Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                icon={Phone} 
                label="Primary Phone" 
                value={updatedUser.phoneNumber || "Not provided"} 
              />
              <InfoCard 
                icon={Phone} 
                label="Alternate Phone" 
                value={updatedUser.altPhoneNumber || "Not provided"} 
              />
            </div>
          </div>

   
          <div className="mb-6">
            <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <InfoCard 
                icon={MapPin} 
                label="Complete Address" 
                value={formatAddress(updatedUser.address)} 
                fullWidth={true}
              />
            </div>
          </div>

          {updatedUser.document && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Document Verification
              </h3>
              <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <FileText size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Identity Proof Document</p>
                      <p className="text-sm text-gray-500">Click to view uploaded document</p>
                    </div>
                  </div>
                  <a 
                    href={updatedUser.document} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-sm shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View Document
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t-2 border-gray-200">
            <LoadingButton
              onClick={handleToggleBlock}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2
                ${updatedUser.blockStatus === 1 
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" 
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  {updatedUser.blockStatus === 1 ? (
                    <>
                      <Shield size={20} />
                      Unblock User
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} />
                      Block User
                    </>
                  )}
                </>
              )}
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

const getStatusText = (verifyStatus: number) => {
  switch (verifyStatus) {
    case -1: return { text: "Rejected", color: "bg-red-50 text-red-600" ,icon: <X size={16} />};
    case 0: return { text: "Not Verified", color: "bg-yellow-50 text-yellow-600" , icon: <AlertCircle size={16} />};
    case 1: return { text: "Fully Verified", color: "bg-green-50 text-green-600" ,icon: <Shield size={16} />};
    default: return { text: "Unknown", color: "bg-gray-100 text-gray-600" , icon: <AlertCircle size={16} />};
  }
};

