
"use client";
import React, { useEffect, useState } from "react";
import { AuthService } from "@/services/customer/authService";
import EditProfileModal from "@/components/customer/dashboard/EditProfileModal";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { FileText, Eye, Edit, Lock } from 'lucide-react';
import FileUpload from "@/components/FileUpload";
import ChangePasswordModal from "@/components/Changepassword";
import LoadingButton from "@/components/common/LoadingButton";
import { Customer , Address } from "@/types/profileType";

const ProfilePage = () => {
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [idProof, setIdProof] = useState<string | null>(null);
  const [isChangePassword, setIsChangePassword] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await AuthService.getCustomerProfile();
        setCustomerDetails(data.customer);
        console.log(data.customer)
        setIdProof(data.customer.idProof || null);
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
    if (customerDetails) {
      setCustomerDetails({ 
        ...customerDetails, 
        phoneNumber: newPhoneNumber, 
        address: newAddress, 
        profileImage: newProfileImage || customerDetails.profileImage 
      });
    }
  };

  const handleUploadComplete = async (uploadedUrl: string | string[]) => {
    try {
      if (typeof uploadedUrl === "string") {
        await AuthService.updateCustomerIdProof({ idProof: uploadedUrl });
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
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      
    );
  }

  if (!customerDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-200 to-yellow-200 p-10 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            My Profile
          </h1>
        </div>

        <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
          <div className="flex justify-end items-center mb-6">
            <div className="flex space-x-3">
              <LoadingButton
                onClick={() => setIsEditing(true)} 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center shadow-sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </LoadingButton>
              <LoadingButton
                onClick={() => setIsChangePassword(true)} 
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center shadow-sm"
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </LoadingButton>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8 pb-6 border-b border-gray-200">
            <div className="relative">
             
              <Image
                src={customerDetails.profileImage || "/images/user.png"}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-gray-100 shadow"
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{customerDetails.fullName}</h2>
              <p className="text-gray-500">{customerDetails.email}</p>
              <p className="text-gray-500 mt-1">{customerDetails.phoneNumber || "No phone number added"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Personal Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="block text-xs text-gray-500">Full Name</span>
                  <span className="block font-medium">{customerDetails.fullName}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Email Address</span>
                  <span className="block font-medium">{customerDetails.email}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-500">Phone Number</span>
                  <span className="block font-medium">{customerDetails.phoneNumber || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Address</h3>
              {customerDetails.address ? (
                <div className="space-y-1">
                  <p className="font-medium">{customerDetails.address.addressLine1}</p>
                  {customerDetails.address.addressLine2 && <p>{customerDetails.address.addressLine2}</p>}
                  <p>
                    {customerDetails.address.city}, {customerDetails.address.state} - {customerDetails.address.postalCode}
                  </p>
                  <p>{customerDetails.address.country}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No address information available</p>
              )}
            </div>
          </div>

          {isEditing && (
            <EditProfileModal
              currentProfileImage={customerDetails.profileImage}
              currentPhoneNumber={customerDetails.phoneNumber}
              currentAddress={customerDetails.address}
              onClose={() => setIsEditing(false)}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </div>

        <ChangePasswordModal 
          isOpen={isChangePassword} 
          onClose={() => setIsChangePassword(false)} 
          role="customer" 
        />
       
        <div className="max-w-4xl mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FileText className="mr-2 text-blue-500" />
              ID Proof Document (Driving License)
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
              <FileText className="text-green-600 mr-3" size={24} />
              <p className="text-green-700">ID Proof uploaded successfully</p>
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
    </div>
  );
};

export default ProfilePage;