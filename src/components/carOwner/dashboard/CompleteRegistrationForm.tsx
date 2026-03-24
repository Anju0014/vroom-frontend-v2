"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { ownerRegisterSchema } from "@/lib/validation";
import { OwnerAuthService } from "@/services/carOwner/authService";
import InputField from "@/components/InputField";
import FileUpload from "@/components/FileUpload";
import { Address, CarOwner } from "@/types/authTypes";
import LoadingButton from "@/components/common/LoadingButton";
import Image from "next/image";

interface CompleteRegistrationFormProps {
  ownerDetails: CarOwner;
  onCompleted: () => void; 
}

const CompleteRegistrationForm: React.FC<CompleteRegistrationFormProps> = ({ ownerDetails,onCompleted }) => {
  const [formData, setFormData] = useState({
    phoneNumber: ownerDetails.phoneNumber || "",
    altPhoneNumber: "",
    idProof: ownerDetails.idProof || "",
    address: ownerDetails.address || { addressLine1: "", city: "", state: "", postalCode: "", country: "" },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1]; // Extracts 'addressLine1', 'city', etc.
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (uploadedUrl: string | string[]) => {
    if (typeof uploadedUrl === "string") {
      setFormData((prev) => ({ ...prev, idProof: uploadedUrl }));
      toast.success("ID Proof uploaded successfully!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("hihihi,,,,,,ojojo")

    console.log("before Error", formData)
    const result = ownerRegisterSchema.safeParse(formData);
    if (!result.success) {
        const errorMessages = result.error.errors.map((err) => err.message).join(", ");
        setError(errorMessages);
        toast.error(errorMessages);
        return;
      }

    setLoading(true);
    try {
        console.log("reg")
      await OwnerAuthService.completeRegistration(formData);
      console.log("rogggg")
      toast.success("Registration completed successfully!");
      onCompleted();  
     
    //   window.location.reload();
    } catch (error) {
      console.error("Failed to complete registration:", error);
      toast.error("Failed to complete registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Registration</h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

     

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Phone Number *" name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} placeholder="Enter your primary phone number"   className="focus:ring-blue-500 focus:border-blue-500"/>
        <InputField label="Alternate Phone Number" name="altPhoneNumber" type="text" value={formData.altPhoneNumber} onChange={handleChange}  placeholder="Enter an alternate phone number (optional)"  className="focus:ring-blue-500 focus:border-blue-500"  />

        <div>
          <label className="block font-semibold text-gray-700">Upload ID Proof *</label>
          {formData.idProof && 
          <img
            src={`formData.idProof`}
           alt="idProof"/>}

          <FileUpload accept="image/*,application/pdf" multiple={false} onUploadComplete={handleFileUpload} />
          {formData.idProof && <p className="text-green-600 mt-1">File uploaded successfully.</p>}
        </div>

        <h2 className="text-lg font-semibold mt-4">Address</h2>
        <InputField label="Address Line 1 *" name="address.addressLine1" type="text" value={formData.address.addressLine1} onChange={handleChange}  placeholder="House number, street name" className="focus:ring-blue-500 focus:border-blue-500"/>
        <InputField label="City *" name="address.city" type="text" value={formData.address.city} onChange={handleChange} placeholder="Enter your city" className="focus:ring-blue-500 focus:border-blue-500"/>
        <InputField label="State" name="address.state" type="text" value={formData.address.state} onChange={handleChange} placeholder="Enter your state" className="focus:ring-blue-500 focus:border-blue-500"/>
        <InputField label="Postal Code" name="address.postalCode" type="text" value={formData.address.postalCode} onChange={handleChange} placeholder="e.g., 123456" className="focus:ring-blue-500 focus:border-blue-500"/>
        <InputField label="Country *" name="address.country" type="text" value={formData.address.country} onChange={handleChange} placeholder="Enter your country" className="focus:ring-blue-500 focus:border-blue-500"/>

        <LoadingButton type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition" disabled={loading}>
          {loading ? "Submitting..." : "Complete Registration"}
        </LoadingButton>
      </form>
    </div>
  );
};

export default CompleteRegistrationForm;




