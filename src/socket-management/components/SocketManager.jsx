import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import ConnectionPanel from './ConnectionPanel';
import PrinterManagement from './PrinterManagement';
import SocketLogs from './SocketLogs';
import './SocketManager.css';

const SocketManager = () => {
  const [activeTab, setActiveTab] = useState('connection');
  const {
    status,
    logs,
    connectedPrinters,
    connect,
    disconnect,
    registerPrinter,
    sendPrintCommand,
    openDrawer,
    requestPrintersList,
    clearLogs
  } = useSocket();

  const handleDisconnect = () => {
    const hasConnectedPrinters = connectedPrinters.length > 0;
    
    if (hasConnectedPrinters) {
      const confirmMessage = `You have ${connectedPrinters.length} connected printer${connectedPrinters.length === 1 ? '' : 's'}. Disconnecting will lose connection to all printers. Are you sure?`;
      if (window.confirm(confirmMessage)) {
        disconnect();
      }
    } else {
      disconnect();
    }
  };

  useEffect(() => {
    // Request printers list on component mount if connected
    if (status.isConnected) {
      requestPrintersList();
    }
  }, [status.isConnected, requestPrintersList]);

  const getTabClass = (tabName) => {
    return `socket-tab ${activeTab === tabName ? 'active' : ''}`;
  };

  const getStatusIndicator = () => {
    const statusClass = `status-indicator ${status.connectionStatus}`;
    const statusText = {
      connected: '🟢 Connected',
      disconnected: '🔴 Disconnected',
      connecting: '🟡 Connecting...',
      reconnecting: '🟡 Reconnecting...',
      disconnecting: '🟡 Disconnecting...',
      error: '🔴 Error',
      failed: '🔴 Failed'
    };

    return (
      <div className={statusClass}>
        {statusText[status.connectionStatus] || '🔴 Unknown'}
      </div>
    );
  };

  return (
    <div className="socket-manager">
      <div className="socket-header">
        <h2>Socket.IO Management</h2>
        <div className="header-info">
          {getStatusIndicator()}
          <div className="connection-details">
            {status.isConnected && (
              <>
                <span className="socket-id">ID: {status.socketId}</span>
                <span className="unit-info">Unit: {status.unit}</span>
                <span className="printer-count">Printers: {status.connectedPrinters}</span>
              </>
            )}
          </div>
          {status.isConnected && (
            <button
              onClick={handleDisconnect}
              className="btn-danger"
              style={{ 
                fontSize: '12px', 
                padding: '6px 12px',
                marginLeft: '16px'
              }}
              title="Disconnect from socket server"
            >
              🔌 Disconnect
            </button>
          )}
        </div>
      </div>

      <div className="socket-tabs">
        <button 
          className={getTabClass('connection')}
          onClick={() => setActiveTab('connection')}
        >
          Connection
        </button>
        <button 
          className={getTabClass('printers')}
          onClick={() => setActiveTab('printers')}
        >
          Printers ({connectedPrinters.length})
        </button>
        <button 
          className={getTabClass('logs')}
          onClick={() => setActiveTab('logs')}
        >
          Logs ({logs.length})
        </button>
      </div>

      <div className="socket-content">
        {activeTab === 'connection' && (
          <ConnectionPanel
            status={status}
            onConnect={connect}
            onDisconnect={handleDisconnect}
          />
        )}

        {activeTab === 'printers' && (
          <PrinterManagement
            connectedPrinters={connectedPrinters}
            isConnected={status.isConnected}
            onRegisterPrinter={registerPrinter}
            onSendPrintCommand={sendPrintCommand}
            onOpenDrawer={openDrawer}
            onRefreshPrinters={requestPrintersList}
            onDisconnect={handleDisconnect}
          />
        )}

        {activeTab === 'logs' && (
          <SocketLogs
            logs={logs}
            onClearLogs={clearLogs}
          />
        )}
      </div>
    </div>
  );
};

export default SocketManager;