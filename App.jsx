import React, { useState, useEffect } from 'react';
import Login from './Login/Login.jsx';
import { getAcessToken, getElevateUser } from './storage/Storage';

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
    setIsAuthenticated(true);
    setUser(loginData.user);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">IoT Controller Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user?.img || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "User")}
                  alt={user?.name}
                />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to IoT Controller
              </h2>
              <p className="text-gray-600 mb-6">
                You are successfully logged in as {user?.name}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Role</h3>
                  <p className="text-gray-600">{user?.roleData?.roleName}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Type</h3>
                  <p className="text-gray-600">{user?.userType}</p>
                </div>
                
                {user?.unitIds && user?.unitIds.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unit</h3>
                    <p className="text-gray-600">{user?.unitIds[0]?.unitName}</p>
                  </div>
                )}
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-600">{user?.phoneNumber}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gender</h3>
                  <p className="text-gray-600">{user?.gender}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;