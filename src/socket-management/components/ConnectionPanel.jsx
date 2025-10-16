import React, { useState } from 'react';
import { getSelectedUnit } from '../../../storage/Storage';

const ConnectionPanel = ({ 
  status, 
  onConnect, 
  onDisconnect
}) => {
  const [serverUrl, setServerUrl] = useState('ws://localhost:9000');
  const [isConnecting, setIsConnecting] = useState(false);

  const selectedUnit = getSelectedUnit();

  const handleConnect = async () => {
    if (!serverUrl.trim()) {
      alert('Please enter a valid server URL');
      return;
    }

    if (!selectedUnit?.unitIds) {
      alert('Please select a unit before connecting');
      return;
    }

    setIsConnecting(true);
    try {
      const success = onConnect(serverUrl);
      if (!success) {
        alert('Failed to initiate connection. Check console for details.');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Connection failed: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  const getConnectionStatusBadge = () => {
    const statusMap = {
      connected: { color: '#10b981', text: 'Connected' },
      disconnected: { color: '#ef4444', text: 'Disconnected' },
      connecting: { color: '#f59e0b', text: 'Connecting...' },
      reconnecting: { color: '#f59e0b', text: 'Reconnecting...' },
      error: { color: '#ef4444', text: 'Connection Error' },
      failed: { color: '#ef4444', text: 'Connection Failed' }
    };

    const statusInfo = statusMap[status.connectionStatus] || statusMap.disconnected;

    return (
      <div 
        className="status-badge"
        style={{ 
          backgroundColor: statusInfo.color + '20',
          color: statusInfo.color,
          border: `1px solid ${statusInfo.color}`,
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        {statusInfo.text}
      </div>
    );
  };

  return (
    <div className="connection-panel">
      <div className="panel-section">
        <h3>Connection Settings</h3>
        
        <div className="form-group">
          <label htmlFor="serverUrl">Socket Server URL:</label>
          <input
            id="serverUrl"
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="ws://localhost:9000"
            disabled={status.isConnected}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Selected Unit:</label>
          <div className="unit-info">
            {selectedUnit?.unitIds ? (
              <span className="unit-badge">{selectedUnit.unitIds}</span>
            ) : (
              <span className="no-unit">No unit selected</span>
            )}
          </div>
        </div>

        <div className="connection-actions">
          {!status.isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting || !selectedUnit?.unitIds}
              className="btn-primary"
            >
              {status.isManualConnectionRequired 
                ? `Retry Connection (${status.connectionAttempts}/${5} failed)` 
                : isConnecting 
                  ? `Connecting... (${status.connectionAttempts}/${5})` 
                  : 'Connect'
              }
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #10b981',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#065f46'
              }}>
                ✅ Connected to {serverUrl}
              </div>
              <button
                onClick={handleDisconnect}
                className="btn-danger"
              >
                🔌 Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="panel-section">
        <h3>Connection Status</h3>
        
        <div className="status-grid">
          <div className="status-item">
            <label>Status:</label>
            {getConnectionStatusBadge()}
          </div>

          {status.isConnected && (
            <>
              <div className="status-item">
                <label>Socket ID:</label>
                <span className="value">{status.socketId}</span>
              </div>

              <div className="status-item">
                <label>Unit ID:</label>
                <span className="value">{status.unit}</span>
              </div>

              <div className="status-item">
                <label>Connected Printers:</label>
                <span className="value">{status.connectedPrinters}</span>
              </div>
            </>
          )}

          {status.connectionAttempts > 0 && (
            <div className="status-item">
              <label>Connection Attempts:</label>
              <span className="value">{status.connectionAttempts}/5</span>
            </div>
          )}
        </div>
      </div>


      <div className="panel-section">
        <h3>Connection Guidelines</h3>
        <div className="guidelines">
          <div className="guideline-item">
            <span className="icon">🔐</span>
            <span>Make sure you are logged in with valid credentials</span>
          </div>
          <div className="guideline-item">
            <span className="icon">🏢</span>
            <span>Select a unit before attempting to connect</span>
          </div>
          <div className="guideline-item">
            <span className="icon">🌐</span>
            <span>Ensure the socket server is running and accessible</span>
          </div>
          <div className="guideline-item">
            <span className="icon">🔌</span>
            <span>Check firewall settings if connection fails</span>
          </div>
          <div className="guideline-item">
            <span className="icon">🔄</span>
            <span>Connection will auto-retry up to 5 times before requiring manual retry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPanel;