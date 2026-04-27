import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import { api } from "../api";
import { useAuthSession } from '../hooks/useAuthSession';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuthSession();
  const [activeTab, setActiveTab] = useState('login');
  const [loginType, setLoginType] = useState('homeowner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type') || 'homeowner';
    setLoginType(type);
    
    // Check for saved credentials
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setLoginData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    refreshCaptcha();
  }, [location]);

  const refreshCaptcha = () => {
    const first = Math.floor(Math.random() * 9) + 1;
    const second = Math.floor(Math.random() * 9) + 1;
    const operators = ['+', '-'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let question = `${first} ${operator} ${second}`;
    let answer = 0;

    if (operator === '+') {
      answer = first + second;
    } else {
      // Keep subtraction non-negative for easier user input.
      const larger = Math.max(first, second);
      const smaller = Math.min(first, second);
      question = `${larger} - ${smaller}`;
      answer = larger - smaller;
    }

    setCaptchaQuestion(question);
    setCaptchaAnswer(String(answer));
    setCaptchaInput('');
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Phone validation (10-digit number)
  const validatePhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone.replace(/\s/g, ''));
  };

  // Password strength validation
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!validateEmail(loginData.email)) {
    setError('Please enter a valid email address');
    setLoading(false);
    return;
  }

  if (!loginData.password) {
    setError('Password is required');
    setLoading(false);
    return;
  }

  if (!captchaInput.trim()) {
    setError('Please solve the captcha challenge');
    setLoading(false);
    return;
  }

  if (captchaInput.trim() !== captchaAnswer) {
    setError('Captcha verification failed. Please try again.');
    setLoading(false);
    refreshCaptcha();
    return;
  }

  try {
    const response = await api.login(loginData);
    const isAdminUser = loginData.email.toLowerCase().endsWith('@homeplus.com');
    const userType = isAdminUser ? 'admin' : 'homeowner';
    const savedProfile = JSON.parse(localStorage.getItem(`profile_${(response.email || loginData.email).toLowerCase()}`) || '{}');
    const resolvedFullName = response.fullName || savedProfile.fullName || loginData.email.split('@')[0];
    const storedPhoneByEmail = localStorage.getItem(`phone_${(response.email || loginData.email).toLowerCase()}`) || '';
    const resolvedPhone = response.phone || savedProfile.phone || storedPhoneByEmail || '';

    setSession({
      token: response.token,
      userEmail: response.email || loginData.email,
      userType,
      userName: resolvedFullName,
      userData: {
      fullName: resolvedFullName,
      email: response.email || loginData.email,
      phone: resolvedPhone,
      role: isAdminUser ? 'ADMIN' : 'HOMEOWNER'
      },
      rememberMe,
    });

    localStorage.setItem('userPhone', resolvedPhone);
    localStorage.setItem(`phone_${(response.email || loginData.email).toLowerCase()}`, resolvedPhone);
    localStorage.setItem(
      `profile_${(response.email || loginData.email).toLowerCase()}`,
      JSON.stringify({ fullName: resolvedFullName, phone: resolvedPhone, role: isAdminUser ? 'ADMIN' : 'HOMEOWNER' })
    );

    setSuccess('Login successful! Redirecting...');
    navigate(isAdminUser ? '/admin-dashboard' : '/homeowner-dashboard');
  } catch (err) {
    setError(err.message || 'Invalid email or password');
    refreshCaptcha();
  }

  setLoading(false);
};


