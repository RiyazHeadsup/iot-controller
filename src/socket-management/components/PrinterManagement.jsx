import React, { useState } from 'react';

const PrinterManagement = ({ 
  connectedPrinters, 
  isConnected, 
  onRegisterPrinter, 
  onSendPrintCommand, 
  onOpenDrawer, 
  onRefreshPrinters,
  onDisconnect
}) => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newPrinter, setNewPrinter] = useState({
    printerId: '',
    printerName: '',
    printerType: 'thermal',
    location: ''
  });
  const [testMessage, setTestMessage] = useState('Test Print from Socket Manager');

  const handleRegisterPrinter = (e) => {
    e.preventDefault();
    
    if (!newPrinter.printerId.trim()) {
      alert('Printer ID is required');
      return;
    }

    const success = onRegisterPrinter(newPrinter);
    if (success) {
      setNewPrinter({
        printerId: '',
        printerName: '',
        printerType: 'thermal',
        location: ''
      });
      setShowRegisterForm(false);
    }
  };

  const handleTestPrint = (printerId) => {
    onSendPrintCommand(printerId, 'test_print', {
      text: testMessage,
      type: 'test'
    });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      online: '#10b981',
      offline: '#ef4444',
      error: '#f59e0b',
      busy: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  if (!isConnected) {
    return (
      <div className="printer-management disabled">
        <div className="not-connected">
          <div className="icon">🔌</div>
          <h3>Not Connected</h3>
          <p>Please connect to the socket server first to manage printers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="printer-management">
      <div className="panel-header">
        <h3>Printer Management</h3>
        <div className="header-actions">
          <button
            onClick={onRefreshPrinters}
            className="btn-secondary"
            title="Refresh Printers List"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => setShowRegisterForm(!showRegisterForm)}
            className="btn-secondary"
          >
            {showRegisterForm ? 'Cancel' : '+ Manual Register'}
          </button>
          {isConnected && (
            <button
              onClick={onDisconnect}
              className="btn-danger"
              title="Disconnect from socket server"
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              🔌 Disconnect
            </button>
          )}
        </div>
      </div>

      {showRegisterForm && (
        <div className="register-form-container">
          <form onSubmit={handleRegisterPrinter} className="register-form">
            <h4>Register New Printer</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="printerId">Printer ID *</label>
                <input
                  id="printerId"
                  type="text"
                  value={newPrinter.printerId}
                  onChange={(e) => setNewPrinter({...newPrinter, printerId: e.target.value})}
                  placeholder="e.g., PRINTER_001"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="printerName">Printer Name</label>
                <input
                  id="printerName"
                  type="text"
                  value={newPrinter.printerName}
                  onChange={(e) => setNewPrinter({...newPrinter, printerName: e.target.value})}
                  placeholder="e.g., Kitchen Printer"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="printerType">Printer Type</label>
                <select
                  id="printerType"
                  value={newPrinter.printerType}
                  onChange={(e) => setNewPrinter({...newPrinter, printerType: e.target.value})}
                  className="form-select"
                >
                  <option value="thermal">Thermal Printer</option>
                  <option value="inkjet">Inkjet Printer</option>
                  <option value="laser">Laser Printer</option>
                  <option value="dot_matrix">Dot Matrix Printer</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  value={newPrinter.location}
                  onChange={(e) => setNewPrinter({...newPrinter, location: e.target.value})}
                  placeholder="e.g., Kitchen, Counter, Bar"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Register Printer
              </button>
              <button 
                type="button" 
                onClick={() => setShowRegisterForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="test-print-section">
        <h4>Test Print Message</h4>
        <div className="test-message-input">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message"
            className="form-input"
          />
        </div>
      </div>


      <div className="printers-list">
        <h4>Connected Printers ({connectedPrinters.length})</h4>
        
        {connectedPrinters.length === 0 ? (
          <div className="no-printers">
            <div className="icon">🖨️</div>
            <p>No printers connected</p>
            <small>Register a printer or wait for printers to connect</small>
          </div>
        ) : (
          <div className="printers-grid">
            {connectedPrinters.map((printer, index) => (
              <div key={printer.printerId || index} className="printer-card">
                <div className="printer-header">
                  <div className="printer-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h5>{printer.printerName || printer.printerId}</h5>
                    </div>
                    <span className="printer-id">ID: {printer.printerId}</span>
                  </div>
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(printer.status) }}
                    title={`Status: ${printer.status}`}
                  >
                    {printer.status}
                  </div>
                </div>

                <div className="printer-details">
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span className="value">{printer.printerType}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{printer.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Connected:</span>
                    <span className="value">{formatTimestamp(printer.connectedAt)}</span>
                  </div>
                  {printer.lastUpdate && (
                    <div className="detail-item">
                      <span className="label">Last Update:</span>
                      <span className="value">{formatTimestamp(printer.lastUpdate)}</span>
                    </div>
                  )}
                  {printer.lastError && (
                    <div className="detail-item error">
                      <span className="label">Last Error:</span>
                      <span className="value">{printer.lastError}</span>
                    </div>
                  )}
                </div>

                <div className="printer-actions">
                  <button
                    onClick={() => handleTestPrint(printer.printerId)}
                    className="btn-secondary"
                    disabled={printer.status === 'offline'}
                  >
                    🖨️ Test Print
                  </button>
                  <button
                    onClick={() => onOpenDrawer(printer.printerId)}
                    className="btn-secondary"
                    disabled={printer.status === 'offline'}
                  >
                    💰 Open Drawer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrinterManagement;