
"use client";
import React, { useState } from "react";
import { Send, X, AlertCircle } from "lucide-react";
import { CreateComplaintDTO } from "@/types/complaintTypes";
import toast from "react-hot-toast";
import FileUpload from "../FileUpload";
import LoadingButton from "./LoadingButton";
import { complaintSchema } from "@/lib/validation";

interface Props {
  formData: CreateComplaintDTO;
  onChange: (e: React.ChangeEvent<any>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ComplaintForm: React.FC<Props> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
}) => {
 

    const handleFileComplaintProofUpload = (uploadedUrl: string | string[]) => {
    if (typeof uploadedUrl === "string") {
      onChange({
        target: {
          name: "complaintProof",
          value: uploadedUrl,
        },
      } as React.ChangeEvent<HTMLInputElement>);

      toast.success("Complaint Proof uploaded successfully!");
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl border-2 border-blue-200 shadow-xl mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Submit Complaint</h2>
        </div>
        <LoadingButton
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </LoadingButton>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Booking ID
            </label>
            <input
              name="bookingId"
              placeholder="Enter booking ID Eg: VROOM-RIDE-1234"
              value={formData.bookingId}
              onChange={onChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
            />
          </div>

        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white"
          >
            <option value="car">Car Issue</option>
            <option value="payment">Payment Issue</option>
            <option value="app">App Issue</option>
            <option value="behavior">Behavior Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Complaint Title
          </label>
          <input
            name="title"
            placeholder="Brief description of the issue"
            value={formData.title}
            onChange={onChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description 
          </label>
          <textarea
            name="description"
            placeholder="Provide detailed information about your complaint attachment"
            value={formData.description}
            onChange={onChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all resize-none"
          />
        </div>

           <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Attachments
          </label>
          <FileUpload accept="image/*,application/pdf" multiple={false} onUploadComplete={handleFileComplaintProofUpload} />
           {formData.complaintProof&& <p className="text-green-600 mt-1">File uploaded successfully.</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <LoadingButton
            disabled={loading}
            onClick={onSubmit}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {loading ? "Submitting..." : "Submit"}
          </LoadingButton>
          <LoadingButton
            onClick={onCancel} 
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Cancel
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
