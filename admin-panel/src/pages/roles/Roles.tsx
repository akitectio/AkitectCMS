import { fetchPermissionsRequest } from '@app/store/reducers/permissions';
import { deleteRoleRequest, fetchRolesRequest, resetRoleState } from '@app/store/reducers/roles';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { ContentHeader, DataTable } from '@components';
import {
  faEdit,
  faEye,
  faPlus,
  faShieldHalved,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Button, Card, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Roles = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { 
    items: roles, 
    loading, 
    deleting, 
    error, 
    success,
    currentPage,
    totalPages,
    total
  } = useAppSelector((state) => state.roles);
  const { items: permissions } = useAppSelector((state) => state.permissions);

  // Local state for UI
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // State for permissions modal
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  
  // Pagination and sorting state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [direction, setDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Load roles when component mounts or when pagination/sorting changes
  useEffect(() => {
    dispatch(fetchRolesRequest({ page, size, sortBy, direction, search: searchQuery }));
    // Fetch permissions to display their names in the modal
    dispatch(fetchPermissionsRequest({}));
  }, [dispatch, page, size, sortBy, direction, searchQuery]);

  // Reset form state after success
  useEffect(() => {
    if (success) {
      if (showDeleteModal) setShowDeleteModal(false);
      
      // Reset the redux success state
      setTimeout(() => {
        dispatch(resetRoleState());
      }, 2000);
    }
  }, [success, dispatch, showDeleteModal]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      
      // Reset the redux error state
      setTimeout(() => {
        dispatch(resetRoleState());
      }, 2000);
    }
  }, [error, dispatch]);

  // Open permissions modal
  const handleOpenPermissionsModal = (role) => {
    if (!role.permissionIds || role.permissionIds.length === 0) {
      return; // Don't open modal if no permissions
    }
    
    setSelectedRolePermissions(role.permissionIds);
    setSelectedRoleName(role.name);
    setShowPermissionsModal(true);
  };

  // Get permission name by id
  const getPermissionName = (permissionId: string) => {
    const permission = permissions?.find(p => p.id === permissionId);
    return permission ? permission.name : t('permissions.noPermissions');
  };

  // Handle delete role
  const handleDeleteRole = () => {
    if (!selectedRoleId) return;
    
    dispatch(deleteRoleRequest(selectedRoleId));
  };

  // Open delete modal
  const handleOpenDeleteModal = (roleId: string) => {
    setSelectedRoleId(roleId);
    setShowDeleteModal(true);
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

  // Define columns for DataTable
  const columns = [
    {
      key: 'id',
      label: 'ID'
    },
    {
      key: 'name',
      label: t('roles.name')
    },
    {
      key: 'description',
      label: t('roles.description')
    },
    {
      key: 'permissions',
      label: t('roles.permissions'),
      render: (role) => (
        <div 
          onClick={() => handleOpenPermissionsModal(role)} 
          style={{ 
            cursor: role.permissionIds?.length > 0 ? 'pointer' : 'default',
            color: role.permissionIds?.length > 0 ? '#007bff' : 'inherit'
          }}
        >
          {t('roles.permissionsCount', { count: role.permissionIds?.length || 0 })}
          {role.permissionIds?.length > 0 && (
            <FontAwesomeIcon icon={faEye} className="ml-1" />
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: t('roles.actions'),
      render: (role) => (
        <>
          <Link to={`/roles/${role.id}/edit`}>
            <Button
              variant="info"
              size="sm"
              className="mr-1"
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleOpenDeleteModal(role.id)}
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
      <ContentHeader title={t('roles.management')} />
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <FontAwesomeIcon icon={faShieldHalved} className="mr-2" />
                    {t('roles.list')}
                  </h3>
                  <div className="card-tools">
                    <Link to="/roles/create">
                      <Button 
                        variant="primary" 
                        size="sm"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-1" />
                        {t('roles.addNew')}
                      </Button>
                    </Link>
                  </div>
                </Card.Header>
                <Card.Body>
                  <DataTable
                    data={roles || []}
                    columns={columns}
                    loading={loading}
                    isServerSide={true}
                    currentPage={page}
                    defaultItemsPerPage={size}
                    totalItems={total}
                    onSearch={handleSearch}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    searchPlaceholder={t('roles.search')}
                    emptyMessage={t('roles.noRoles')}
                  />
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Role Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('roles.delete.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('roles.delete.confirmation')}
          <div className="alert alert-warning mt-3">
            <FontAwesomeIcon icon={faShieldHalved} className="mr-2" />
            {t('roles.delete.warning')}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t('roles.delete.button.cancel')}
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteRole}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                {t('roles.delete.button.deleting')}
              </>
            ) : t('roles.delete.button.confirm')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Permissions Modal */}
      <Modal 
        show={showPermissionsModal} 
        onHide={() => setShowPermissionsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faShieldHalved} className="mr-2" />
            {t('roles.permissionsModal.title', { name: selectedRoleName })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {selectedRolePermissions.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-striped table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('roles.permissionsModal.permissionName')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRolePermissions.map((permissionId, index) => (
                        <tr key={permissionId}>
                          <td>{index + 1}</td>
                          <td>{getPermissionName(permissionId)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  {t('roles.permissionsModal.noPermissions')}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPermissionsModal(false)}>
            {t('roles.permissionsModal.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Roles;