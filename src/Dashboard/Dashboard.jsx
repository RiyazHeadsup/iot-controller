import React, { useState, useEffect } from 'react';
import { getSelectedUnit, setSelectedUnit } from '../../storage/Storage';
import SocketManager from '../socketManagement/SocketManager';

const Dashboard = ({ user, onLogout }) => {
  const [selectedUnit, setSelectedUnitState] = useState(null);

  useEffect(() => {
    // Check for saved selected unit
    const savedUnit = getSelectedUnit();
    if (savedUnit) {
      setSelectedUnitState(savedUnit);
    }
  }, []);

  const handleUnitChange = (unit) => {
    const unitData = {
      unitIds: unit._id,
      unitName: unit.unitName,
      ...unit
    };
    setSelectedUnit(unitData);
    setSelectedUnitState(unitData);
  };

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
                onClick={onLogout}
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
          <SocketManager />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;