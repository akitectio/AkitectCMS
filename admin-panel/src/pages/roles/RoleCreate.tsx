import {
  ArrowLeftOutlined,
  CheckOutlined,
  SaveOutlined,
  StopOutlined
} from '@ant-design/icons';
import ContentHeader from '@app/components/content-header/ContentHeader';
import { fetchPermissionsRequest } from '@app/store/reducers/permissions';
import { createRoleRequest, resetRoleState } from '@app/store/reducers/roles';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { Button, Card, Checkbox, Col, Collapse, Form, Input, Row, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const { Panel } = Collapse;
const { Text, Title } = Typography;

// Utility function to group permissions by their prefix
interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface PermissionGroups {
  [key: string]: Permission[];
}

const groupPermissionsByPrefix = (permissions: Permission[] = []): PermissionGroups => {
  const groups: PermissionGroups = {};
  
  permissions.forEach(permission => {
    const nameParts = permission.name.split(':');
    if (nameParts.length > 1) {
      const prefix = nameParts[0];
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(permission);
    } else {
      // For permissions without a prefix, add to 'other' group
      if (!groups['other']) {
        groups['other'] = [];
      }
      groups['other'].push(permission);
    }
  });
  
  return groups;
};

const RoleCreate = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  
  const { creating, error, success } = useAppSelector((state) => state.roles);
  const { items: permissions, loading: loadingPermissions } = useAppSelector((state) => state.permissions);

  // State to track selected permission IDs
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Group permissions by prefix
  const permissionGroups = React.useMemo(() => {
    return groupPermissionsByPrefix(permissions);
  }, [permissions]);

  // Load permissions when component mounts
  useEffect(() => {
    dispatch(fetchPermissionsRequest({}));
  }, [dispatch]);

  // Initialize expanded groups when permissions are loaded
  useEffect(() => {
    if (permissions?.length > 0) {
      const groupNames = Object.keys(permissionGroups);
      setExpandedGroups(groupNames);
    }
  }, [permissions?.length, permissionGroups]);

  // Handle success
  useEffect(() => {
    if (success) {
      toast.success('Role created successfully');
      // Navigate to roles list page
      navigate('/roles');
      // Reset state
      dispatch(resetRoleState());
    }
  }, [success, dispatch, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetRoleState());
    }
  }, [error, dispatch]);

  // Handle form submission
  const handleSubmit = (values: any) => {
    dispatch(createRoleRequest({
      name: values.name,
      description: values.description,
      permissionIds: selectedPermissions
    }));
  };

  // Handle individual permission selection
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  // Handle group selection (select/deselect all permissions in a group)
  const handleGroupSelection = (groupName: string, checked: boolean) => {
    const groupPermissionIds = permissionGroups[groupName]?.map(p => p.id) || [];
    
    if (checked) {
      // Add all permissions from this group
      setSelectedPermissions(prev => {
        const newSelection = [...prev];
        groupPermissionIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      // Remove all permissions from this group
      setSelectedPermissions(prev => 
        prev.filter(id => !groupPermissionIds.includes(id))
      );
    }
  };

  // Check if all permissions in a group are selected
  const isGroupFullySelected = (groupName: string) => {
    if (!permissionGroups[groupName]) return false;
    
    return permissionGroups[groupName].every(permission => 
      selectedPermissions.includes(permission.id)
    );
  };

  // Check if some (but not all) permissions in a group are selected
  const isGroupPartiallySelected = (groupName: string) => {
    if (!permissionGroups[groupName]) return false;
    
    const hasSelected = permissionGroups[groupName].some(permission => 
      selectedPermissions.includes(permission.id)
    );
    
    return hasSelected && !isGroupFullySelected(groupName);
  };

  // Handle "Check All" for all permissions
  const handleCheckAllPermissions = () => {
    const allPermissionIds = permissions?.map(p => p.id) || [];
    setSelectedPermissions(allPermissionIds);
  };

  // Handle "Uncheck All" for all permissions
  const handleUncheckAllPermissions = () => {
    setSelectedPermissions([]);
  };

  // Check if all permissions are selected
  const areAllPermissionsSelected = React.useMemo(() => {
    if (!permissions?.length) return false;
    return permissions.every(permission => 
      selectedPermissions.includes(permission.id)
    );
  }, [permissions, selectedPermissions]);

  return (
    <>
      <ContentHeader title="Create New Role" />
      
      <Card 
        title="Role Details"
        extra={
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/roles')}
          >
            Back to List
          </Button>
        }
      >
        <Spin spinning={loadingPermissions || creating}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: '',
              description: ''
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: 'Role name is required' },
                    { min: 3, message: 'Role name must be at least 3 characters' },
                    { max: 50, message: 'Role name must be less than 50 characters' }
                  ]}
                >
                  <Input placeholder="Enter role name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Description"
                  name="description"
                  rules={[
                    { max: 200, message: 'Description must be less than 200 characters' }
                  ]}
                >
                  <Input placeholder="Enter role description" />
                </Form.Item>
              </Col>
            </Row>
            
            <div className="mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>Permissions</Title>
                <div>
                  <Button
                    icon={<CheckOutlined />}
                    onClick={handleCheckAllPermissions}
                    disabled={areAllPermissionsSelected}
                    style={{ marginRight: 8 }}
                  >
                    Check All
                  </Button>
                  <Button
                    icon={<StopOutlined />}
                    onClick={handleUncheckAllPermissions}
                    disabled={selectedPermissions.length === 0}
                  >
                    Uncheck All
                  </Button>
                </div>
              </div>

              <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #e8e8e8', padding: 16, borderRadius: 2 }}>
                {Object.keys(permissionGroups).length > 0 ? (
                  <Collapse
                    defaultActiveKey={expandedGroups}
                    ghost
                  >
                    {Object.keys(permissionGroups).map(groupName => (
                      <Panel 
                        key={groupName}
                        header={
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox 
                              checked={isGroupFullySelected(groupName)}
                              indeterminate={isGroupPartiallySelected(groupName)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleGroupSelection(groupName, e.target.checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <strong style={{ marginLeft: 8 }}>
                              {`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} (${permissionGroups[groupName].length})`}
                            </strong>
                          </div>
                        }
                      >
                        {permissionGroups[groupName].map(permission => (
                          <div key={permission.id} style={{ marginBottom: 8, paddingLeft: 24 }}>
                            <Checkbox 
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                            >
                              <div>
                                <div>{permission.name}</div>
                                {permission.description && (
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {permission.description}
                                  </Text>
                                )}
                              </div>
                            </Checkbox>
                          </div>
                        ))}
                      </Panel>
                    ))}
                  </Collapse>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    {loadingPermissions ? (
                      <Spin tip="Loading permissions..." />
                    ) : (
                      <Text type="secondary">No permissions found</Text>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Button 
                style={{ marginRight: 8 }} 
                onClick={() => navigate('/roles')}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={creating}
                icon={<SaveOutlined />}
                disabled={!form.getFieldValue('name')}
              >
                Save Role
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </>
  );
};

export default RoleCreate;