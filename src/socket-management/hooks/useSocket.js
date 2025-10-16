import { useState, useEffect, useCallback } from 'react';
import socketController from '../services/SocketController';

export const useSocket = () => {
  const [status, setStatus] = useState(socketController.getStatus());
  const [logs, setLogs] = useState(socketController.getLogs());
  const [connectedPrinters, setConnectedPrinters] = useState(socketController.getConnectedPrinters());

  // Update status
  const updateStatus = useCallback(() => {
    setStatus(socketController.getStatus());
  }, []);

  // Update logs
  const updateLogs = useCallback(() => {
    setLogs(socketController.getLogs());
  }, []);

  // Update printers
  const updatePrinters = useCallback(() => {
    setConnectedPrinters(socketController.getConnectedPrinters());
  }, []);

  useEffect(() => {
    // Set up event listeners
    const handleConnectionStatus = () => {
      updateStatus();
    };

    const handleLogAdded = () => {
      updateLogs();
    };

    const handlePrintersUpdated = (printers) => {
      setConnectedPrinters(printers);
    };

    // Register event listeners
    socketController.on('connection_status', handleConnectionStatus);
    socketController.on('log_added', handleLogAdded);
    socketController.on('printers_updated', handlePrintersUpdated);

    // Cleanup on unmount
    return () => {
      socketController.off('connection_status', handleConnectionStatus);
      socketController.off('log_added', handleLogAdded);
      socketController.off('printers_updated', handlePrintersUpdated);
    };
  }, [updateStatus, updateLogs]);

  // Connection methods
  const connect = useCallback((serverUrl) => {
    return socketController.connect(serverUrl);
  }, []);

  const disconnect = useCallback(() => {
    socketController.disconnect();
  }, []);

  // Printer methods
  const registerPrinter = useCallback((printerData) => {
    return socketController.registerPrinter(printerData);
  }, []);

  const sendPrintCommand = useCallback((printerId, command, printData) => {
    return socketController.sendPrintCommand(printerId, command, printData);
  }, []);

  const openDrawer = useCallback((printerId) => {
    return socketController.openDrawer(printerId);
  }, []);

  const updatePrinterStatus = useCallback((printerId, status, errorMessage) => {
    return socketController.updatePrinterStatus(printerId, status, errorMessage);
  }, []);

  const requestPrintersList = useCallback(() => {
    return socketController.requestPrintersList();
  }, []);

  // Log methods
  const clearLogs = useCallback(() => {
    socketController.clearLogs();
    updateLogs();
  }, [updateLogs]);

  const getFilteredLogs = useCallback((level, limit) => {
    return socketController.getLogs(level, limit);
  }, []);


  return {
    // Status
    status,
    logs,
    connectedPrinters,
    
    // Connection methods
    connect,
    disconnect,
    
    // Printer methods
    registerPrinter,
    sendPrintCommand,
    openDrawer,
    updatePrinterStatus,
    requestPrintersList,
    
    // Log methods
    clearLogs,
    getFilteredLogs,
    
    // Utility methods
    updateStatus,
    updateLogs,
    updatePrinters
  };
};