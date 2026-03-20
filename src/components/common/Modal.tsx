"use client";
import { ReactNode } from 'react';
import LoadingButton from './LoadingButton';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, onAgree, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full">
        <h3 className="text-2xl font-bold text-indigo-700 mb-4">{title}</h3>
        <div className="max-h-96 overflow-y-auto mb-6">{children}</div>
        <div className="flex justify-between">
          <LoadingButton
            onClick={onClose}
            className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Disagree
          </LoadingButton>
          <LoadingButton
            onClick={onAgree}
            className="py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Agree
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}