import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/api';
import '../../styles/Auth.css';

const EyeOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5.25C4.5 5.25 1.5 12 1.5 12C1.5 12 4.5 18.75 12 18.75C19.5 18.75 22.5 12 22.5 12C22.5 12 19.5 5.25 12 5.25Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88003M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06003L17.94 17.94ZM9.9 4.24002C10.5883 4.0789 11.2931 3.99836 12 4.00003C19 4.00003 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19L9.9 4.24002Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, currentUser, loading, error, setError } = useContext(AuthContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoRotateRef = useRef(null);
  const navigate = useNavigate();

  // Function to change slides with transition control
  const changeSlide = (slideIndex) => {
    if (isTransitioning || slideIndex === currentSlide) return;

    setIsTransitioning(true);
    setCurrentSlide(slideIndex);

    // Reset auto-rotation timer when manually changing slides
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
      setupAutoRotation();
    }

    // Allow next transition after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match this to CSS transition duration
  };

  // Set up auto-rotation for slides
  const setupAutoRotation = () => {
    autoRotateRef.current = setInterval(() => {
      if (!isTransitioning) {
        const nextSlide = (currentSlide + 1) % 3;
        setCurrentSlide(nextSlide);
      }
    }, 5000); // Change slide every 5 seconds
  };

  useEffect(() => {
    setupAutoRotation();

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [currentSlide, isTransitioning]);

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';

    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error message when user types
    if (error) setError(null);

    // Clear field-specific errors when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(getApiUrl('api/auth/login'), credentials);
      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set user in context
      login(token, user);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      // Handle login error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await handleLogin(formData);
    } catch (err) {
      // Error is set in the context
    }
  };

  // Define slides content for cleaner code
  const slides = [
    {
      image: "/img/logo.jpeg",
      alt: "Psquare Office",
      title: "Welcome to Psquare HRMS",
      description: "Streamlined HR management for modern enterprises",
      subtext: "Manage all your HR operations from a single, intuitive dashboard"
    },
    {
      image: "/img/prabhSir.jpg",
      alt: "Psquare Team",
      title: "Employee Management",
      description: "Seamless onboarding and employee lifecycle management",
      subtext: "From hiring to retirement, manage every step of the employee journey"
    },
    {
      image: "/img/armaansir.jpeg",
      alt: "Psquare Analytics",
      title: "Analytics Dashboard",
      description: "Data-driven HR decisions at your fingertips",
      subtext: "Visualize key metrics to optimize your workforce management"
    }
  ];

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-box">
            <img src="/img/Logo.jpeg" alt="Logo" className="logo-image" />
          </div>
        </div>

        <div className="auth-content">
          <div className="auth-image-container">
            <div className="carousel-container">
              <div
                className="carousel-slides"
                style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
              >
                {slides.map((slide, index) => (
                  <div key={`slide-${index}`} className="carousel-slide">
                    <img src={slide.image} alt={slide.alt} className="dashboard-preview" />
                    <div className="image-overlay">
                      <h3>{slide.title}</h3>
                      <p>{slide.description}</p>
                      <p className="small-text">{slide.subtext}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dots">
                {[0, 1, 2].map((index) => (
                  <span
                    key={`dot-${index}`}
                    className={`dot ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => changeSlide(index)}
                    role="button"
                    aria-label={`Go to slide ${index + 1}`}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          <div className="auth-form-container">
            <h2>Welcome to Dashboard</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password*</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={formErrors.password ? 'error' : ''}
                  />
                  <span
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    role="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </span>
                </div>
                {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                <div className="forgot-password">
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="auth-footer">
                <p>Don't have an account? <Link to="/register" className="register-link">Register</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;