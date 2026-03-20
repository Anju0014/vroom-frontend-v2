import React from "react";

const DashboardPageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">

      
      <div className="animate-pulse bg-gray-200 rounded h-8 w-56 mb-6" />

      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-4 py-4"><div className="animate-pulse bg-gray-200 rounded h-4 w-36" /></td>
              <td className="px-4 py-4"><div className="animate-pulse bg-gray-200 rounded h-4 w-24" /></td>
              <td className="px-4 py-4"><div className="animate-pulse bg-gray-200 rounded h-4 w-28" /></td>
              <td className="px-4 py-4"><div className="animate-pulse bg-gray-200 rounded-full h-6 w-20" /></td>
              <td className="px-4 py-4"><div className="animate-pulse bg-gray-200 rounded-full h-6 w-16" /></td>
              <td className="px-4 py-4"><div className="animate-pulse bg-gray-200 rounded h-4 w-24" /></td>
              <td className="px-4 py-4"><div className="animate-pulse bg-gray-200 rounded h-8 w-16" /></td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default DashboardPageSkeleton;