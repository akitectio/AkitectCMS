import React, { useState } from 'react';
import {
    Button,
    Col,
    Input,
    Pagination,
    // Select, 
    Row,
    Table
} from 'reactstrap';
import './DataTable.scss';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  defaultItemsPerPage?: number;
  itemsPerPageOptions?: number[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  totalItems?: number;
  currentPage?: number;
  isServerSide?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  defaultItemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
  searchPlaceholder = "Search...",
  onSearch,
  onPageChange,
  onItemsPerPageChange,
  totalItems,
  currentPage: serverCurrentPage,
  isServerSide = false,
  loading = false,
  emptyMessage = "No data found"
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);
  const [localCurrentPage, setLocalCurrentPage] = useState<number>(0);
  
  // Use server-side pagination if provided, otherwise use client-side
  const currentPage = isServerSide ? (serverCurrentPage || 0) : localCurrentPage;

  // Filter data locally if not using server-side filtering
  const filteredData = isServerSide 
    ? data 
    : data.filter(item => 
        columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      );

  // Calculate pagination for client-side
  const calculatedTotalItems = isServerSide ? (totalItems || 0) : filteredData.length;
  const totalPages = Math.ceil(calculatedTotalItems / itemsPerPage);
  
  // Get paginated data for client-side
  const paginatedData = isServerSide 
    ? data 
    : filteredData.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
      );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (isServerSide && onSearch) {
      onSearch(query);
    }
    
    // Reset to first page when searching
    if (!isServerSide) {
      setLocalCurrentPage(0);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    
    if (isServerSide && onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
    
    // Reset to first page when changing items per page
    if (!isServerSide) {
      setLocalCurrentPage(0);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (isServerSide && onPageChange) {
      onPageChange(page);
    } else {
      setLocalCurrentPage(page);
    }
  };

  return (
    <div className="data-table">
      <Row className="mb-3">
        <Col md={6}>
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            className="data-table-search"
          />
        </Col>
        <Col md={6} className="text-right">
          <div className="d-flex justify-content-end align-items-center">
            <span className="mr-2">Items per page:</span>
            <select
              value={itemsPerPage.toString()}
              onChange={handleItemsPerPageChange}
              className="data-table-select form-control"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table hover bordered striped>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index}>
                  {columns.map(column => (
                    <td key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, calculatedTotalItems)} of {calculatedTotalItems} entries
          </div>
          <Pagination>
            <Button
              color="primary"
              outline
              onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              // Calculate the page numbers to show (centered around current page)
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage > totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  color={currentPage === pageNum ? "primary" : "secondary"}
                  outline={currentPage !== pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="mx-1"
                >
                  {pageNum + 1}
                </Button>
              );
            })}
            <Button
              color="primary"
              outline
              onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataTable;