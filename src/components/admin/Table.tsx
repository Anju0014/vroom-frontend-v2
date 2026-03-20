
'use client';
import React from 'react';
import LoadingButton from '../common/LoadingButton';

export type TableColumn = {
  header: string;
  key: string;
};

export type TableProps = {
  columns: TableColumn[];
  data: any[];
  onView?: (item: any) => void;
  showViewButton?: boolean;
  isLoading?: boolean;
};

export function Table({
  columns,
  data,
  onView,
  showViewButton = false,
  isLoading = false
}: TableProps) {
  
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left font-medium text-gray-700 border border-gray-200"
                  >
                    {column.header}
                  </th>
                ))}
                {showViewButton && (
                  <th className="px-4 py-3 text-left font-medium text-gray-700 border border-gray-200">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={columns.length + (showViewButton ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500 border border-gray-200"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
     
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
      
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left font-bold text-black-700 border border-gray-200"
                >
                  {column.header}
                </th>
              ))}
              {showViewButton && (
                <th className="px-4 py-3 text-left font-bold text-black-700 border border-gray-200">
                  Action
                </th>
              )}
            </tr>
          </thead>

        
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showViewButton ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500 border border-gray-200"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-3 border border-gray-200"
                    >
                      {item[column.key] || '-'}
                    </td>
                  ))}
                  {showViewButton && (
                    <td className="px-4 py-3 border border-gray-200">
                      <LoadingButton
                        onClick={() => onView && onView(item)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        View
                      </LoadingButton>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}