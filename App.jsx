import React, { useState, useEffect } from 'react';
import Login from './Login/Login.jsx';
import Dashboard from './src/Dashboard/Dashboard.jsx';
import { getAcessToken, getElevateUser, setSelectedUnit, getSelectedUnit, setElevateUser, setAcessToken } from './storage/Storage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAcessToken();
    const userData = getElevateUser();
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = (loginData) => {
    // Store user data and access token in localStorage
    setElevateUser(loginData.user);
    setAcessToken(loginData.accessToken);
    
    setIsAuthenticated(true);
    setUser(loginData.user);
    
    // Auto-select first unit if available
    if (loginData.user?.unitIds && loginData.user.unitIds.length > 0) {
      const firstUnit = loginData.user.unitIds[0];
      const unitData = {
        unitIds: firstUnit._id,
        unitName: firstUnit.unitName,
        unitCode: firstUnit.unitCode,
        ...firstUnit
      };
      setSelectedUnit(unitData);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;