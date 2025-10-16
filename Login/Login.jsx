import React, { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff, User, Shield } from 'lucide-react';
import { HitApi } from './ApiHit';
import { login } from '../utils/Constant';
import { setAcessToken, setElevateUser, setSelectedUnit } from '../storage/Storage';

const Login = ({ onLoginSuccess }) => {
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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
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

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        
        if (response?.statusCode === 200 && response?.success) {
          let newUser = response?.data?.user;
          newUser.roleData = newUser?.roleId;
          
          setElevateUser(newUser);
          setAcessToken(response?.data?.accessToken);
          
          if (newUser?.unitIds && newUser?.unitIds.length > 0) {
            setSelectedUnit(newUser?.unitIds[0]);
          }

          console.log("Login successful", response);
          
          if (onLoginSuccess) {
            onLoginSuccess(response.data);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 p-4">
      <div className="max-w-md w-full bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">IoT Controller</h1>
          <p className="text-gray-600">Sign in to your account</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800 font-medium ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
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

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`w-full pl-12 pr-14 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-800 font-medium ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
                }`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
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

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-6 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            disabled={isSubmitting || !isOnline}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        {!isOnline && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
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