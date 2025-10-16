import React, { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff, User, Shield, Scissors } from 'lucide-react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import { HitApi } from '../../Api/ApiHit';
import { login, searchRole } from '../../constant/Constant';
import { setAcessToken, setElevateUser, setSelectedUnit } from '../../storage/Storage';
import { setUserData } from '../../redux/Actions/UserAction';
import logo from '../../images/Elevate.png';
import background from '../../images/login.jpg'
import { getNavigationPath } from '../../utils/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize particles
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

  useEffect(() => {
    // Prevent vertical scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setErrors({
        ...errors,
        general: 'No internet connection. Please check your network and try again.'
      });
      return;
    }

    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({ email: '', password: '', general: '' });

      const loginData = {
        email: email.trim(),
        password: password,
      };
      try {
        const response = await HitApi(loginData, login);
        console.log("Login response:", response);
        if (response?.statusCode === 200) {
          let newUser = response?.data?.user
          newUser.roleData = newUser?.roleId
          setElevateUser(newUser);
          setAcessToken(response?.data?.accessToken);
          console.log("response", response);
          setSelectedUnit(newUser?.unitIds[0])

          if (response?.data?.user?.roleData?.permission?.length === 1) {
            let path = getNavigationPath(response?.data?.user?.roleData?.permission[0].value)

            window.location.href = path
          }
          else {
            window.location.href = '/'
          }

        } else {
          setErrors({
            email: '',
            password: '',
            general: response?.message || 'Login failed. Please check your credentials and try again.'
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({
          email: '',
          password: '',
          general: 'An unexpected error occurred. Please try again later.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const particlesOptions = {
    fpsLimit: 60,
    background: {
      color: {
        value: "transparent",
      },
    },
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: ["push", "bubble"],
        },
        onHover: {
          enable: true,
          mode: "grab",
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 3,
        },
        grab: {
          distance: 150,
          links: {
            opacity: 0.6,
          },
        },
        bubble: {
          distance: 200,
          size: 8,
          duration: 2,
          opacity: 0.8,
        },
      },
    },
    particles: {
      color: {
        value: ["#f7d552", "#fbbf24", "#f59e0b", "#d97706", "#92400e"],
      },
      links: {
        color: "#f7d552",
        distance: 120,
        enable: true,
        opacity: 0.15,
        width: 1,
        triangles: {
          enable: true,
          opacity: 0.05,
        },
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "out",
        },
        random: true,
        speed: 0.8,
        straight: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200,
        },
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 60,
      },
      opacity: {
        value: { min: 0.1, max: 0.4 },
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false,
        },
      },
      shape: {
        type: ["circle", "triangle", "star"],
        options: {
          star: {
            sides: 5,
          },
          triangle: {
            sides: 3,
          },
        },
      },
      size: {
        value: { min: 2, max: 6 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 1,
          sync: false,
        },
      },
      twinkle: {
        particles: {
          enable: true,
          frequency: 0.05,
          opacity: 1,
        },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: {
          enable: true,
          speed: 5,
          sync: false,
        },
      },
    },
    detectRetina: true,
    smooth: true,
    style: {
      filter: "blur(0.3px)",
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-end p-4 sm:p-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${background})`,
        }}
      >
        <div className="h-full w-full" style={{ background: "rgba(0, 0, 0, 0.6)" }}></div>
      </div>

      <div className="absolute inset-0 z-10">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
        />
      </div>

      {/* Login card */}
      <div className="relative z-20 max-w-xl w-full max-h-screen overflow-y-auto px-6 sm:px-10 py-8 sm:py-12 mx-4 bg-white bg-opacity-98 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-2">
          {/* Logo and Admin Panel Header */}
          <div className="mb-6 text-center">
            <img src={logo} alt="Elevate Logo" className="h-16 sm:h-20 w-auto mx-auto mb-4" />
            <div className="flex items-center justify-center text-gray-600">
              <Scissors className="h-4 w-4 mr-2" />
              <p className="text-sm font-medium">Salon Management System</p>
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto mt-3"></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-gray-800 font-medium ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                  }`}
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center font-medium">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 text-gray-800 font-medium ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                  }`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                onClick={togglePasswordVisibility}
                disabled={isSubmitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center font-medium">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 sm:py-4 px-6 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            disabled={isSubmitting || !isOnline}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 sm:h-6 w-5 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Accessing...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Login
              </>
            )}
          </button>
        </form>

        {/* Offline Alert */}
        {!isOnline && (
          <div className="mt-4 sm:mt-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800">No Internet Connection</h3>
                <p className="text-sm text-red-700 mt-1">Please check your internet connection and try again.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;