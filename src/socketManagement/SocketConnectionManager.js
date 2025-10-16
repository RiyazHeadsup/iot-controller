import { io } from 'socket.io-client';
import { getAcessToken, getSelectedUnit } from '../../storage/Storage';

class SocketConnectionManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.serverUrl = 'ws://localhost:9000';
    this.eventListeners = new Map();
    this.logs = [];
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.isManualConnectionRequired = false;
    this.isManuallyDisconnected = false;
  }

  // Initialize socket connection
  connect(serverUrl = this.serverUrl) {
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

      // Reset manual connection flags when user manually tries to connect
      if (this.isManualConnectionRequired) {
        this.isManualConnectionRequired = false;
        this.connectionAttempts = 0;
      }
      this.isManuallyDisconnected = false;

      this.connectionStatus = 'connecting';
      this.serverUrl = serverUrl;

      this.socket = io(serverUrl, {
        auth: {
          token: token,
          unitId: selectedUnit.unitIds
        },
        transports: ['websocket'],
        upgrade: false,
        timeout: 5000,
        reconnection: false // We handle reconnection manually
      });

      this.setupEventHandlers();
      this.addLog('info', `Attempting to connect to ${serverUrl} (Attempt ${this.connectionAttempts + 1}/${this.maxConnectionAttempts})`);
      this.emit('connection_status', { status: 'connecting', attempts: this.connectionAttempts + 1 });
      
      return true;
    } catch (error) {
      this.addLog('error', `Connection failed: ${error.message}`);
      this.connectionStatus = 'failed';
      this.emit('connection_status', { status: 'failed' });
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
      this.isManuallyDisconnected = false;
      this.addLog('success', `Connected to socket server (ID: ${this.socket.id})`);
      this.emit('connection_status', { status: 'connected', socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.addLog('warning', `Disconnected from server: ${reason}`);
      this.emit('connection_status', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      this.connectionAttempts++;
      this.addLog('error', `Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts} failed: ${error.message}`);
      
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        this.connectionStatus = 'failed';
        this.isManualConnectionRequired = true;
        this.addLog('error', 'Maximum connection attempts reached. Manual connection required.');
        this.emit('connection_status', { 
          status: 'failed', 
          requiresManualConnection: true,
          attempts: this.connectionAttempts
        });
        if (this.socket) {
          this.socket.disconnect();
        }
      } else {
        // Auto-retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts - 1), 5000);
        this.addLog('info', `Retrying connection in ${delay/1000} seconds...`);
        
        setTimeout(() => {
          if (!this.isConnected && this.connectionAttempts < this.maxConnectionAttempts) {
            this.connect(this.serverUrl);
          }
        }, delay);
      }
    });

    // Socket.io specific events for your backend
    this.socket.on('printer_registered', (data) => {
      this.addLog('success', `Printer registered: ${data.printerId} - ${data.message}`);
      this.emit('printer_registered', data);
    });

    this.socket.on('printer_disconnected', (data) => {
      this.addLog('info', `Printer disconnected: ${data.printerId}`);
      this.emit('printer_disconnected', data);
    });

    this.socket.on('print_command', (data) => {
      this.addLog('info', `Print command received: ${data.command}`);
      this.emit('print_command', data);
    });
  }

  // Auto-connect when unit is selected
  autoConnect() {
    const selectedUnit = getSelectedUnit();
    if (selectedUnit?.unitIds && !this.isConnected && this.connectionStatus !== 'connecting') {
      this.addLog('info', 'Auto-connecting to socket server...');
      this.connect();
    }
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.addLog('info', 'Disconnecting from socket server...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.connectionAttempts = 0;
      this.isManualConnectionRequired = false;
      this.isManuallyDisconnected = true; // Mark as manually disconnected
      this.addLog('success', 'Successfully disconnected from server');
      this.emit('connection_status', { status: 'disconnected' });
    }
  }

  // Manual retry connection
  retryConnection(newUrl = null) {
    if (newUrl && newUrl !== this.serverUrl) {
      this.serverUrl = newUrl;
      this.addLog('info', `Updated server URL to: ${newUrl}`);
    }
    
    this.connectionAttempts = 0;
    this.isManualConnectionRequired = false;
    this.isManuallyDisconnected = false; // Reset manual disconnect flag
    this.addLog('info', 'Manual retry initiated...');
    this.connect(this.serverUrl);
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
      id: Date.now() + Math.random().toString(36).substring(2, 9),
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
      maxAttempts: this.maxConnectionAttempts,
      isManualConnectionRequired: this.isManualConnectionRequired,
      isManuallyDisconnected: this.isManuallyDisconnected,
      serverUrl: this.serverUrl,
      unit: getSelectedUnit()?.unitIds || null
    };
  }

  // Get logs
  getLogs() {
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.addLog('info', 'Logs cleared');
  }

  // Update server URL
  updateServerUrl(url) {
    this.serverUrl = url;
    this.addLog('info', `Server URL updated to: ${url}`);
  }

  // Register printer with backend
  registerPrinter(printerData) {
    if (!this.socket || !this.isConnected) {
      this.addLog('error', 'Cannot register printer: Not connected to server');
      return false;
    }

    const { printerId, printerIp } = printerData;
    
    if (!printerId || !printerIp) {
      this.addLog('error', 'Cannot register printer: Missing required fields (printerId, printerIp)');
      return false;
    }

    this.socket.emit('printer_register', {
      printerId,
      printerIp
    });

    this.addLog('info', `Registering printer: ${printerId} (${printerIp})`);
    return true;
  }

  // Send print command
  sendPrintCommand(printerId, command) {
    if (!this.socket || !this.isConnected) {
      this.addLog('error', 'Cannot send print command: Not connected to server');
      return false;
    }

    this.socket.emit('print_command', {
      printerId,
      command
    });

    this.addLog('info', `Print command sent to ${printerId}: ${command}`);
    return true;
  }
}

// Create singleton instance
const socketConnectionManager = new SocketConnectionManager();

export default socketConnectionManager;