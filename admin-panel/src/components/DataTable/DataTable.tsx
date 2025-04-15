import { SearchOutlined } from '@ant-design/icons';
import { Input, Select, Space, Table } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

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
  keyField?: string;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: string;
}

const { Option } = Select;

const TableContainer = styled.div`
  .ant-table-wrapper {
    border-radius: 4px;
    overflow: hidden;
  }
  
  .ant-table-thead > tr > th {
    background: #f5f5f5;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }
  
  .ant-pagination {
    margin-top: 16px;
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
`;

const DataTable = <T extends Record<string, any>>({
  data = [],
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
  emptyMessage = "No data found",
  keyField,
  onSort,
  sortField,
  sortDirection
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultItemsPerPage);
  const [localCurrentPage, setLocalCurrentPage] = useState<number>(1); // Ant Design pagination is 1-based
  
  // Use server-side pagination if provided, otherwise use client-side
  const currentPage = isServerSide ? (serverCurrentPage || 1) : localCurrentPage;

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
  
  // Convert columns format for Ant Design Table
  const antColumns = columns.map(column => ({
    title: column.label,
    dataIndex: column.key,
    key: column.key,
    render: column.render ? (text: any, record: T) => column.render!(record) : undefined,
    sorter: onSort ? true : false,
  }));

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (isServerSide && onSearch) {
      onSearch(query);
    }
    
    // Reset to first page when searching
    if (!isServerSide) {
      setLocalCurrentPage(1);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    
    if (isServerSide && onItemsPerPageChange) {
      onItemsPerPageChange(value);
    }
    
    // Reset to first page when changing items per page
    if (!isServerSide) {
      setLocalCurrentPage(1);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (isServerSide && onPageChange) {
      onPageChange(page - 1); // Convert to 0-based for API
    } else {
      setLocalCurrentPage(page);
    }
  };

  // Handle table sort
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (onSort && sorter.field) {
      onSort(sorter.field);
    }
  };

  return (
    <TableContainer>
      <div className="table-header">
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
          allowClear
        />
        
        <Space>
          <span>Items per page:</span>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            style={{ width: 80 }}
          >
            {itemsPerPageOptions.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        </Space>
      </div>
      
      <Table
        dataSource={isServerSide ? data : filteredData.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        )}
        columns={antColumns}
        rowKey={keyField || 'id'}
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: calculatedTotalItems,
          showSizeChanger: false, // We're using our custom size changer
          onChange: handlePageChange,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={handleTableChange}
        locale={{
          emptyText: emptyMessage
        }}
      />
    </TableContainer>
  );
};

export default DataTable;