const handleSignup = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!signupData.fullName.trim() || signupData.fullName.length < 3) {
    setError('Full name must be at least 3 characters');
    setLoading(false);
    return;
  }

  if (!validateEmail(signupData.email)) {
    setError('Please enter a valid email address');
    setLoading(false);
    return;
  }

  if (!validatePhone(signupData.phone)) {
    setError('Please enter a valid 10-digit phone number');
    setLoading(false);
    return;
  }

  if (!validatePassword(signupData.password)) {
    setError('Password must be at least 6 characters long');
    setLoading(false);
    return;
  }

  if (signupData.password !== signupData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  try {
    const userPayload = {
      fullName: signupData.fullName,
      email: signupData.email,
      phone: signupData.phone,
      password: signupData.password,
      role: loginType === 'admin' ? 'ADMIN' : 'HOMEOWNER'
    };

    const response = await api.signup(userPayload);
    const isAdminUser = loginType === 'admin';
    const userType = isAdminUser ? 'admin' : 'homeowner';

    setSession({
      token: response.token,
      userEmail: response.email,
      userType,
      userName: signupData.fullName,
      userData: {
      fullName: signupData.fullName,
      email: response.email,
      phone: signupData.phone,
      role: isAdminUser ? 'ADMIN' : 'HOMEOWNER'
      },
    });

    localStorage.setItem('userPhone', signupData.phone);
    localStorage.setItem(`phone_${response.email.toLowerCase()}`, signupData.phone);
    localStorage.setItem(
      `profile_${response.email.toLowerCase()}`,
      JSON.stringify({ fullName: signupData.fullName, phone: signupData.phone, role: isAdminUser ? 'ADMIN' : 'HOMEOWNER' })
    );

    setSuccess('Account created successfully! Redirecting...');

    if (isAdminUser) {
      navigate('/admin-dashboard');
    } else {
      navigate('/homeowner-form');
    }

  } catch (err) {
    setError(err.message || 'Signup failed. Email might already be registered.');
  }

  setLoading(false);
};

  return (
    <div className="login-page">
      <div className="login-container">
        <div className={`login-header ${loginType === 'admin' ? 'admin-header' : ''}`}>
          <Link to="/" className="back-arrow">←</Link>
          <Link to="/" className="login-logo">HomePlus</Link>
          <div className="login-type">
            {loginType === 'admin' ? 'Administrator Portal' : 'Homeowner Portal'}
          </div>
        </div>

        <div className="login-body">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccess('');
              }}
            >
              Login
            </button>
            <button 
              className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setError('');
                setSuccess('');
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              {success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="tab-content active">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder={loginType === 'admin' ? 'yourname@homeplus.com' : 'your.email@example.com'}
                    required 
                    disabled={loading}
                  />
                  {loginType === 'admin' && (
                    <small className="form-hint">Admin accounts must use @homeplus.com email (e.g., yourname@homeplus.com)</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password" 
                      required 
                      disabled={loading}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className="form-options">
                  <div className="captcha-group">
                    <label>Captcha Verification *</label>
                    <div className="captcha-row">
                      <div className="captcha-question">Solve: {captchaQuestion} = ?</div>
                      <button
                        type="button"
                        className="captcha-refresh"
                        onClick={refreshCaptcha}
                        disabled={loading}
                      >
                        Refresh
                      </button>
                    </div>
                    <input
                      type="text"
                      name="captcha"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter answer"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
              <div className="form-footer">
                <p>Don't have an account? <button onClick={() => setActiveTab('signup')} className="link-btn">Sign up</button></p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <div className="tab-content active">
              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    placeholder="Enter your full name" 
                    required 
                    disabled={loading}
                    minLength={3}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder={loginType === 'admin' ? 'yourname@homeplus.com' : 'your.email@example.com'}
                    required 
                    disabled={loading}
                  />
                  {loginType === 'admin' && (
                    <small className="form-hint">Admin accounts must use @homeplus.com email (e.g., yourname@homeplus.com)</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={signupData.phone}
                    onChange={handleSignupChange}
                    placeholder="9876543210" 
                    required 
                    disabled={loading}
                  />
                  <small className="form-hint">Enter 10-digit phone number</small>
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Create a strong password" 
                      required 
                      disabled={loading}
                      minLength={8}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <small className="form-hint">Must be at least 8 characters long</small>
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Re-enter your password" 
                    required 
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>
              <div className="form-footer">
                <p>Already have an account? <button onClick={() => setActiveTab('login')} className="link-btn">Login</button></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
