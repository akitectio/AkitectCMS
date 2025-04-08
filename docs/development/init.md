# Khởi tạo dự án Admin Panel cho AkitectCMS

Tôi sẽ hướng dẫn bạn khởi tạo dự án ReactJS với TypeScript, Bootstrap cho Admin Panel và tích hợp vào Spring Boot MVC. Chúng ta sẽ bắt đầu với cấu trúc dự án, thiết kế trang login và dashboard, sau đó tích hợp vào Spring Boot.

## 1. Khởi tạo dự án React với TypeScript

### Tạo dự án mới

```bash
# Tạo thư mục admin-panel trong project
mkdir admin-panel
cd admin-panel

# Khởi tạo dự án React với TypeScript
npx create-react-app . --template typescript

# Cài đặt các dependencies cần thiết
npm install react-router-dom axios bootstrap react-bootstrap 
npm install react-icons formik yup chart.js react-chartjs-2
npm install @reduxjs/toolkit react-redux
```

### Cấu hình Alias và Path Mapping

Tạo file `tsconfig.paths.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@api/*": ["src/api/*"],
      "@assets/*": ["src/assets/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"],
      "@hooks/*": ["src/hooks/*"],
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@store/*": ["src/store/*"]
    }
  }
}
```

Cập nhật `tsconfig.json` để extends từ `tsconfig.paths.json`:

```json
{
  "extends": "./tsconfig.paths.json",
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

## 2. Cấu trúc dự án

Tạo các thư mục cần thiết:

```bash
mkdir -p src/{api,assets/{css,images},components/{common,forms,layout,widgets},features,hooks,pages/{auth,dashboard,posts,series,users,settings},store,types,utils}
```

Cấu trúc thư mục:

    admin-panel/
    ├── src/
    │   ├── api/              # API clients
    │   ├── assets/           # Static assets
    │   │   ├── css/          # CSS files
    │   │   └── images/       # Image files
    │   ├── components/       # Reusable components
    │   │   ├── common/       # Common UI components
    │   │   ├── forms/        # Form components
    │   │   ├── layout/       # Layout components
    │   │   └── widgets/      # Dashboard widgets
    │   ├── features/         # Redux toolkit slices
    │   ├── hooks/            # Custom React hooks
    │   ├── pages/            # Page components
    │   │   ├── auth/         # Authentication pages
    │   │   ├── dashboard/    # Dashboard page
    │   │   ├── posts/        # Post management
    │   │   ├── series/       # Series management
    │   │   ├── users/        # User management
    │   │   └── settings/     # Settings pages
    │   ├── store/            # Redux store
    │   ├── types/            # TypeScript type definitions
    │   ├── utils/            # Utility functions
    │   ├── App.tsx           # Main app component
    │   ├── index.tsx         # Entry point
    │   └── routes.tsx        # Route definitions

## 3. Tạo Type Definitions

Tạo file `src/types/index.ts`:

```typescript
// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Dashboard Types
export interface DashboardStats {
  usersCount: number;
  postsCount: number;
  seriesCount: number;
  lessonsCount: number;
  recentVisits: VisitData[];
  contentByCategory: CategoryData[];
}

export interface VisitData {
  date: string;
  count: number;
}

export interface CategoryData {
  category: string;
  count: number;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  publishedAt?: string;
  featuredImageUrl?: string;
  authorId: string;
  authorName: string;
  categories: Category[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}
```

## 4. Thiết lập API Client

Tạo file `src/api/axios.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

Tạo file `src/api/authApi.ts`:

```typescript
import apiClient from './axios';
import { LoginRequest } from '@/types';

const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post('/auth/login', data),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
  
  logout: () => 
    apiClient.post('/auth/logout')
};

export default authApi;
```

Tạo file `src/api/dashboardApi.ts`:

```typescript
import apiClient from './axios';

const dashboardApi = {
  getStats: () => 
    apiClient.get('/dashboard/stats')
};

export default dashboardApi;
```

## 5. Redux Toolkit Setup

Tạo file `src/store/index.ts`:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Tạo file `src/features/auth/authSlice.ts`:

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '@/api/authApi';
import { AuthState, LoginRequest } from '@/types';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

## 6. App, Routes và Layouts

Tạo file `src/hooks/useAppDispatch.ts` và `src/hooks/useAppSelector.ts`:

```typescript
// src/hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
```

```typescript
// src/hooks/useAppSelector.ts
import { useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@/store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Tạo file `src/components/layout/AdminLayout.tsx`:

```typescript
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Container } from 'react-bootstrap';
import '@/assets/css/admin.css';

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="d-flex">
        <Sidebar collapsed={sidebarCollapsed} />
        
        <main className="content-wrapper flex-grow-1 py-3">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLayout;
