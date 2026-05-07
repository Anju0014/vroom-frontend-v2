import { useEffect, useState } from "react";
import { S3Service } from "@/services/common/s3Service";

export const usePrivateFile = (key?: string) => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;

    const fetchUrl = async () => {
      try {
        setLoading(true);
        const signedUrl = await S3Service.getPresignedViewUrl(key);
        setUrl(signedUrl);
      } catch (err) {
        console.error("Failed to load private file:", err);
        setError("Failed to load file");
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [key]);

  return { url, loading, error };
};