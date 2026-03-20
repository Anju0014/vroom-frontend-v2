import React from "react";

const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const AdminPageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <SkeletonBox className="h-8 w-64 mb-6" />

      <div className="mb-6 max-w-md">
        <SkeletonBox className="h-10 w-full rounded-lg" />
      </div>


      <SkeletonBox className="h-4 w-48 mb-4" />


      <div className="rounded-lg border border-gray-200 overflow-hidden">

        <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-4 w-20 ml-auto" />
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-4 w-20" />
        </div>


        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-4 py-4 border-b border-gray-100 last:border-0"
          >
            <SkeletonBox className="h-4 w-40" />
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-6 w-20 rounded-full ml-auto" />
            <SkeletonBox className="h-6 w-16 rounded-full" />
            <SkeletonBox className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>


      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBox key={i} className="h-9 w-9 rounded-md" />
        ))}
      </div>
    </div>
  );
};

export default AdminPageSkeleton;