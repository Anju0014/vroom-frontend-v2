import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "vroom-car-images.s3.eu-north-1.amazonaws.com", 
      "lh3.googleusercontent.com",
      "images.unsplash.com",
    ],
  },
};

export default nextConfig;
