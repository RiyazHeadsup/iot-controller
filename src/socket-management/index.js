// Socket Management Module
export { default as SocketManager } from './components/SocketManager';
export { default as ConnectionPanel } from './components/ConnectionPanel';
export { default as PrinterManagement } from './components/PrinterManagement';
export { default as SocketLogs } from './components/SocketLogs';

export { useSocket } from './hooks/useSocket';
export { default as socketController } from './services/SocketController';

// Utility functions
export const SocketUtils = {
  // Format timestamp for display
  formatTimestamp: (timestamp) => {
    return new Date(timestamp).toLocaleString();
  },

  // Generate unique printer ID
  generatePrinterId: (prefix = 'PRINTER') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  },

  // Validate printer data
  validatePrinterData: (printerData) => {
    const required = ['printerId'];
    const missing = required.filter(field => !printerData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  },

  // Get status color for UI
  getStatusColor: (status) => {
    const colors = {
      online: '#10b981',
      offline: '#ef4444',
      error: '#f59e0b',
      busy: '#3b82f6',
      connected: '#10b981',
      disconnected: '#ef4444',
      connecting: '#f59e0b',
      reconnecting: '#f59e0b',
      failed: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }
};