```

Tạo file `src/components/layout/Sidebar.tsx`:

```typescript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  BsSpeedometer2, BsFileEarmarkText, BsCollection, 
  BsBook, BsPeople, BsGear 
} from 'react-icons/bs';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <div className={`sidebar bg-dark text-white ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand p-3">
        <h4 className="text-center">AkitectCMS</h4>
      </div>
      
      <Nav className="flex-column">
        <Nav.Item>
          <NavLink to="/admin" end className="nav-link py-3 px-4 d-flex align-items-center">
            <BsSpeedometer2 className="me-3" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/posts" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsFileEarmarkText className="me-3" />
            {!collapsed && <span>Bài viết</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/categories" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsCollection className="me-3" />
            {!collapsed && <span>Danh mục</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/series" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsBook className="me-3" />
            {!collapsed && <span>Khóa học</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/users" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsPeople className="me-3" />
            {!collapsed && <span>Người dùng</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/settings" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsGear className="me-3" />
            {!collapsed && <span>Cài đặt</span>}
          </NavLink>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
```

Tạo file `src/components/layout/Navbar.tsx`:

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Dropdown } from 'react-bootstrap';
import { BsList, BsBell, BsPerson } from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { logout } from '@/features/auth/authSlice';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <div className="d-flex justify-content-between w-100 mx-3">
        <div className="d-flex align-items-center">
          <button className="btn" onClick={toggleSidebar}>
            <BsList size={24} />
          </button>
        </div>
        
        <div className="d-flex align-items-center">
          <Dropdown align="end" className="me-3">
            <Dropdown.Toggle variant="light" id="notification-dropdown" className="border-0 position-relative">
              <BsBell />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Thông báo mới</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>Xem tất cả thông báo</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="user-dropdown" className="border-0 d-flex align-items-center">
              <BsPerson className="me-2" />
              <span>{user?.fullName || 'Admin'}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/admin/profile">Hồ sơ</Dropdown.Item>
              <Dropdown.Item as={Link} to="/admin/settings">Cài đặt</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as="button" onClick={handleLogout}>
                Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </BootstrapNavbar>
  );
};

export default Navbar;
```

Tạo file `src/components/layout/Footer.tsx`:

```typescript
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-white border-top py-3 mt-auto">
      <div className="container-fluid text-center">
        <span className="text-muted">
          &copy; {new Date().getFullYear()} AkitectCMS. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
```

## 7. CSS cho Admin

Tạo file `src/assets/css/admin.css`:

```css
/* Main Layout */
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Sidebar styles */
.sidebar {
  width: 250px;
  min-height: calc(100vh - 56px);
  transition: all 0.3s ease;
  z-index: 100;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar .nav-link {
  color: rgba(255, 255, 255, 0.8);
  border-left: 3px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar .nav-link:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar .nav-link.active {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.2);
  border-left: 3px solid #007bff;
}

/* Content wrapper */
.content-wrapper {
  padding: 15px;
  min-height: calc(100vh - 56px - 56px); /* navbar height and footer height */
  transition: all 0.3s ease;
}

/* Dashboard cards */
.stat-card {
  border-radius: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-card .icon-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

/* Login page */
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  max-width: 400px;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}
```

## 8. Trang Login

Tạo file `src/pages/auth/Login.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { login, clearError } from '@/features/auth/authSlice';
import { LoginRequest } from '@/types';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Tên đăng nhập là bắt buộc'),
  password: Yup.string()
    .required('Mật khẩu là bắt buộc')
});

const initialValues: LoginRequest = {
  username: '',
  password: ''
};

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);
  const [showError, setShowError] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    setShowError(!!error);
    const timer = setTimeout(() => {
      if (error) {
        setShowError(false);
        dispatch(clearError());
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [error, dispatch]);
  
  const handleSubmit = async (values: LoginRequest) => {
    await dispatch(login(values));
  };
  
  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="login-card">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <img src="/logo.png" alt="Logo" className="login-logo" />
                  <h2 className="mb-0">AkitectCMS</h2>
                  <p className="text-muted">Đăng nhập vào hệ thống quản trị</p>
                </div>
                
                {showError && <Alert variant="danger">{error}</Alert>}
                
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ handleSubmit, isSubmitting, touched, errors }) => (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tên đăng nhập</Form.Label>
                        <Field
                          type="text"
                          name="username"
                          as={Form.Control}
                          placeholder="Nhập tên đăng nhập"
                          isInvalid={touched.username && !!errors.username}
                        />
                        <ErrorMessage
                          name="username"
                          component={Form.Control.Feedback}
                          type="invalid"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label>Mật khẩu</Form.Label>
                        <Field
                          type="password"
                          name="password"
                          as={Form.Control}
                          placeholder="Nhập mật khẩu"
                          isInvalid={touched.password && !!errors.password}
                        />
                        <ErrorMessage
                          name="password"
                          component={Form.Control.Feedback}
                          type="invalid"
                        />
                      </Form.Group>
                      
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang đăng nhập...
                          </>
                        ) : 'Đăng nhập'}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
```

## 9. Trang Dashboard

Tạo file `src/components/common/ContentHeader.tsx`:

```typescript
import React from 'react';
import { Row, Col, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  text: string;
  link?: string;
}

