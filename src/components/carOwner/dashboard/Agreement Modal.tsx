
"use client";

import LoadingButton from "@/components/common/LoadingButton";
import React from "react";

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const AgreementModal: React.FC<AgreementModalProps> = ({ isOpen, onClose, onAgree }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
        {/* <h2 className="text-xl font-semibold mb-4">Car Rental Agreement</h2> */}
        <h2 className="text-xl font-semibold mb-4">Agreement & Terms</h2>
        <div className="h-60 overflow-y-auto p-2 border border-gray-300 rounded">
          <p className="text-sm mb-2">
            <strong>1. Purpose:</strong> <br></br>This Agreement outlines the terms for listing your vehicle on the Vroom platform.
          </p>
          <p className="text-sm mb-2">
            <strong>2. Owner Responsibilities:</strong><br></br> You must ensure your vehicle is roadworthy, insured, and compliant with local regulations.
          </p>
          <p className="text-sm mb-2">
            <strong>3. Rental Charges:</strong><br></br> Rentals are charged on a per-day basis, and Vroom will deduct a 5% commission from each booking.
          </p>
          <p className="text-sm mb-2">
            <strong>4. Payments & Bookings:</strong> <br></br>Payments will be processed securely, and commissions will be deducted automatically.
          </p>
          <p className="text-sm mb-2">
            <strong>5. Liability & Insurance:</strong><br></br> Vroom is not responsible for damage, theft, or incidents during the rental. Owners must maintain insurance.
          </p>
          <p className="text-sm mb-2">
            <strong>6. Agreement Acceptance:</strong><br></br> By clicking "Agree," you accept these terms and confirm compliance.
          </p>
        </div>
        <div className="flex justify-end mt-4 space-x-4">
          <LoadingButton onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md">
            Cancel
          </LoadingButton>
          <LoadingButton onClick={onAgree} className="px-4 py-2 bg-black text-white rounded-md">
            Agree & Continue
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default AgreementModal;



