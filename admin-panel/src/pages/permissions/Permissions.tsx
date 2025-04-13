import {
  createPermissionRequest,
  deletePermissionRequest,
  fetchPermissionsRequest,
  resetPermissionState,
  updatePermissionRequest
} from '@app/store/reducers/permissions';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { Permission } from '@app/types/user';
import { ContentHeader, DataTable } from '@components';
import {
  faEdit,
  faLock,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Button, Card, Form, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const Permissions = () => {
  const { t } = useTranslation();
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Load permissions when component mounts or when pagination/sorting changes
  useEffect(() => {
    fetchPermissions();
  }, [page, size, sortBy, direction, searchQuery]);

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
    dispatch(fetchPermissionsRequest({ page, size, sortBy, direction, search: searchQuery }));
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when changing items per page
  };

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      // Toggle direction
      setDirection(direction === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to asc
      setSortBy(column);
      setDirection('asc');
    }
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    // Reset form
    setFormName('');
    setFormDescription('');
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormName(permission.name);
    setFormDescription(permission.description);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  // Handle create permission
  const handleCreatePermission = () => {
    if (!formName || !formDescription) {
      toast.error(t('permissions.form.allFieldsRequired'));
      return;
    }

    dispatch(createPermissionRequest({
      name: formName,
      description: formDescription
    }));
  };

  // Handle update permission
  const handleUpdatePermission = () => {
    if (!selectedPermission) return;
    
    if (!formName || !formDescription) {
      toast.error(t('permissions.form.allFieldsRequired'));
      return;
    }

    dispatch(updatePermissionRequest({
      id: selectedPermission.id,
      name: formName,
      description: formDescription
    }));
  };

  // Handle delete permission
  const handleDeletePermission = () => {
    if (!selectedPermission) return;
    
    dispatch(deletePermissionRequest({ id: selectedPermission.id }));
  };

  // Define columns for DataTable
  const columns = [
    {
      key: 'id',
      label: 'ID'
    },
    {
      key: 'name',
      label: t('permissions.name')
    },
    {
      key: 'description',
      label: t('permissions.description')
    },
    {
      key: 'actions',
      label: t('permissions.actions'),
      render: (permission: Permission) => (
        <>
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
        </>
      )
    }
  ];

  return (
    <div>
      <ContentHeader title={t('permissions.management')} />
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    {t('permissions.list')}
                  </h3>
                  <div className="card-tools">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleOpenCreateModal}
                      disabled={creating}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      {t('permissions.addNew')}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <DataTable
                    data={permissions || []}
                    columns={columns}
                    loading={loading}
                    isServerSide={true}
                    currentPage={page}
                    defaultItemsPerPage={size}
                    totalItems={total}
                    onSearch={handleSearch}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    searchPlaceholder={t('permissions.search')}
                    emptyMessage={t('permissions.noPermissions')}
                  />
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Create Permission Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('permissions.form.createTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('permissions.name')}</Form.Label>
              <Form.Control 
                type="text" 
                placeholder={t('permissions.form.namePlaceholder')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('permissions.description')}</Form.Label>
              <Form.Control 
                type="text" 
                placeholder={t('permissions.form.descriptionPlaceholder')}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Form.Group>
           
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            {t('permissions.form.cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreatePermission}
            disabled={creating}
          >
            {creating ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                {t('permissions.form.creating')}
              </>
            ) : t('permissions.form.create')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('permissions.form.editTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('permissions.name')}</Form.Label>
              <Form.Control 
                type="text" 
                placeholder={t('permissions.form.namePlaceholder')}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('permissions.description')}</Form.Label>
              <Form.Control 
                type="text" 
                placeholder={t('permissions.form.descriptionPlaceholder')}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t('permissions.form.cancel')}
          </Button>
          <Button 
            variant="info" 
            onClick={handleUpdatePermission}
            disabled={updating}
          >
            {updating ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                {t('permissions.form.updating')}
              </>
            ) : t('permissions.form.update')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Permission Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('permissions.delete.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('permissions.delete.confirmation')}
          <strong> {selectedPermission?.name}</strong>?
          <div className="alert alert-warning mt-3">
            <FontAwesomeIcon icon={faLock} className="mr-2" />
            {t('permissions.delete.warning')}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('permissions.delete.button.cancel')}
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeletePermission}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                {t('permissions.delete.button.deleting')}
              </>
            ) : t('permissions.delete.button.confirm')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Permissions;