interface ContentHeaderProps {
  title: string;
  breadcrumb: BreadcrumbItem[];
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title, breadcrumb }) => {
  return (
    <div className="content-header mb-4">
      <Row className="align-items-center">
        <Col>
          <h1 className="m-0">{title}</h1>
          <Breadcrumb className="mt-2">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/admin' }}>
              Dashboard
            </Breadcrumb.Item>
            {breadcrumb.map((item, index) => (
              <Breadcrumb.Item 
                key={index}
                active={index === breadcrumb.length - 1}
                linkAs={item.link ? Link : undefined}
                linkProps={item.link ? { to: item.link } : undefined}
              >
                {item.text}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Col>
      </Row>
    </div>
  );
};

export default ContentHeader;
```

Tạo file `src/components/widgets/StatsCard.tsx`:

```typescript
import React from 'react';
import { Card } from 'react-bootstrap';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <Card className="stat-card h-100 border-0 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div className={`icon-wrapper bg-${color} text-white me-3`}>
          {icon}
        </div>
        <div>
          <h3 className="mb-0">{value}</h3>
          <p className="text-muted mb-0">{title}</p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;
```

Tạo file `src/pages/dashboard/Dashboard.tsx`:

````typescript
import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { BsPersonFill, BsFileEarmarkText, BsCollectionFill, BsBook } from 'react-icons/bs';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import ContentHeader from '@/components/common/ContentHeader';
import StatsCard from '@/components/widgets/StatsCard';
import dashboardApi from '@/api/dashboardApi';
import { DashboardStats } from '@/types';

// Đăng ký Chart.js components
Chart.register(...registerables);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    usersCount: 0,
    postsCount: 0,
    seriesCount: 0,
    lessonsCount: 0,
    recentVisits: [],
    contentByCategory: []
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const visitChartData = {
    labels: stats.recentVisits.map(item => item.date),
    datasets: [
      {
        label: 'Lượt truy cập',
        data: stats.recentVisits.map(item => item.count),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1
      }
    ]
  };
  
Xin lỗi vì đã bị ngắt giữa chừng. Tôi sẽ tiếp tục phần còn lại của Dashboard.tsx và hoàn thiện setup cho dự án.

```typescript
// Tiếp tục từ src/pages/dashboard/Dashboard.tsx
  const categoryChartData = {
    labels: stats.contentByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Số lượng nội dung',
        data: stats.contentByCategory.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <>
      <ContentHeader 
        title="Dashboard" 
        breadcrumb={[{ text: 'Dashboard' }]} 
      />
      
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <StatsCard 
                title="Người dùng"
                value={stats.usersCount}
                icon={<BsPersonFill size={24} />}
                color="primary"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Bài viết"
                value={stats.postsCount}
                icon={<BsFileEarmarkText size={24} />}
                color="info"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Khóa học"
                value={stats.seriesCount}
                icon={<BsBook size={24} />}
                color="success"
              />
            </Col>
            <Col md={3}>
              <StatsCard 
                title="Bài học"
                value={stats.lessonsCount}
                icon={<BsCollectionFill size={24} />}
                color="warning"
              />
            </Col>
          </Row>
          
          <Row>
            <Col md={8}>
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Lượt truy cập trong 30 ngày qua</h5>
                </Card.Header>
                <Card.Body>
                  <Line data={visitChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Nội dung theo danh mục</h5>
                </Card.Header>
                <Card.Body>
                  <Bar data={categoryChartData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      }
                    }
                  }} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Dashboard;
````

## 10. Routes.tsx

Tạo file `src/routes.tsx`:

```typescript
import React, { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';

// Lazy loading các pages
const Login = lazy(() => import('@/pages/auth/Login'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));

// Loading component
const PageLoading = () => (
  <div className="text-center p-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Auth guard
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const routes: RouteObject[] = [
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoading />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoading />}>
            <Dashboard />
          </Suspense>
        )
      },
      // Các routes khác sẽ được thêm ở đây
      {
        path: '*',
        element: <Navigate to="/admin" replace />
      }
    ]
  }
];

export default routes;
```

## 11. App.tsx

Cập nhật file `src/App.tsx`:

```typescript
import React, { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { getCurrentUser } from '@/features/auth/authSlice';
import routes from '@/routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/assets/css/admin.css';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const routing = useRoutes(routes);
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);
  
  return <>{routing}</>;
};

export default App;
```

## 12. Index.tsx

Cập nhật file `src/index.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import App from '@/App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
```

## 13. Tích hợp vào Spring Boot MVC

### Cấu hình Spring Boot để phục vụ Admin Panel

Tạo AdminController trong Spring Boot:

```java
@Controller
@RequestMapping("/admin")
public class AdminController {
    
    @GetMapping(value = {"", "/**"})
    public String adminPanel() {
        // Trả về trang index.html của React app
        return "admin/index";
    }
}
```

### Cấu hình Maven để build và tích hợp React app

Cập nhật file `pom.xml`:

```xml
<plugin>
  <groupId>com.github.eirslett</groupId>
  <artifactId>frontend-maven-plugin</artifactId>
  <version>1.12.1</version>
  <configuration>
    <workingDirectory>admin-panel</workingDirectory>
    <installDirectory>target</installDirectory>
  </configuration>
  <executions>
    <!-- Install Node and NPM -->
    <execution>
      <id>install node and npm</id>
      <goals>
        <goal>install-node-and-npm</goal>
      </goals>
      <configuration>
        <nodeVersion>v18.15.0</nodeVersion>
        <npmVersion>9.5.0</npmVersion>
      </configuration>
    </execution>
    <!-- Install dependencies -->
    <execution>
      <id>npm install</id>
      <goals>
        <goal>npm</goal>
      </goals>
      <configuration>
        <arguments>install</arguments>
      </configuration>
    </execution>
    <!-- Build React app -->
    <execution>
      <id>npm run build</id>
      <goals>
        <goal>npm</goal>
      </goals>
      <configuration>
        <arguments>run build</arguments>
      </configuration>
    </execution>
  </executions>
</plugin>

<!-- Copy React build to static resources -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-resources-plugin</artifactId>
  <version>3.2.0</version>
  <executions>
    <execution>
      <id>copy-resources</id>
      <phase>process-resources</phase>
      <goals>
        <goal>copy-resources</goal>
      </goals>
      <configuration>
        <outputDirectory>${project.build.outputDirectory}/static/admin</outputDirectory>
        <resources>
          <resource>
            <directory>admin-panel/build</directory>
            <filtering>false</filtering>
          </resource>
        </resources>
      </configuration>
    </execution>
  </executions>
</plugin>
```

### Tạo trang index.html trong Thymeleaf

```html
<!-- src/main/resources/templates/admin/index.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="AkitectCMS Admin Panel" />
  <link rel="icon" th:href="@{/favicon.ico}" />
  <title>AkitectCMS Admin</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
  
  <!-- Thymeleaf sẽ giúp đảm bảo đường dẫn chính xác cho các files -->
  <script th:src="@{/admin/static/js/main.js}" type="text/javascript"></script>
</body>
</html>
```

### Cấu hình Security cho Admin Panel

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Public pages
                .requestMatchers("/", "/posts/**", "/series/**", "/category/**", 
                                "/search", "/tag/**", "/register", "/login", "/css/**", 
                                "/js/**", "/images/**", "/webjars/**").permitAll()
                // Admin login page
                .requestMatchers("/admin/login").permitAll()
                // Admin API endpoints - require authentication
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "CONTENT_MANAGER", "USER_MANAGER")
                // Admin panel entry point
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "CONTENT_MANAGER", "USER_MANAGER")
                // User specific pages
                .requestMatchers("/profile/**", "/my-courses/**").authenticated()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .permitAll()
            )
            // Handle API responses for unauthorized access
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    (request, response, authException) -> 
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
            )
            // For REST APIs
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**")
            );
        
        return http.build();
    }
}
```

## 14. REST API cho Admin Panel

Tạo một AuthController để xử lý đăng nhập:

```java
@RestController
@RequestMapping("/api/v1/admin/auth")
public class AuthController {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    
    public AuthController(JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            // Xác thực người dùng
            UserDetails userDetails = userService.authenticateUser(request.getUsername(), request.getPassword());
            
            // Tạo token
            String token = jwtTokenProvider.generateToken(userDetails);
            
            // Trả về thông tin người dùng và token
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userService.getCurrentUserInfo(userDetails.getUsername()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Đăng nhập không thành công: " + e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserDto userDto = userService.getCurrentUserInfo(username);
        return ResponseEntity.ok(userDto);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT là stateless nên chỉ cần client xóa token
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
}
```

Tạo một DashboardController để cung cấp dữ liệu cho Dashboard:

```java
@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class DashboardController {
    
    private final UserService userService;
    private final PostService postService;
    private final SeriesService seriesService;
    private final LessonService lessonService;
    private final ActivityLogService activityLogService;
    private final CategoryService categoryService;
    
    // Constructor injection
    
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        // Đếm các thực thể
        stats.setUsersCount(userService.countUsers());
        stats.setPostsCount(postService.countPosts());
        stats.setSeriesCount(seriesService.countSeries());
        stats.setLessonsCount(lessonService.countLessons());
        
        // Lấy dữ liệu lượt truy cập 30 ngày qua
        stats.setRecentVisits(activityLogService.getVisitStatsLast30Days());
        
        // Lấy dữ liệu nội dung theo danh mục
        stats.setContentByCategory(categoryService.getContentCountByCategory());
        
        return ResponseEntity.ok(stats);
    }
}
```

## 15. Kết luận và Các bước tiếp theo

Với cấu trúc này, bạn đã có một admin panel cơ bản sử dụng React, TypeScript và Bootstrap, tích hợp vào Spring Boot MVC. Trang Login và Dashboard đã được thiết kế và sẵn sàng để sử dụng.

### Các bước tiếp theo:

1.  **Phát triển thêm các trang quản lý**:
    -   Quản lý Posts
    -   Quản lý Categories và Tags
    -   Quản lý Series và Lessons
    -   Quản lý Users
    -   Cài đặt hệ thống

2.  **Tạo các components form phổ biến**:
    -   Rich Text Editor
    -   Image Upload
    -   Date/Time Picker
    -   Tags Input

3.  **Tối ưu hóa hiệu suất**:
    -   Lazy loading components
    -   Pagination cho danh sách dài
    -   Caching dữ liệu

4.  **Kiểm thử**:
    -   Unit tests
    -   Integration tests
    -   End-to-end tests

5.  **Cải thiện UX/UI**:
    -   Dark/Light theme
    -   Responsive design cho mobile
    -   Animations và transitions
    -   Notifications system

Dự án này cung cấp nền tảng vững chắc cho việc xây dựng một hệ thống quản trị nội dung toàn diện. Khi bạn mở rộng dự án, hãy nhớ giữ cấu trúc có tổ chức và tiếp tục áp dụng các nguyên tắc TypeScript chặt chẽ để đảm bảo mã nguồn dễ bảo trì và mở rộng.
