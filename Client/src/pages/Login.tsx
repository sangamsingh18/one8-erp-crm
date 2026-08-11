import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User as UserIcon, ArrowLeft } from 'lucide-react';
import Toast from '../components/common/Toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isRegister, setIsRegister] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [regLoading, setRegLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-generate username from Full Name: e.g. "Sangam Singh" -> "sangam@one8.com"
  const handleNameChange = (val: string) => {
    setRegName(val);
    if (regErrors.name) setRegErrors(prev => ({ ...prev, name: undefined }));
    
    // Automatically generate username/email
    const nameParts = val.trim().split(/\s+/);
    if (nameParts.length > 0 && nameParts[0]) {
      const generated = nameParts[0].toLowerCase() + '@one8.com';
      setRegEmail(generated);
      if (regErrors.email) setRegErrors(prev => ({ ...prev, email: undefined }));
    } else {
      setRegEmail('');
    }
  };

  const validateLoginForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateLoginForm()) return;
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const responseData = err?.response?.data;
      const msg = responseData?.message ?? '';
      
      if (msg.includes('inactive')) {
        setError('Your account is currently inactive. Please contact an administrator.');
      } else if (msg.toLowerCase().includes('credential') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError('Unable to login. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateRegisterForm = () => {
    const errors: typeof regErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regName.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!regEmail) {
      errors.email = 'Please enter a valid One8 email address.';
    } else if (!emailRegex.test(regEmail) || !regEmail.toLowerCase().endsWith('@one8.com')) {
      errors.email = 'Please enter a valid One8 email address.';
    }

    if (!regPassword) {
      errors.password = 'Password is required.';
    } else if (regPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (regConfirmPassword !== regPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setRegLoading(true);
    try {
      await authApi.selfRegister({
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword
      });
      
      setToast({ message: 'Account created successfully. Please sign in.', type: 'success' });
      // Clear forms
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setIsRegister(false);
    } catch (err: any) {
      const responseData = err?.response?.data;
      const msg = responseData?.message ?? '';
      if (msg.toLowerCase().includes('exists') || msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('duplicate')) {
        setRegErrors(prev => ({ ...prev, email: 'Username already exists.' }));
      } else {
        setToast({ message: msg || 'Registration failed. Please try again.', type: 'error' });
      }
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="login-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src="/logo.svg" alt="One8 CRM logo" style={{ height: '52px', width: '52px', filter: 'drop-shadow(0 4px 8px rgba(30,58,95,0.25))' }} />
        </div>
        <div className="login-logo" style={{ marginBottom: '4px', display: 'flex', justifyContent: 'center', gap: '3px' }}>
          One8 <span style={{ color: 'var(--primary)' }}>CRM</span>
        </div>

        {!isRegister ? (
          <>
            <p className="login-subtitle">Sign in to your account</p>
            
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={14} style={{ marginRight: '4px' }} /> Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={fieldErrors.email ? 'field-error' : ''}
                  placeholder="e.g. sangam@one8.com"
                  required
                  autoFocus
                />
                {fieldErrors.email && (
                  <span className="validation-error-msg">
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <Lock size={14} style={{ marginRight: '4px' }} /> Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={fieldErrors.password ? 'field-error' : ''}
                    style={{ paddingRight: '40px', width: '100%' }}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="validation-error-msg">
                    <AlertCircle size={12} /> {fieldErrors.password}
                  </span>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <span className="text-muted" style={{ fontSize: '13px' }}>New to One8 CRM? </span>
              <button 
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setRegErrors({});
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: 0,
                }}
              >
                Create Account
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', width: '100%' }}>
              <button 
                type="button" 
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <ArrowLeft size={16} />
              </button>
              <p className="login-subtitle" style={{ margin: 0 }}>Register a new account</p>
            </div>

            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="regName">
                  <UserIcon size={14} style={{ marginRight: '4px' }} /> Full Name *
                </label>
                <input
                  id="regName"
                  type="text"
                  value={regName}
                  onChange={e => handleNameChange(e.target.value)}
                  className={regErrors.name ? 'field-error' : ''}
                  placeholder="e.g. Sangam Singh"
                  required
                  autoFocus
                />
                {regErrors.name && (
                  <span className="validation-error-msg">
                    <AlertCircle size={12} /> {regErrors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="regEmail">
                  <Mail size={14} style={{ marginRight: '4px' }} /> Username / Email *
                </label>
                <input
                  id="regEmail"
                  type="email"
                  value={regEmail}
                  onChange={e => {
                    setRegEmail(e.target.value);
                    if (regErrors.email) setRegErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={regErrors.email ? 'field-error' : ''}
                  placeholder="e.g. sangam@one8.com"
                  required
                />
                {regErrors.email && (
                  <span className="validation-error-msg">
                    <AlertCircle size={12} /> {regErrors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="regPassword">
                  <Lock size={14} style={{ marginRight: '4px' }} /> Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="regPassword"
                    type={regShowPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => {
                      setRegPassword(e.target.value);
                      if (regErrors.password) setRegErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={regErrors.password ? 'field-error' : ''}
                    placeholder="Min. 8 characters"
                    required
                  />
                </div>
                {regErrors.password && (
                  <span className="validation-error-msg">
                    <AlertCircle size={12} /> {regErrors.password}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="regConfirmPassword">
                  <Lock size={14} style={{ marginRight: '4px' }} /> Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="regConfirmPassword"
                    type={regShowPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={e => {
                      setRegConfirmPassword(e.target.value);
                      if (regErrors.confirmPassword) setRegErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    className={regErrors.confirmPassword ? 'field-error' : ''}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
                {regErrors.confirmPassword && (
                  <span className="validation-error-msg">
                    <AlertCircle size={12} /> {regErrors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  id="showPass"
                  type="checkbox"
                  checked={regShowPassword}
                  onChange={e => setRegShowPassword(e.target.checked)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="showPass" style={{ margin: 0, cursor: 'pointer', fontSize: '13px', userSelect: 'none' }}>
                  Show Passwords
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }} disabled={regLoading}>
                {regLoading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
