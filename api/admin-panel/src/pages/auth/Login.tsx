import { clearError, login } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import { LoginRequest } from '@/types';
import { ErrorMessage, Field, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

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