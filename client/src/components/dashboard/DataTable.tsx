import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiArrowUpLine, RiArrowDownLine, RiSearchLine, 
  RiMoreLine, RiFilterLine, RiArrowLeftSLine, RiArrowRightSLine
} from 'react-icons/ri';

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
  }[];
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'لا توجد بيانات',
  searchPlaceholder = 'بحث...',
  isLoading = false,
  actions
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term
  const filterData = () => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return columns.some(column => {
        const key = column.key as keyof T;
        const value = item[key];
        
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        if (typeof value === 'number') {
          return value.toString().includes(searchTerm);
        }
        
        return false;
      });
    });
  };

  // Sort data based on sort key and direction
  const sortData = (filteredData: T[]) => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      // Handle the case where sortKey might be a custom key from render method
      const keyA = columns.find(col => col.key === sortKey)?.key as keyof T;
      const keyB = columns.find(col => col.key === sortKey)?.key as keyof T;
      
      if (!keyA || !keyB) return 0;
      
      const valueA = a[keyA];
      const valueB = b[keyB];
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
      
      return 0;
    });
  };

  // Handle column header click for sorting
  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;
    
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Paginate data
  const paginateData = (sortedData: T[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  };

  const filteredData = filterData();
  const sortedData = sortData(filteredData);
  const paginatedData = paginateData(sortedData);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Table loading skeleton
  if (isLoading) {
    return (
      <div className="dashboard-card">
        <div className="p-4 flex justify-between items-center">
          <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                {columns.map((column, index) => (
                  <th key={index} className="p-4 text-right">
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
                {actions && <th className="p-4 text-right w-20"></th>}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b">
                  {columns.map((column, cellIndex) => (
                    <td key={cellIndex} className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                  {actions && (
                    <td className="p-4">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card overflow-hidden">
      {/* Table Header with Search and Filters */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="relative">
          <RiSearchLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline py-2 px-3 flex items-center gap-1 text-sm">
            <RiFilterLine />
            <span>تصفية</span>
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-sm text-gray-600">
              {columns.map((column) => (
                <th 
                  key={column.key as string} 
                  className={`p-4 text-right font-medium ${column.sortable ? 'cursor-pointer' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key as string)}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>{column.title}</span>
                    {column.sortable && sortKey === column.key && (
                      sortDirection === 'asc' ? <RiArrowUpLine /> : <RiArrowDownLine />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="p-4 text-right w-20"></th>}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <motion.tr 
                    key={keyExtractor(item)}
                    className="border-b hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {columns.map((column) => (
                      <td key={`${keyExtractor(item)}-${column.key as string}`} className="p-4">
                        {column.render ? column.render(item) : (item[column.key as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                    {actions && (
                      <td className="p-4">
                        <div className="relative">
                          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <RiMoreLine />
                          </button>
                          {/* Actions dropdown would go here */}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8 text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-500">
            عرض {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData.length)} - {Math.min(currentPage * itemsPerPage, sortedData.length)} من {sortedData.length}
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <RiArrowRightSLine />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button 
                  key={pageNumber}
                  className={`w-8 h-8 rounded-md text-sm ${currentPage === pageNumber ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button 
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <RiArrowLeftSLine />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}