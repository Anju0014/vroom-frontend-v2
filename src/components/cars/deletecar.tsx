import React from 'react';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import LoadingButton from '../common/LoadingButton';

interface DeleteCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  carName: string;
}

const DeleteCarModal: React.FC<DeleteCarModalProps> = ({ isOpen, onClose, onConfirm, carName }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!isOpen || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <FaExclamationTriangle className="text-red-500 text-4xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Delete Car</h2>
          <p className="mt-2 text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{carName}</span>? This action cannot be undone.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4 mt-6">
          <LoadingButton
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            type="button"
            onClick={onConfirm}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </LoadingButton>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteCarModal;