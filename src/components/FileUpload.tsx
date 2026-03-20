
"use client";

import React, { useState, useRef, useId } from "react";
import { S3Service } from "@/services/common/s3Service";
import { Upload, FileText, Video, Image, Loader2, XCircle } from "lucide-react";
import LoadingButton from "./common/LoadingButton";
import toast from "react-hot-toast";

interface FileUploadProps {
  onUploadComplete: (uploadedUrls: string[] | string) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  children?: React.ReactNode;
   uploadId?: string;
}

export default function FileUpload({
  onUploadComplete,
  accept = "image/*,application/pdf,video/*",
  multiple = false,
  maxFiles = 5,
  uploadId,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uniqueId = useId();
  const componentId = uploadId || uniqueId;

  const getFileTypeMessage = () => {
    if (!accept) return "No files allowed";
    
    const acceptTypes = accept.split(",").map(type => type.trim());
    let message = "";
    
    if (acceptTypes.includes("image/*") || acceptTypes.some(type => type.startsWith("image/"))) {
      message += "Images";
    }
    
    if (acceptTypes.includes("video/*") || acceptTypes.some(type => type.startsWith("video/"))) {
      message += message ? ", Videos" : "Videos";
    }
    
    if (acceptTypes.includes("application/pdf")) {
      message += message ? ", PDFs" : "PDFs";
    }
    
    return multiple
      ? `Supports: ${message} (Max ${maxFiles} files)`
      : `Supports: ${message} (1 file only)`;
  };

  const isFileTypeAllowed = (file: File): boolean => {
    if (!accept) return false;
    
    const acceptTypes = accept.split(",").map(type => type.trim());
    
    return acceptTypes.some(type => {
      if (type.endsWith("/*")) {
        const generalType = type.split("/")[0];
        const fileGeneralType = file.type.split("/")[0];
        return generalType === fileGeneralType;
      }
      return file.type === type;
    });
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    const urls: string[] = [];
    const progressArray: number[] = Array(filesToUpload.length).fill(0);
    setProgress(progressArray);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        //  const { url, key } = await S3Service.getPresignedUrl(file);
         const { url, key } = await S3Service.getPresignedUploadUrl(file);
         console.log(url,key);
        let response=await S3Service.uploadToS3(url, file);
        console.log(response)
        // const uploadedUrl = S3Service.getPublicUrl(key);
         const uploadedUrl =await S3Service.getPresignedViewUrl(key);
         console.log(uploadedUrl)
        urls.push(uploadedUrl);
        
        progressArray[i] = 100;
        setProgress([...progressArray]);
      }
// for (let i = 0; i < filesToUpload.length; i++) {
//     const file = filesToUpload[i];

//     const { url: uploadUrl, key } = await S3Service.getPresignedUploadUrl(file);

//     await S3Service.uploadToS3(uploadUrl, file);

//     const viewUrl = await S3Service.getPresignedViewUrl(key);

//     urls.push(viewUrl);

//     progressArray[i] = 100;
//     setProgress([...progressArray]);
//   }

      setUploadedUrls(urls);
      
      if (multiple) {
        onUploadComplete(urls);
      } else {
        onUploadComplete(urls[0]);
      }
      
      // Clear the files after successful upload
      setSelectedFiles([]);
      setPreviewUrls([]);
      
    } catch (error) {
      console.error("Upload failed:", error);
       toast.error("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let newFiles = Array.from(files);
    
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];
    
    newFiles.forEach(file => {
      if (isFileTypeAllowed(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} file(s) were not of the correct type and were ignored.`);
    }
    
    if (validFiles.length === 0) {
      alert("Please select valid file types.");
      return;
    }

    if (selectedFiles.length + validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setPreviewUrls([...previewUrls, ...newPreviews]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Automatically upload the files
    await uploadFiles(validFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...selectedFiles];
    const updatedPreviews = [...previewUrls];

    URL.revokeObjectURL(previewUrls[index]);
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const getFileTypeIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    
    switch (fileType) {
      case 'image':
        return <Image className="w-4 h-4 text-gray-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-gray-600" />;
      case 'application':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderFilePreview = (file: File, previewUrl: string, index: number) => {
    const fileType = file.type.split('/')[0];
    
    return (
      <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm">
        {fileType === 'image' && (
          <div className="h-24 flex items-center justify-center bg-gray-50">
            <img
              src={previewUrl}
              alt={file.name}
              className="w-full h-24 object-cover"
            />
          </div>
        )}

        {fileType === 'video' && (
          <div className="h-24 bg-gray-100">
            <div className="flex items-center justify-center h-6 bg-gray-200">
              <Video className="w-4 h-4 text-gray-600 mr-1" />
              <span className="text-xs text-gray-600">Video</span>
            </div>
            <video
              src={previewUrl}
              className="w-full h-18 object-cover"
              controls
            />
          </div>
        )}

        {file.type === "application/pdf" && (
          <div className="h-24 flex flex-col items-center justify-center bg-gray-100 p-2">
            <FileText className="w-8 h-8 text-red-500 mb-1" />
            <p className="text-xs text-gray-600 truncate w-full text-center">{file.name}</p>
          </div>
        )}

        <div className="p-1 text-xs bg-gray-50 border-t">
          <div className="flex items-center">
            {getFileTypeIcon(file)}
            <p className="ml-1 truncate">{file.name.substring(0, 18)}{file.name.length > 18 ? '...' : ''}</p>
          </div>
        </div>

        <LoadingButton
          onClick={() => removeFile(index)}
          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
          title="Remove"
        >
          <XCircle className="w-4 h-4" />
        </LoadingButton>
      </div>
    );
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      {uploading ? (
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <Loader2 className="animate-spin" />
          <span>Uploading...</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center space-y-3">
            <Upload className="w-10 h-10 text-blue-500" />
            <p className="text-gray-600">
              <label htmlFor={`fileInput-${componentId}`} className="text-blue-600 cursor-pointer hover:underline">
                Click to browse
              </label>
              {" "}for files
            </p>
            <p className="text-xs text-gray-500">{getFileTypeMessage()}</p>
          </div>

          <input 
            id={`fileInput-${componentId}`}
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
          />

          {selectedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedFiles.map((file, index) => renderFilePreview(file, previewUrls[index], index))}
            </div>
          )}
        </>
      )}
    </div>
  );
}