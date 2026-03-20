import React from 'react';

const BookingSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 animate-pulse">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-slate-200 rounded w-48"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          </div>


          <div className="flex-1 border-l border-slate-200 pl-6">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-40"></div>
              <div className="h-4 bg-slate-200 rounded w-40"></div>
            </div>
          </div>


          <div className="flex flex-col items-end gap-3">
            <div className="h-8 bg-slate-200 rounded w-32"></div>
            <div className="h-8 bg-slate-200 rounded-full w-24"></div>
            <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSkeleton;