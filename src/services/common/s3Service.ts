

import api from "@/code/axiosInstance";
import { API_ROUTES } from "@/code/constants/apiRoutes";

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
const REGION = process.env.NEXT_PUBLIC_S3_REGION;


export const S3Service = {
  async getPresignedUrl(file: File) {
    const response = await api.post(API_ROUTES.s3.generatePresignedUrl, {
      fileName: file.name,
      fileType: file.type,
    });
    return response.data;
  },

  async uploadToS3(url: string, file: File) {
    await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  },

   async getPresignedUploadUrl(file: File) {
    const res = await api.post(API_ROUTES.s3.presignedUpload, {
      fileName: file.name,
      fileType: file.type,
    });
    return res.data; // { uploadUrl, key }
  },
    async getPresignedViewUrl(key: string) {
    const res = await api.get(
      `${API_ROUTES.s3.presignedView}?key=${key}`
    );
    return res.data.url;
  },

  getPublicUrl(key: string) {
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  },
};



// export const S3Service = {
//   async getPresignedUploadUrl(file: File, isPublic = false) {
//     const res = await api.post("/s3/generate-upload-url", {
//       fileName: file.name,
//       fileType: file.type,
//       isPublic,
//     });
//     return res.data; // { url, key }
//   },

//   async uploadToS3(url: string, file: File) {
//     await fetch(url, {
//       method: "PUT",
//       body: file,
//       headers: { "Content-Type": file.type || "application/octet-stream" },
//     });
//   },

//   async getPresignedViewUrl(key: string) {
//     const res = await api.get(`/s3/generate-view-url?key=${encodeURIComponent(key)}`);
//     return res.data.url;
//   },

//   getPublicUrl(key: string) {
//     return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${key}`;
//   },
// };