import React from "react";

interface SearchFilterProps {
  search: string;
  setSearch: (value: string) => void;
  filters: string[];
  setFilter: (value: string) => void;
  selectedFilter?: string; 
}

const SearchFilter: React.FC<SearchFilterProps> = ({ 
  search, 
  setSearch, 
  filters, 
  setFilter,
  selectedFilter = "" 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-full md:w-1/3"
      />
      <select
        value={selectedFilter} 
        onChange={(e) => setFilter(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-full md:w-1/4"
      >
        <option value="">All</option>
        {filters.map((filter) => (
          <option key={filter} value={filter}>
            {filter}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchFilter;
