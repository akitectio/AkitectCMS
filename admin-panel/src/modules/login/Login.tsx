import { setWindowClass } from '@app/utils/helpers';
import { loginRequest } from '@store/reducers/auth';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { envConfig } from '@app/configs/loadEnv';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { Button } from '@app/styles/common';
import { Form, InputGroup } from 'react-bootstrap';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [t] = useTranslation();
  
  // Get auth state from Redux store
  const { loading: isAuthLoading, currentUser, formValues } = useAppSelector(state => state.auth);

  // Check for token and redirect to dashboard if it exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Navigate to homepage if user is authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const login = (username: string, password: string) => {
    // Dispatch login action to trigger the saga
    dispatch(loginRequest({ username, password }));
  };

  const { handleChange, values, handleSubmit, touched, errors, setValues } = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      password: Yup.string()
        .min(5, 'Must be 5 characters or more')
        .max(30, 'Must be 30 characters or less')
        .required('Required'),
    }),
    onSubmit: (values) => {
      login(values.username, values.password);
    },
  });

  // Update form values when Redux store changes
  useEffect(() => {
    setValues({
      username: formValues?.username || '',
      password: formValues?.password || '',
    });
  }, [formValues, setValues]);

  setWindowClass('hold-transition login-page');

  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h1">
            {envConfig.siteName}
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg">{t('login.label.signIn')}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="username"
                  name="username"
                  type="username"
                  placeholder="Username"
                  onChange={handleChange}
                  value={values.username}
                  isValid={touched.username && !errors.username}
                  isInvalid={touched.username && !!errors.username}
                />
                {touched.username && errors.username ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-id-card" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
                  isValid={touched.password && !errors.password}
                  isInvalid={touched.password && !!errors.password}
                />
                {touched.password && errors.password ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>

            <div className="row">
              <div className="col-12">
                <Button
                  loading={isAuthLoading}
                  disabled={isAuthLoading}
                  onClick={handleSubmit as any}
                >
                  {t('login.button.signIn.label')}
                </Button>
              </div>
            </div>
          </form>
    
        </div>
      </div>
    </div>
  );
};

export default Login;
