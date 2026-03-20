"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AuthService } from "@/services/customer/authService";
import { useAuthStore } from "@/store/customer/authStore";
import { toast } from "react-hot-toast";
import FileUpload from "@/components/FileUpload";
import { IUser, UserRole } from "@/types/authTypes";
import { profileSchema } from "@/lib/validation";
import { EditProfileModalProps, Address } from "@/types/authTypes";
import LoadingButton from "@/components/common/LoadingButton";

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentPhoneNumber = "",
  currentAddress,
  currentProfileImage = "/images/user.png",
  onClose,
  onProfileUpdated,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber);
  const [address, setAddress] = useState<Address>(
    currentAddress || {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    }
  );
  const { accessToken, user, setAuth } = useAuthStore();
  const [profileImage, setProfileImage] = useState(currentProfileImage);
  const [loading, setLoading] = useState(false);

  const handleImageUploadComplete = (uploadedUrl: string | string[]) => {
    if (typeof uploadedUrl === "string") {
      console.log("Uploaded Image URL:", uploadedUrl);
      setProfileImage(uploadedUrl);
    }
  };

  console.log("Zustand Access Token:", accessToken);
  console.log("Zustand User:", user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { phoneNumber, address, profileImage };

      // Validate data
      const result = profileSchema.safeParse(payload);
      if (!result.success) {
        const errorMessages = result.error.errors.map((err) => err.message).join(", ");
        toast.error(errorMessages);
        setLoading(false);
        return;
      }

      if (!accessToken) {
        console.error("No access token available");
        toast.error("No access token available. Please log in again.");
        setLoading(false);
        return;
      }

      console.log("Validation Passed:", payload);
      const data = await AuthService.updateCustomerProfile(payload);

      // console.log("Updated User from API:", updatedUser);
      const updatedCustomer = data.updatedCustomer;

      const partialUser: IUser = {
        id: updatedCustomer._id||updatedCustomer.id,
        fullName: updatedCustomer.fullName,
        email: updatedCustomer.email,
        phoneNumber: updatedCustomer.phoneNumber,
        address: updatedCustomer.address,
        role: updatedCustomer.role as UserRole,
        profileImage: updatedCustomer.profileImage ?? "/images/user.png",
      };

      console.log("Partial User Before Zustand:", partialUser);
      setAuth(partialUser, accessToken);

      toast.success("Profile updated successfully");

      onProfileUpdated(phoneNumber, address, profileImage !== currentProfileImage ? profileImage : undefined);
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <Image
                src={profileImage}
                alt="customerImage"
                width={80}
                height={80}
                className="rounded-full border"
              />
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          <div className="text-center">
            <FileUpload onUploadComplete={handleImageUploadComplete} accept="image/*" multiple={false} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

  
          {Object.entries(address).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

    
          <div className="flex justify-end space-x-2 mt-4">
            <LoadingButton type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
              Cancel
            </LoadingButton>
            <LoadingButton type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;


















