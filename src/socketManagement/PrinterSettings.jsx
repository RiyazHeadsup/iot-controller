import React, { useState, useEffect } from 'react';
import socketConnectionManager from './SocketConnectionManager';
import { getSelectedUnit } from '../../storage/Storage';

const PrinterSettings = ({ isConnected }) => {
  const [registeredPrinters, setRegisteredPrinters] = useState([]);
  const [printerForm, setPrinterForm] = useState({
    printerIp: ''
  });
  const [savedPrinter, setSavedPrinter] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const selectedUnit = getSelectedUnit();

  useEffect(() => {
    // Load saved printer from localStorage
    const loadSavedPrinter = () => {
      if (selectedUnit?.unitIds) {
        const saved = localStorage.getItem(`printer_${selectedUnit.unitIds}`);
        if (saved) {
          const printerData = JSON.parse(saved);
          setSavedPrinter(printerData);
          setPrinterForm({ printerIp: printerData.printerIp });
        }
      }
    };

    loadSavedPrinter();

    const handlePrinterRegistered = (printerData) => {
      setRegisteredPrinters(prev => {
        const exists = prev.find(p => p.printerId === printerData.printerId);
        if (exists) {
          return prev.map(p => 
            p.printerId === printerData.printerId 
              ? { ...printerData, status: 'online', connectedAt: new Date().toISOString() }
              : p
          );
        }
        return [...prev, { ...printerData, status: 'online', connectedAt: new Date().toISOString() }];
      });
    };

    const handlePrinterDisconnected = (data) => {
      setRegisteredPrinters(prev => 
        prev.map(p => 
          p.printerId === data.printerId 
            ? { ...p, status: 'offline' }
            : p
        )
      );
    };

    // Register event listeners
    socketConnectionManager.on('printer_registered', handlePrinterRegistered);
    socketConnectionManager.on('printer_disconnected', handlePrinterDisconnected);

    // Cleanup on unmount
    return () => {
      socketConnectionManager.off('printer_registered', handlePrinterRegistered);
      socketConnectionManager.off('printer_disconnected', handlePrinterDisconnected);
    };
  }, [selectedUnit?.unitIds]);

  const handleAddPrinter = () => {
    if (!selectedUnit?.unitIds || !printerForm.printerIp.trim()) {
      alert('Please fill in Printer IP');
      return;
    }

    const printerData = {
      printerId: selectedUnit.unitIds,
      printerIp: printerForm.printerIp.trim()
    };

    const success = socketConnectionManager.registerPrinter(printerData);
    if (success) {
      // Save to localStorage
      localStorage.setItem(`printer_${selectedUnit.unitIds}`, JSON.stringify(printerData));
      setSavedPrinter(printerData);
      setIsEditing(false);
    }
  };

  const handleEditPrinter = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (savedPrinter) {
      setPrinterForm({ printerIp: savedPrinter.printerIp });
    }
    setIsEditing(false);
  };

  const handleDeletePrinter = () => {
    if (confirm('Are you sure you want to delete this printer configuration?')) {
      localStorage.removeItem(`printer_${selectedUnit.unitIds}`);
      setSavedPrinter(null);
      setPrinterForm({ printerIp: '' });
      setIsEditing(false);
    }
  };

  const handleTestPrint = (printerId) => {
    const testCommand = 'Test print from IoT Controller';
    socketConnectionManager.sendPrintCommand(printerId, testCommand);
  };

  const handlePrinterFormChange = (value) => {
    setPrinterForm({ printerIp: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Printer Management</h3>
        <p className="text-blue-700 text-sm">
          Configure printer for unit: <span className="font-medium">{selectedUnit?.unitName || 'No unit selected'}</span>
        </p>
      </div>

      {!selectedUnit?.unitIds ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-700">Please select a unit to configure printer settings.</p>
        </div>
      ) : (
        <>
          {/* Saved Printer Display */}
          {savedPrinter && !isEditing ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-green-900 mb-2">Configured Printer</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><span className="font-medium">Unit ID:</span> {selectedUnit.unitIds}</p>
                    <p><span className="font-medium">Printer IP:</span> {savedPrinter.printerIp}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleEditPrinter}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleDeletePrinter}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Printer Configuration Form */
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-4">
                {savedPrinter ? 'Edit Printer Configuration' : 'Configure Printer'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit ID (Printer ID):
                  </label>
                  <input
                    type="text"
                    value={selectedUnit.unitIds}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Printer IP: *
                  </label>
                  <input
                    type="text"
                    value={printerForm.printerIp}
                    onChange={(e) => handlePrinterFormChange(e.target.value)}
                    placeholder="Enter printer IP address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleAddPrinter}
                  disabled={!isConnected || !printerForm.printerIp.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 font-medium"
                >
                  {savedPrinter ? 'Update Printer' : 'Register Printer'}
                </button>
                {savedPrinter && isEditing && (
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                )}
                {!isConnected && (
                  <span className="text-sm text-red-600 self-center">
                    Connect to server first to register printer
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Registered Printers List */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h4 className="font-medium text-gray-900 mb-4">Registered Printers</h4>
        
        {registeredPrinters.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No printers registered for this unit.
          </p>
        ) : (
          <div className="space-y-3">
            {registeredPrinters.map((printer) => (
              <div key={printer.printerId} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-gray-900">{printer.printerName}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        printer.status === 'online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {printer.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">ID:</span> {printer.printerId}</p>
                      <p><span className="font-medium">IP:</span> {printer.printerIp || 'Unknown'}</p>
                      {printer.connectedAt && (
                        <p><span className="font-medium">Connected:</span> {new Date(printer.connectedAt).toLocaleString()}</p>
                      )}
                      {printer.message && (
                        <p><span className="font-medium">Status:</span> {printer.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTestPrint(printer.printerId)}
                      disabled={!isConnected || printer.status !== 'online'}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Test Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrinterSettings;