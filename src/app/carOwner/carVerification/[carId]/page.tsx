"use client";

import { useParams } from "next/navigation";
import VideoCall from "@/components/common/VideoCall";
import VideoCallVerification from "@/components/common/VideoCallVerificattion";

export default function OwnerCarVerificationPage() {
  const { carId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">
        Car Verification Call
      </h1>

      <p className="text-sm text-gray-500 mb-4">
        Join the call when the admin starts verification.
      </p>

      <VideoCallVerification
        roomId={`car-verification-${carId}`}
        role="owner"
      />
    </div>
  );
}
