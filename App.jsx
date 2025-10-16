import React, { useState, useEffect } from 'react';
import Login from './Login/Login.jsx';
import { getAcessToken, getElevateUser, setSelectedUnit, getSelectedUnit } from './storage/Storage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnitState] = useState(null);

  useEffect(() => {
    const token = getAcessToken();
    const userData = getElevateUser();
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(userData);
      
      // Check for saved selected unit
      const savedUnit = getSelectedUnit();
      if (savedUnit) {
        setSelectedUnitState(savedUnit);
      }
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = (loginData) => {
    setIsAuthenticated(true);
    setUser(loginData.user);
  };

  const handleUnitChange = (unit) => {
    const unitData = {
      unitIds: unit._id,
      unitName: unit.unitName,
      ...unit
    };
    setSelectedUnit(unitData);
    setSelectedUnitState(unitData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setSelectedUnitState(null);
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
              {/* Unit Selector Dropdown */}
              {user?.unitIds && user.unitIds.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedUnit?._id || ''}
                    onChange={(e) => {
                      const unit = user.unitIds.find(u => u._id === e.target.value);
                      if (unit) handleUnitChange(unit);
                    }}
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Unit</option>
                    {user.unitIds.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.unitName} ({unit.unitCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
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
                
                {selectedUnit && (
                  <div className="bg-blue-50 p-6 rounded-lg shadow border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Selected Unit</h3>
                    <p className="text-blue-700 font-medium">{selectedUnit.unitName}</p>
                    <p className="text-blue-600 text-sm mt-1">Code: {selectedUnit.unitCode}</p>
                    <p className="text-blue-600 text-sm">ID: {selectedUnit.unitIds}</p>
                  </div>
                )}
                
                {!selectedUnit && user?.unitIds && user.unitIds.length > 0 && (
                  <div className="bg-yellow-50 p-6 rounded-lg shadow border-2 border-yellow-200">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Unit Selected</h3>
                    <p className="text-yellow-700">Please select a unit from the dropdown above to continue.</p>
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