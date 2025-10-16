import { io } from 'socket.io-client';
import { getAcessToken, getSelectedUnit } from '../../../storage/Storage';

class SocketController {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.isManualConnectionRequired = false;
    this.eventListeners = new Map();
    this.logs = [];
    this.connectedPrinters = [];
  }

  // Initialize socket connection with authentication
  connect(serverUrl = 'ws://localhost:9000') {
    try {
      const token = getAcessToken();
      const selectedUnit = getSelectedUnit();
      
      if (!token) {
        this.addLog('error', 'No authentication token found. Please login first.');
        return false;
      }

      if (!selectedUnit?.unitIds) {
        this.addLog('error', 'No unit selected. Please select a unit first.');
        return false;
      }

      // Reset manual connection flag when user manually tries to connect
      this.isManualConnectionRequired = false;
      this.connectionAttempts = 0;
      this.connectionStatus = 'connecting';

      this.socket = io(serverUrl, {
        auth: {
          token: token,
          unitId: selectedUnit.unitIds
        },
        transports: ['websocket'],
        upgrade: false
      });

      this.setupEventHandlers();
      this.addLog('info', `Attempting to connect to ${serverUrl} (Attempt 1/${this.maxConnectionAttempts})`);
      
      return true;
    } catch (error) {
      this.addLog('error', `Connection failed: ${error.message}`);
      return false;
    }
  }

  // Setup socket event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.connectionStatus = 'connected';
      this.connectionAttempts = 0;
      this.isManualConnectionRequired = false;
      this.addLog('success', `Connected to socket server (ID: ${this.socket.id})`);
      this.emit('connection_status', { status: 'connected', socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.connectedPrinters = [];
      this.addLog('warning', `Disconnected from server: ${reason}`);
      this.emit('connection_status', { status: 'disconnected', reason });
      this.emit('printers_updated', []);
    });

    this.socket.on('connect_error', (error) => {
      this.connectionAttempts++;
      this.addLog('error', `Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts} failed: ${error.message}`);
      
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        this.connectionStatus = 'failed';
        this.isManualConnectionRequired = true;
        this.addLog('error', 'Maximum connection attempts reached. Manual connection required.');
        this.emit('connection_status', { status: 'failed', requiresManualConnection: true });
        this.socket.disconnect();
      } else {
        this.connectionStatus = 'connecting';
        this.emit('connection_status', { status: 'connecting', attempts: this.connectionAttempts });
      }
    });

    this.socket.on('printer_registered', (data) => {
      this.addLog('success', `Printer registered: ${data.printerId}`);
      this.emit('printer_registered', data);
    });

    this.socket.on('printer_disconnected', (data) => {
      this.addLog('info', `Printer disconnected: ${data.printerId} (${data.printerName})`);
      this.updateConnectedPrinters();
      this.emit('printer_disconnected', data);
    });

    this.socket.on('execute_print', (data) => {
      this.addLog('info', `Print command received: ${data.command} (ID: ${data.commandId})`);
      this.emit('execute_print', data);
    });

    this.socket.on('execute_drawer', (data) => {
      this.addLog('info', `Drawer command received: ${data.command} (ID: ${data.commandId})`);
      this.emit('execute_drawer', data);
    });

    this.socket.on('print_result', (data) => {
      const status = data.success ? 'success' : 'error';
      this.addLog(status, `Print result: ${data.success ? 'Success' : 'Failed'} - Command: ${data.commandId}`);
      this.emit('print_result', data);
    });

    this.socket.on('printers_list', (data) => {
      this.connectedPrinters = data.printers || [];
      this.addLog('info', `Received printers list: ${this.connectedPrinters.length} printers`);
      this.emit('printers_updated', this.connectedPrinters);
    });
  }


  // Register a printer with unit authentication
  registerPrinter(printerData) {
    const selectedUnit = getSelectedUnit();
    
    if (!this.isConnected) {
      this.addLog('error', 'Cannot register printer: Not connected to server');
      return false;
    }

    if (!selectedUnit?.unitIds) {
      this.addLog('error', 'Cannot register printer: No unit selected');
      return false;
    }

    const registrationData = {
      ...printerData,
      unitId: selectedUnit.unitIds,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('printer_register', registrationData);
    this.addLog('info', `Registering printer: ${printerData.printerId} for unit: ${selectedUnit.unitIds}`);
    
    return true;
  }

  // Send print command to specific printer
  sendPrintCommand(printerId, command, printData = null) {
    if (!this.isConnected) {
      this.addLog('error', 'Cannot send print command: Not connected to server');
      return false;
    }

    const commandData = {
      printerId,
      command,
      printData,
      unitId: getSelectedUnit()?.unitIds,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('print_command', commandData);
    this.addLog('info', `Sending print command to printer: ${printerId}`);
    
    return true;
  }

  // Open cash drawer
  openDrawer(printerId) {
    if (!this.isConnected) {
      this.addLog('error', 'Cannot open drawer: Not connected to server');
      return false;
    }

    const commandData = {
      printerId,
      unitId: getSelectedUnit()?.unitIds,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('open_drawer', commandData);
    this.addLog('info', `Opening drawer for printer: ${printerId}`);
    
    return true;
  }

  // Update printer status
  updatePrinterStatus(printerId, status, errorMessage = null) {
    if (!this.isConnected) return false;

    const statusData = {
      printerId,
      status,
      errorMessage,
      unitId: getSelectedUnit()?.unitIds,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('printer_status', statusData);
    this.addLog('info', `Updated printer status: ${printerId} - ${status}`);
    
    return true;
  }

  // Send command response
  sendCommandResponse(commandId, printerId, success, errorMessage = null) {
    if (!this.isConnected) return false;

    const responseData = {
      commandId,
      printerId,
      success,
      errorMessage,
      unitId: getSelectedUnit()?.unitIds,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('command_response', responseData);
    this.addLog('info', `Sent command response: ${commandId} - ${success ? 'Success' : 'Failed'}`);
    
    return true;
  }

  // Request list of connected printers
  requestPrintersList() {
    if (!this.isConnected) {
      this.addLog('error', 'Cannot request printers list: Not connected to server');
      return false;
    }

    this.socket.emit('get_printers_list', {
      unitId: getSelectedUnit()?.unitIds,
      timestamp: new Date().toISOString()
    });

    this.addLog('info', 'Requesting connected printers list');
    return true;
  }

  // Update connected printers list
  updateConnectedPrinters() {
    this.requestPrintersList();
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.addLog('info', 'Disconnecting from socket server...');
      this.connectedPrinters = [];
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.connectionAttempts = 0;
      this.isManualConnectionRequired = false;
      this.addLog('success', 'Successfully disconnected from server');
      this.emit('connection_status', { status: 'disconnected' });
      this.emit('printers_updated', []);
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Logging functionality
  addLog(level, message) {
    const logEntry = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      level,
      message,
      timestamp: new Date().toISOString(),
      unit: getSelectedUnit()?.unitIds || 'unknown'
    };

    this.logs.unshift(logEntry);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    // Also log to console with appropriate level
    switch (level) {
      case 'error':
        console.error(`[Socket] ${message}`);
        break;
      case 'warning':
        console.warn(`[Socket] ${message}`);
        break;
      case 'success':
        console.log(`[Socket] ✅ ${message}`);
        break;
      default:
        console.log(`[Socket] ${message}`);
    }

    // Emit log event for UI updates
    this.emit('log_added', logEntry);
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      connectionStatus: this.connectionStatus,
      socketId: this.socket?.id || null,
      connectionAttempts: this.connectionAttempts,
      isManualConnectionRequired: this.isManualConnectionRequired,
      connectedPrinters: this.connectedPrinters.length,
      unit: getSelectedUnit()?.unitIds || null
    };
  }

  // Get logs
  getLogs(level = null, limit = 50) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(0, limit);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.addLog('info', 'Logs cleared');
  }

  // Get connected printers
  getConnectedPrinters() {
    return this.connectedPrinters;
  }

}

// Create singleton instance
const socketController = new SocketController();

export default socketController;