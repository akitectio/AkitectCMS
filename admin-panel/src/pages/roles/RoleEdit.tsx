import { BorderOutlined, CaretDownOutlined, CaretRightOutlined, CheckOutlined } from '@ant-design/icons';
import { fetchPermissionsRequest } from '@app/store/reducers/permissions';
import { fetchRoleRequest, resetRoleState, updateRoleRequest } from '@app/store/reducers/roles';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { ContentHeader } from '@components';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Checkbox, Col, Divider, Form, Input, Row, Space, Spin, Typography } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

// Validation schema using Yup
const RoleSchema = (t) => Yup.object().shape({
  name: Yup.string()
    .min(3, t('roles.form.validation.nameTooShort'))
    .max(50, t('roles.form.validation.nameTooLong'))
    .required(t('roles.form.validation.nameRequired')),
  description: Yup.string()
    .max(200, t('roles.form.validation.descriptionTooLong')),
  permissionIds: Yup.array()
    .of(Yup.string())
});

// Utility function to group permissions by their prefix
const groupPermissionsByPrefix = (permissions) => {
  const groups = {};
  
  permissions?.forEach(permission => {
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

const RoleEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { selectedRole, loading, updating, error, success } = useAppSelector((state) => state.roles);
  const { items: permissions } = useAppSelector((state) => state.permissions);

  // Group permissions by prefix
  const permissionGroups = useMemo(() => {
    return groupPermissionsByPrefix(permissions);
  }, [permissions]);

  // Track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({});

  // Initialize expandedGroups when permissions are loaded
  useEffect(() => {
    if (permissions?.length > 0) {
      const initialExpandedState = {};
      Object.keys(permissionGroups).forEach(group => {
        initialExpandedState[group] = true; // All groups expanded by default
      });
      setExpandedGroups(initialExpandedState);
    }
  }, [permissionGroups]);

  // Refs for indeterminate checkboxes
  const groupCheckboxRefs = useMemo(() => {
    const refs = {};
    if (permissionGroups) {
      Object.keys(permissionGroups).forEach(group => {
        refs[group] = React.createRef();
      });
    }
    return refs;
  }, [permissionGroups]);

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      permissionIds: [] as string[]
    },
    validationSchema: RoleSchema(t),
    onSubmit: (values) => {
      if (!id) return;
      
      dispatch(updateRoleRequest({
        id,
        name: values.name,
        description: values.description,
        permissionIds: values.permissionIds
      }));
    },
    enableReinitialize: true // Important to update form values when role data is loaded
  });

  // Load role and permissions when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchRoleRequest(id));
      dispatch(fetchPermissionsRequest({}));
    }
  }, [dispatch, id]);

  // Set form values when role data is loaded
  useEffect(() => {
    if (selectedRole) {
      formik.setValues({
        name: selectedRole.name || '',
        description: selectedRole.description || '',
        permissionIds: selectedRole.permissionIds || []
      });
    }
  }, [selectedRole]);

  // Handle success
  useEffect(() => {
    if (success) {
      toast.success(t('roles.messages.updateSuccess'));
      // Navigate to roles list page
      navigate('/roles');
      // Reset state
      dispatch(resetRoleState());
    }
  }, [success, dispatch, navigate, t]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetRoleState());
    }
  }, [error, dispatch]);

  // Handle individual permission selection
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>, permissionId: string) => {
    const { checked } = e.target;
    let newPermissionIds = [...formik.values.permissionIds];
    
    if (checked) {
      newPermissionIds.push(permissionId);
    } else {
      newPermissionIds = newPermissionIds.filter(id => id !== permissionId);
    }
    
    formik.setFieldValue('permissionIds', newPermissionIds);
  };

  // Handle group selection (select/deselect all permissions in a group)
  const handleGroupSelection = (groupName: string, select: boolean) => {
    const groupPermissionIds = permissionGroups[groupName].map(p => p.id);
    
    let newPermissionIds = [...formik.values.permissionIds];
    
    if (select) {
      // Add all permissions from this group that aren't already selected
      groupPermissionIds.forEach(id => {
        if (!newPermissionIds.includes(id)) {
          newPermissionIds.push(id);
        }
      });
    } else {
      // Remove all permissions from this group
      newPermissionIds = newPermissionIds.filter(id => !groupPermissionIds.includes(id));
    }
    
    formik.setFieldValue('permissionIds', newPermissionIds);
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Check if all permissions in a group are selected
  const isGroupFullySelected = (groupName: string) => {
    if (!permissionGroups[groupName]) return false;
    
    return permissionGroups[groupName].every(permission => 
      formik.values.permissionIds.includes(permission.id)
    );
  };

  // Check if some (but not all) permissions in a group are selected
  const isGroupPartiallySelected = (groupName: string) => {
    if (!permissionGroups[groupName]) return false;
    
    const hasSelected = permissionGroups[groupName].some(permission => 
      formik.values.permissionIds.includes(permission.id)
    );
    
    return hasSelected && !isGroupFullySelected(groupName);
  };

  // Update indeterminate state when selections change
  useEffect(() => {
    Object.keys(permissionGroups).forEach(group => {
      if (groupCheckboxRefs[group]?.current) {
        groupCheckboxRefs[group].current.indeterminate = isGroupPartiallySelected(group);
      }
    });
  }, [formik.values.permissionIds, permissionGroups, isGroupPartiallySelected]);

  // Handle "Check All" for all permissions
  const handleCheckAllPermissions = () => {
    const allPermissionIds = permissions?.map(p => p.id) || [];
    formik.setFieldValue('permissionIds', allPermissionIds);
  };

  // Handle "Uncheck All" for all permissions
  const handleUncheckAllPermissions = () => {
    formik.setFieldValue('permissionIds', []);
  };

  // Check if all permissions are selected
  const areAllPermissionsSelected = useMemo(() => {
    if (!permissions?.length) return false;
    return permissions.every(permission => 
      formik.values.permissionIds.includes(permission.id)
    );
  }, [permissions, formik.values.permissionIds]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <ContentHeader title={t('roles.edit')} />
      
      <section className="content">
        <div className="container-fluid">
          <Card
            title={
              <Typography.Title level={4}>{t('roles.form.title')}</Typography.Title>
            }
            extra={
              <Button 
                type="default" 
                size="middle"
                onClick={() => navigate('/roles')}
                icon={<FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 8 }} />}
              >
                {t('roles.form.backToList')}
              </Button>
            }
          >
            <Form layout="vertical" onFinish={formik.handleSubmit}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={t('roles.form.name')}
                    validateStatus={formik.touched.name && formik.errors.name ? 'error' : ''}
                    help={formik.touched.name && formik.errors.name ? formik.errors.name : ''}
                  >
                    <Input 
                      name="name"
                      placeholder={t('roles.form.namePlaceholder')}
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={t('roles.form.description')}
                    validateStatus={formik.touched.description && formik.errors.description ? 'error' : ''}
                    help={formik.touched.description && formik.errors.description ? formik.errors.description : ''}
                  >
                    <Input 
                      name="description"
                      placeholder={t('roles.form.descriptionPlaceholder')}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Typography.Text strong>{t('roles.form.selectPermissions')}</Typography.Text>
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleCheckAllPermissions}
                      disabled={areAllPermissionsSelected}
                      icon={<CheckOutlined />}
                    >
                      {t('roles.form.checkAll')}
                    </Button>
                    <Button
                      type="default"
                      size="small"
                      onClick={handleUncheckAllPermissions}
                      disabled={formik.values.permissionIds.length === 0}
                      icon={<BorderOutlined />}
                    >
                      {t('roles.form.uncheckAll')}
                    </Button>
                  </Space>
                </div>
                <div style={{ border: '1px solid #d9d9d9', padding: '12px', borderRadius: '2px', maxHeight: '400px', overflowY: 'auto' }}>
                  {Object.keys(permissionGroups).map(groupName => (
                    <div key={groupName} style={{ marginBottom: '16px' }}>
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '8px', 
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleGroupExpansion(groupName)}
                      >
                        <Checkbox 
                          id={`group-${groupName}`}
                          ref={groupCheckboxRefs[groupName]}
                          checked={isGroupFullySelected(groupName)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleGroupSelection(groupName, !isGroupFullySelected(groupName));
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Typography.Text strong>
                            {`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} (${permissionGroups[groupName].length})`}
                          </Typography.Text>
                        </Checkbox>
                        <div style={{ marginLeft: 'auto' }}>
                          {expandedGroups[groupName] ? <CaretDownOutlined /> : <CaretRightOutlined />}
                        </div>
                      </div>
                      
                      {expandedGroups[groupName] && (
                        <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                          {permissionGroups[groupName].map(permission => (
                            <div key={permission.id} style={{ marginBottom: '8px' }}>
                              <Checkbox 
                                id={`permission-${permission.id}`}
                                checked={formik.values.permissionIds.includes(permission.id)}
                                onChange={(e) => handlePermissionChange(e, permission.id)}
                              >
                                <div>
                                  <div>{permission.name}</div>
                                  {permission.description && (
                                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                      {permission.description}
                                    </Typography.Text>
                                  )}
                                </div>
                              </Checkbox>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Form.Item>
              
              <Divider />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="default" 
                  style={{ marginRight: 8 }}
                  onClick={() => navigate('/roles')}
                >
                  {t('roles.form.cancel')}
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  disabled={updating || !formik.isValid || !formik.dirty}
                  loading={updating}
                  icon={!updating && <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />}
                >
                  {updating ? t('roles.form.saving') : t('roles.form.submit')}
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RoleEdit;