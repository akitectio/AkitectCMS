import {
    createPermissionRequest,
    deletePermissionRequest,
    fetchPermissionsRequest,
    resetPermissionState,
    updatePermissionRequest
} from '@app/store/reducers/permissions';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { Permission } from '@app/types/user';
import { ContentHeader } from '@components';
import {
    faEdit,
    faLock,
    faPlus,
    faSort,
    faSortDown,
    faSortUp,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Button, Card, Form, Modal, Pagination, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Permissions = () => {
  const dispatch = useAppDispatch();
  const { 
    items: permissions, 
    loading, 
    creating, 
    updating, 
    deleting, 
    error, 
    success,
    currentPage,
    totalPages,
    total
  } = useAppSelector((state) => state.permissions);

  // Local state for UI
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  
  // Pagination and sorting state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [direction, setDirection] = useState('asc');
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formModule, setFormModule] = useState('');
  const [formKey, setFormKey] = useState('');

  // Load permissions when component mounts or when pagination/sorting changes
  useEffect(() => {
    fetchPermissions();
  }, [page, size, sortBy, direction]);

  // Reset form state after success
  useEffect(() => {
    if (success) {
      if (showCreateModal) setShowCreateModal(false);
      if (showEditModal) setShowEditModal(false);
      if (showDeleteModal) setShowDeleteModal(false);
      
      // Reset the redux success state
      setTimeout(() => {
        dispatch(resetPermissionState());
      }, 2000);
    }
  }, [success, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      
      // Reset the redux error state
      setTimeout(() => {
        dispatch(resetPermissionState());
      }, 2000);
    }
  }, [error, dispatch]);

  // Fetch permissions
  const fetchPermissions = () => {
    dispatch(fetchPermissionsRequest({ page, size, sortBy, direction }));
  };

  // Handle sort column click
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle direction
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to asc
      setSortBy(column);
      setDirection('asc');
    }
  };

  // Get sort icon for column
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <FontAwesomeIcon icon={faSort} className="text-muted ml-1" />;
    }
    return direction === 'asc' 
      ? <FontAwesomeIcon icon={faSortUp} className="ml-1" /> 
      : <FontAwesomeIcon icon={faSortDown} className="ml-1" />;
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    // Reset form
    setFormName('');
    setFormDescription('');
    setFormModule('');
    setFormKey('');
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormName(permission.name);
    setFormDescription(permission.description);
    setFormModule(permission.module);
    setFormKey(permission.key);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  // Handle create permission
  const handleCreatePermission = () => {
    if (!formName || !formDescription || !formModule || !formKey) {
      toast.error('All fields are required');
      return;
    }

    dispatch(createPermissionRequest({
      name: formName,
      description: formDescription,
      module: formModule,
      key: formKey
    }));
  };

  // Handle update permission
  const handleUpdatePermission = () => {
    if (!selectedPermission) return;
    
    if (!formName || !formDescription || !formModule || !formKey) {
      toast.error('All fields are required');
      return;
    }

    dispatch(updatePermissionRequest({
      id: selectedPermission.id,
      name: formName,
      description: formDescription,
      module: formModule,
      key: formKey
    }));
  };

  // Handle delete permission
  const handleDeletePermission = () => {
    if (!selectedPermission) return;
    
    dispatch(deletePermissionRequest({ id: selectedPermission.id }));
  };

  // Render pagination controls
  const renderPagination = () => {
    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(page - 1)} 
        disabled={page === 0} 
      />
    );
    
    // Page numbers
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === page} 
          onClick={() => handlePageChange(i)}
        >
          {i + 1}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(page + 1)} 
        disabled={page >= totalPages - 1} 
      />
    );
    
    return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
  };

  return (
    <div>
      <ContentHeader title="Permissions Management" />
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Permissions List
                  </h3>
                  <div className="card-tools">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleOpenCreateModal}
                      disabled={creating}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Add New Permission
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                              ID {getSortIcon('id')}
                            </th>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                              Name {getSortIcon('name')}
                            </th>
                            <th onClick={() => handleSort('key')} style={{ cursor: 'pointer' }}>
                              Key {getSortIcon('key')}
                            </th>
                            <th onClick={() => handleSort('module')} style={{ cursor: 'pointer' }}>
                              Module {getSortIcon('module')}
                            </th>
                            <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                              Description {getSortIcon('description')}
                            </th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {permissions.length > 0 ? (
                            permissions.map((permission) => (
                              <tr key={permission.id}>
                                <td>{permission.id}</td>
                                <td>{permission.name}</td>
                                <td><code>{permission.key}</code></td>
                                <td>{permission.module}</td>
                                <td>{permission.description}</td>
                                <td>
                                  <Button
                                    variant="info"
                                    size="sm"
                                    className="mr-1"
                                    onClick={() => handleOpenEditModal(permission)}
                                    disabled={updating}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleOpenDeleteModal(permission)}
                                    disabled={deleting}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center">
                                No permissions found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                      
                      {/* Pagination */}
                      {totalPages > 1 && renderPagination()}
                      
                      {/* Total items info */}
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          Showing {permissions.length} of {total} permissions
                        </small>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Create Permission Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Permission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter permission name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter permission description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Module</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter module name (e.g., users, posts, etc.)"
                value={formModule}
                onChange={(e) => setFormModule(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Key</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter permission key (e.g., users.create)"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
              />
              <Form.Text className="text-muted">
                This should be a unique identifier for the permission
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreatePermission}
            disabled={creating}
          >
            {creating ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : 'Create Permission'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Permission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter permission name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter permission description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Module</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter module name (e.g., users, posts, etc.)"
                value={formModule}
                onChange={(e) => setFormModule(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Key</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter permission key (e.g., users.create)"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
              />
              <Form.Text className="text-muted">
                This should be a unique identifier for the permission
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="info" 
            onClick={handleUpdatePermission}
            disabled={updating}
          >
            {updating ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : 'Update Permission'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Permission Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Permission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the permission:
          <strong> {selectedPermission?.name}</strong>?
          <div className="alert alert-warning mt-3">
            <FontAwesomeIcon icon={faLock} className="mr-2" />
            This action cannot be undone. Deleting a permission might affect users who have this permission assigned.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeletePermission}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : 'Delete Permission'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Permissions;