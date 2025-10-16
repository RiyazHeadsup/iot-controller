import React, { useState, useEffect } from 'react';
import socketConnectionManager from './SocketConnectionManager';
import { getSelectedUnit } from '../../storage/Storage';
import PrinterSettings from './PrinterSettings';

const SocketManager = () => {
  const [status, setStatus] = useState(socketConnectionManager.getStatus());
  const [logs, setLogs] = useState(socketConnectionManager.getLogs());
  const [serverUrl, setServerUrl] = useState('ws://localhost:9000');
  const [activeTab, setActiveTab] = useState('connection');

  const selectedUnit = getSelectedUnit();

  useEffect(() => {
    // Set up event listeners
    const handleConnectionStatus = () => {
      setStatus(socketConnectionManager.getStatus());
    };

    const handleLogAdded = () => {
      setLogs(socketConnectionManager.getLogs());
    };

    // Register event listeners
    socketConnectionManager.on('connection_status', handleConnectionStatus);
    socketConnectionManager.on('log_added', handleLogAdded);

    // Auto-connect when unit is selected (but not if manually disconnected)
    if (selectedUnit?.unitIds && !status.isConnected && status.connectionStatus === 'disconnected' && !status.isManuallyDisconnected) {
      setTimeout(() => {
        socketConnectionManager.autoConnect();
      }, 1000);
    }

    // Cleanup on unmount
    return () => {
      socketConnectionManager.off('connection_status', handleConnectionStatus);
      socketConnectionManager.off('log_added', handleLogAdded);
    };
  }, [selectedUnit?.unitIds, status.isConnected, status.connectionStatus]);

  const handleConnect = () => {
    if (!serverUrl.trim()) {
      alert('Please enter a valid server URL');
      return;
    }
    socketConnectionManager.connect(serverUrl);
  };

  const handleDisconnect = () => {
    socketConnectionManager.disconnect();
  };

  const handleRetry = () => {
    socketConnectionManager.retryConnection(serverUrl);
  };

  const handleClearLogs = () => {
    socketConnectionManager.clearLogs();
  };

  const getStatusColor = () => {
    switch (status.connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status.connectionStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'failed': return '🔴';
      default: return '🔴';
    }
  };

  if (!selectedUnit?.unitIds) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">Unit Selection Required</h2>
          <p className="text-yellow-700">
            Please select a unit from the dropdown above to access socket management features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border mb-6">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Socket Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage socket connections for unit: <span className="font-medium text-blue-600">{selectedUnit.unitName}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getStatusIcon()}</span>
                <span className={`font-medium ${getStatusColor()}`}>
                  {status.connectionStatus}
                </span>
                {status.connectionStatus === 'connecting' && (
                  <span className="text-xs text-gray-500">
                    ({status.connectionAttempts}/{status.maxAttempts})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow border mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('connection')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'connection'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Connection Settings
              </button>
              <button
                onClick={() => setActiveTab('printer')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'printer'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Printer Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'connection' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Socket Server URL:
                  </label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="ws://localhost:9000"
                    disabled={status.isConnected}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      status.isConnected ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div className="flex gap-3">
                  {!status.isConnected ? (
                    <>
                      {status.isManualConnectionRequired ? (
                        <button
                          onClick={handleRetry}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                          Retry Connection
                        </button>
                      ) : (
                        <button
                          onClick={handleConnect}
                          disabled={status.connectionStatus === 'connecting'}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                        >
                          {status.connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {status.isConnected && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-700 font-medium">
                      ✅ Connected to {status.serverUrl}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Socket ID: {status.socketId}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'printer' && (
              <PrinterSettings isConnected={status.isConnected} />
            )}
          </div>
        </div>

        {/* Logs Panel */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Connection Logs</h2>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Clear Logs
            </button>
          </div>
          <div className="p-6">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No logs available</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded border-l-4 ${
                      log.level === 'error' ? 'bg-red-50 border-l-red-500 text-red-700' :
                      log.level === 'warning' ? 'bg-yellow-50 border-l-yellow-500 text-yellow-700' :
                      log.level === 'success' ? 'bg-green-50 border-l-green-500 text-green-700' :
                      'bg-blue-50 border-l-blue-500 text-blue-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{log.message}</p>
                      <span className="text-xs opacity-75">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketManager;