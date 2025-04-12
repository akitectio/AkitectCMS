import { fetchPermissionsRequest } from '@app/store/reducers/permissions';
import { fetchRoleRequest, resetRoleState, updateRoleRequest } from '@app/store/reducers/roles';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { ContentHeader } from '@components';
import { faArrowLeft, faCheck, faSave, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFormik } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

// Validation schema using Yup
const RoleSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must be less than 50 characters')
    .required('Role name is required'),
  description: Yup.string()
    .max(200, 'Description must be less than 200 characters'),
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
    validationSchema: RoleSchema,
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
      toast.success('Role updated successfully');
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
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ContentHeader title="Edit Role" />
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <Card>
                <Card.Header>
                  <h3 className="card-title">Role Details</h3>
                  <div className="card-tools">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => navigate('/roles')}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
                      Back to List
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Form noValidate onSubmit={formik.handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control 
                            type="text"
                            name="name"
                            placeholder="Enter role name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.name && !!formik.errors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control 
                            type="text"
                            name="description"
                            placeholder="Enter role description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.description && !!formik.errors.description}
                          />
                          <Form.Control.Feedback type="invalid">
                            {formik.errors.description}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Form.Label className="mb-0">Permissions</Form.Label>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="mr-2"
                            onClick={handleCheckAllPermissions}
                            disabled={areAllPermissionsSelected}
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            Check All
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleUncheckAllPermissions}
                            disabled={formik.values.permissionIds.length === 0}
                          >
                            <FontAwesomeIcon icon={faSquare} className="mr-1" />
                            Uncheck All
                          </Button>
                        </div>
                      </div>
                      <div className="border p-3 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {Object.keys(permissionGroups).map(groupName => (
                          <div key={groupName} className="mb-3">
                            <div 
                              className="d-flex align-items-center mb-2 p-2 bg-light rounded cursor-pointer"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleGroupExpansion(groupName)}
                            >
                              <Form.Check 
                                type="checkbox"
                                id={`group-${groupName}`}
                                ref={groupCheckboxRefs[groupName]}
                                checked={isGroupFullySelected(groupName)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleGroupSelection(groupName, !isGroupFullySelected(groupName));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                label={`${groupName.charAt(0).toUpperCase() + groupName.slice(1)} (${permissionGroups[groupName].length})`}
                                style={{ fontWeight: 'bold' }}
                                className="mb-0"
                              />
                              <div className="ml-auto">
                                {expandedGroups[groupName] ? '▼' : '►'}
                              </div>
                            </div>
                            
                            {expandedGroups[groupName] && (
                              <div className="pl-4">
                                {permissionGroups[groupName].map(permission => (
                                  <div key={permission.id} className="mb-2">
                                    <Form.Check 
                                      type="checkbox"
                                      id={`permission-${permission.id}`}
                                      checked={formik.values.permissionIds.includes(permission.id)}
                                      onChange={(e) => handlePermissionChange(e, permission.id)}
                                      label={
                                        <div>
                                          <div>{permission.name}</div>
                                          {permission.description && (
                                            <small className="text-muted">{permission.description}</small>
                                          )}
                                        </div>
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end mt-4">
                      <Button 
                        variant="secondary" 
                        className="mr-2"
                        onClick={() => navigate('/roles')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={updating || !formik.isValid || !formik.dirty}
                      >
                        {updating ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSave} className="mr-1" />
                            Update Role
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoleEdit;