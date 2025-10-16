import React, { useEffect, useState } from 'react';
import { SocketManager, useSocket, socketController } from '../index';

/**
 * Example integration component showing how to use Socket Management
 * This component can be added to your main application
 */
const SocketIntegration = () => {
  const [showSocketManager, setShowSocketManager] = useState(false);
  const { status, connectedPrinters } = useSocket();

  // Example: Auto-connect when user logs in and selects unit
  useEffect(() => {
    // You can add logic here to auto-connect when certain conditions are met
    // For example, when user selects a unit after login
    
    // Example auto-connect (commented out for safety)
    // const autoConnect = async () => {
    //   const token = getAcessToken();
    //   const unit = getSelectedUnit();
    //   
    //   if (token && unit?.unitIds && !status.isConnected) {
    //     socketController.connect('ws://your-socket-server:3001');
    //   }
    // };
    // 
    // autoConnect();
  }, [status.isConnected]);

  // Example: Listen for specific socket events
  useEffect(() => {
    const handlePrintResult = (data) => {
      // Handle print result in your application
      console.log('Print result received:', data);
      
      // You could show a notification, update UI, etc.
      if (data.success) {
        // Show success notification
        console.log(`Print command ${data.commandId} completed successfully`);
      } else {
        // Show error notification
        console.error(`Print command ${data.commandId} failed: ${data.errorMessage}`);
      }
    };

    const handlePrinterDisconnected = (data) => {
      // Handle printer disconnection
      console.log('Printer disconnected:', data);
      
      // You could show a warning notification
      alert(`Printer ${data.printerName} has disconnected`);
    };

    // Register event listeners
    socketController.on('print_result', handlePrintResult);
    socketController.on('printer_disconnected', handlePrinterDisconnected);

    // Cleanup
    return () => {
      socketController.off('print_result', handlePrintResult);
      socketController.off('printer_disconnected', handlePrinterDisconnected);
    };
  }, []);

  // Example function to send a print command from anywhere in your app
  const sendTestPrint = (printerId) => {
    const printData = {
      type: 'receipt',
      content: [
        { type: 'text', value: 'Test Receipt', style: 'bold' },
        { type: 'text', value: '---------------' },
        { type: 'text', value: 'Item 1: $10.00' },
        { type: 'text', value: 'Item 2: $15.00' },
        { type: 'text', value: '---------------' },
        { type: 'text', value: 'Total: $25.00', style: 'bold' }
      ]
    };

    socketController.sendPrintCommand(printerId, 'print_receipt', printData);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Socket Integration Example</h2>
      
      {/* Socket Status Display */}
      <div style={{ 
        padding: '16px', 
        backgroundColor: status.isConnected ? '#d1fae5' : '#fee2e2',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Socket Status</h3>
        <p>Status: {status.connectionStatus}</p>
        <p>Connected Printers: {status.connectedPrinters}</p>
        {status.isConnected && <p>Socket ID: {status.socketId}</p>}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => socketController.connect('ws://localhost:3001')}
            disabled={status.isConnected}
            style={{
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: status.isConnected ? 'not-allowed' : 'pointer',
              opacity: status.isConnected ? 0.5 : 1
            }}
          >
            Connect to Socket Server
          </button>

          <button
            onClick={() => socketController.disconnect()}
            disabled={!status.isConnected}
            style={{
              padding: '10px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !status.isConnected ? 'not-allowed' : 'pointer',
              opacity: !status.isConnected ? 0.5 : 1
            }}
          >
            Disconnect
          </button>

          <button
            onClick={() => socketController.requestPrintersList()}
            disabled={!status.isConnected}
            style={{
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !status.isConnected ? 'not-allowed' : 'pointer',
              opacity: !status.isConnected ? 0.5 : 1
            }}
          >
            Refresh Printers
          </button>

          <button
            onClick={() => setShowSocketManager(!showSocketManager)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {showSocketManager ? 'Hide' : 'Show'} Socket Manager
          </button>
        </div>
      </div>

      {/* Connected Printers List */}
      {connectedPrinters.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Connected Printers</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {connectedPrinters.map((printer) => (
              <div
                key={printer.printerId}
                style={{
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{printer.printerName || printer.printerId}</strong>
                    <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                      {printer.location} • {printer.printerType} • {printer.status}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => sendTestPrint(printer.printerId)}
                      disabled={printer.status === 'offline'}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: printer.status === 'offline' ? 'not-allowed' : 'pointer',
                        opacity: printer.status === 'offline' ? 0.5 : 1
                      }}
                    >
                      Test Print
                    </button>
                    <button
                      onClick={() => socketController.openDrawer(printer.printerId)}
                      disabled={printer.status === 'offline'}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: printer.status === 'offline' ? 'not-allowed' : 'pointer',
                        opacity: printer.status === 'offline' ? 0.5 : 1
                      }}
                    >
                      Open Drawer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Socket Manager Component */}
      {showSocketManager && (
        <div style={{ marginTop: '20px' }}>
          <SocketManager />
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h3>Usage Instructions</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Make sure you're logged in with valid credentials</li>
          <li>Select a unit from your unit selection component</li>
          <li>Click "Connect to Socket Server" to establish connection</li>
          <li>Register printers using the Socket Manager interface</li>
          <li>Use the integrated print and drawer commands</li>
          <li>Monitor logs and connection status in real-time</li>
        </ol>

        <h4>Integration Notes:</h4>
        <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
          <li>Import components from: <code>src/socket-management</code></li>
          <li>Use the <code>useSocket</code> hook for reactive state management</li>
          <li>Listen for socket events using <code>socketController.on()</code></li>
          <li>All printer operations include unit ID authentication</li>
          <li>Logs are automatically captured and can be exported</li>
        </ul>
      </div>
    </div>
  );
};

export default SocketIntegration;