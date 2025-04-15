import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Input,
    Popconfirm,
    Space,
    Table,
    Tooltip,
    Typography
} from 'antd';
import { TableProps } from 'antd/lib/table';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface DataTableProps<T extends object> extends TableProps<T> {
  dataSource: T[];
  columns: any[];
  title: string;
  loading?: boolean;
  searchable?: boolean;
  addRoute?: string;
  editRoute?: string;
  viewRoute?: string;
  deleteAction?: (record: T) => void;
  refreshAction?: () => void;
  rowKey: string;
}

const AntTable = <T extends object>({
  dataSource,
  columns,
  title,
  loading = false,
  searchable = true,
  addRoute,
  editRoute,
  viewRoute,
  deleteAction,
  refreshAction,
  rowKey,
  ...tableProps
}: DataTableProps<T>) => {
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<T[]>(dataSource);
  const navigate = useNavigate();

  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    if (value) {
      const filtered = dataSource.filter((record: any) => {
        return Object.keys(record).some(key => {
          if (typeof record[key] === 'string') {
            return record[key].toLowerCase().includes(value);
          }
          if (typeof record[key] === 'number') {
            return record[key].toString().toLowerCase().includes(value);
          }
          return false;
        });
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(dataSource);
    }
  };

  // Effect to update filtered data when dataSource changes
  React.useEffect(() => {
    setFilteredData(dataSource);
    // Re-apply search filter if there was an active search
    if (searchText) {
      handleSearch({ target: { value: searchText } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [dataSource]);

  // Add action column if any of the action props are provided
  const actionColumn = (editRoute || viewRoute || deleteAction) ? {
    title: 'Actions',
    key: 'action',
    fixed: 'right' as 'right',
    width: 150,
    render: (text: string, record: any) => (
      <Space size="small">
        {viewRoute && (
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`${viewRoute}/${record[rowKey]}`)}
              size="small"
            />
          </Tooltip>
        )}
        {editRoute && (
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`${editRoute}/${record[rowKey]}`)}
              size="small"
            />
          </Tooltip>
        )}
        {deleteAction && (
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => deleteAction(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        )}
      </Space>
    ),
  } : null;

  // Final columns array including action column if needed
  const finalColumns = actionColumn
    ? [...columns, actionColumn]
    : columns;

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>{title}</Title>
          <Space>
            {searchable && (
              <Input
                placeholder="Search"
                value={searchText}
                onChange={handleSearch}
                style={{ width: 200 }}
                prefix={<SearchOutlined />}
                allowClear
              />
            )}
            {refreshAction && (
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refreshAction} 
                title="Refresh"
              />
            )}
            {addRoute && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(addRoute)}
              >
                Add New
              </Button>
            )}
          </Space>
        </Space>
      </div>

      <Table
        dataSource={searchText ? filteredData : dataSource}
        columns={finalColumns}
        rowKey={rowKey}
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        {...tableProps}
      />
    </Card>
  );
};

export default AntTable;