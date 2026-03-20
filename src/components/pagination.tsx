
import React from 'react';
import LoadingButton from './common/LoadingButton';


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      
      <LoadingButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300"
      >
        Previous
      </LoadingButton>
      {pageNumbers.map((number) => (
        <LoadingButton
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-4 py-2 rounded-md ${
            number === currentPage ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {number}
        </LoadingButton>
      ))}
      <LoadingButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 hover:bg-gray-300"
      >
        Next
      </LoadingButton>
    </div>
  );
};

export default Pagination;