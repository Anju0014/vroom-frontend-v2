
"use client";

import React, { useEffect, useState } from "react";
import { OwnerAuthService } from "@/services/carOwner/authService";
import EditProfileModal from "@/components/carOwner/dashboard/EditProfileModal";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { FileText, Eye, AlertTriangle, Edit, Lock } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { Address, CarOwner } from "@/types/authTypes";
import ChangePasswordModal from "@/components/Changepassword";
import CompleteRegistrationForm from "@/components/carOwner/dashboard/CompleteRegistrationForm";
import LoadingButton from "@/components/common/LoadingButton";

const ProfilePage = () => {
  const [ownerDetails, setOwnerDetails] = useState<CarOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChange, setIsChange] = useState(false);
  const [idProof, setIdProof] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<number|null>(0);
  const [processStatus, setProcessStatus] = useState<number|null>(0);
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("calling")
        const data = await OwnerAuthService.getOwnerProfile();
        console.log("data",data)
        setOwnerDetails(data.carOwner);
        setIdProof(data.carOwner.idProof || null);
        console.log(data.carOwner.idProof)
        setProcessStatus(data.carOwner.processStatus); 
        setVerifyStatus(data.carOwner.verifyStatus);
        if (data.carOwner.verifyStatus === -1) {
          setRejectReason(data.carOwner.rejectionReason);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdated = (newPhoneNumber: string, newAddress: Address, newProfileImage?: string) => {
    if (ownerDetails) {
      setOwnerDetails({ 
        ...ownerDetails, 
        phoneNumber: newPhoneNumber, 
        address: newAddress, 
        profileImage: newProfileImage || ownerDetails.profileImage 
      });
    }
  };

  const handleRegistrationCompleted = () => {
  setProcessStatus(2);   
  setVerifyStatus(0);    
};

  const handleUploadComplete = async (uploadedUrl: string | string[]) => {
    try {
      if (typeof uploadedUrl === "string") {
        await OwnerAuthService.updateOwnerIdProof({ idProof: uploadedUrl });
        setIdProof(uploadedUrl);
        toast.success("ID Proof uploaded successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile with ID Proof:", error);
      toast.error("Failed to update ID Proof");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="flex items-center justify-center h-20">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!ownerDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Failed to load profile.</p>
      </div>
    );
  }

  // Show "Complete Your Registration" form if not verified
  if (verifyStatus === 0 && processStatus === 1) {
    return <CompleteRegistrationForm ownerDetails={ownerDetails} onCompleted={handleRegistrationCompleted} />;
  }

  if (verifyStatus === 0 && processStatus === 2) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 shadow-lg rounded-md text-center max-w-xl">
          <AlertTriangle className="text-yellow-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Verification Pending</h2>
          <p className="text-gray-600 mt-2">
            Your account is under review. You will gain full access once the verification process is completed.
          </p>
        </div>
      </div>
    );
  }

  // Show rejection message if processStatus = 1 and verifyStatus = -1
  if (verifyStatus === -1 && processStatus === 2) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 shadow-lg rounded-md text-center">
          <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600">Verification Rejected</h2>
          <p className="text-gray-600 mt-2">
            Your previous verification request was rejected. Please complete your registration again.
            {rejectReason && <span className="block mt-2 font-semibold text-red-500">Reason: {rejectReason}</span>}
          </p>
         
          <div className="mt-4">
            <CompleteRegistrationForm ownerDetails={ownerDetails}  onCompleted={handleRegistrationCompleted} />
          </div>
           </div>
        
      </div>
    );
  }

  // Show the normal profile if verified
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile <span> (Car Owner)</span></h1>
          <div className="flex space-x-3">
            <LoadingButton
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </LoadingButton>
            <LoadingButton
              onClick={() => setIsChange(true)} 
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
            >
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </LoadingButton>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8 pb-6 border-b border-gray-200">
          <div className="relative">
            <Image
              src={ownerDetails.profileImage || "/images/user.png"}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-gray-100 shadow"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{ownerDetails.fullName}</h2>
            <p className="text-gray-500">{ownerDetails.email}</p>
            <p className="text-gray-500 mt-1">{ownerDetails.phoneNumber || "No phone number added"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Personal Details</h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-gray-500">Full Name</span>
                <span className="block font-medium">{ownerDetails.fullName}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Email Address</span>
                <span className="block font-medium">{ownerDetails.email}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Phone Number</span>
                <span className="block font-medium">{ownerDetails.phoneNumber || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Address</h3>
            {ownerDetails.address ? (
              <div className="space-y-1">
                <p className="font-medium">{ownerDetails.address.addressLine1}</p>
                {ownerDetails.address.addressLine2 && <p>{ownerDetails.address.addressLine2}</p>}
                <p>
                  {ownerDetails.address.city}, {ownerDetails.address.state} - {ownerDetails.address.postalCode}
                </p>
                <p>{ownerDetails.address.country}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No address information available</p>
            )}
          </div>
        </div>

        {isEditing && (
          <EditProfileModal
            currentProfileImage={ownerDetails?.profileImage}
            currentPhoneNumber={ownerDetails?.phoneNumber}
            currentAddress={ownerDetails?.address}
            onClose={() => setIsEditing(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </div>

      <ChangePasswordModal isOpen={isChange} onClose={() => setIsChange(false)} role="carOwner" />

      <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="mr-2 text-blue-500" />
            ID Proof Document
          </h2>
          {idProof && (
            <a
              href={idProof}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
            >
              <Eye className="mr-1" size={18} />
              View Document
            </a>
          )}
        </div>

        {idProof ? (
          <div className="bg-green-50 p-4 rounded-lg flex items-center">
            <FileText className="text-green-600 mr-3" />
            <p className="text-green-700">ID Proof document uploaded successfully</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg">
            <FileUpload
              accept="image/*,application/pdf"
              multiple={false}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;