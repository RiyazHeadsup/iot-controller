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
      
      this.addLog('info', `Starting connection process...`);
      
      if (!token) {
        this.addLog('error', 'No authentication token found. Please login first.');
        return false;
      }

      if (!selectedUnit?.unitIds) {
        this.addLog('error', 'No unit selected. Please select a unit first.');
        return false;
      }

      this.addLog('info', `Token found: ${token.substring(0, 10)}...`);
      this.addLog('info', `Selected unit: ${selectedUnit.unitName} (${selectedUnit.unitIds})`);

      // Reset manual connection flags when user manually tries to connect
      if (this.isManualConnectionRequired) {
        this.isManualConnectionRequired = false;
        this.connectionAttempts = 0;
        this.addLog('info', 'Manual connection required flag reset');
      }
      this.isManuallyDisconnected = false;

      this.connectionStatus = 'connecting';
      this.serverUrl = serverUrl;

      this.addLog('info', `Creating socket connection with auth data...`);
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
      this.addLog('info', `Socket created, setting up event handlers...`);
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
    if (!this.socket) {
      this.addLog('error', 'Cannot setup event handlers: socket is null');
      return;
    }

    this.addLog('info', 'Setting up socket event handlers...');

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.connectionStatus = 'connected';
      this.connectionAttempts = 0;
      this.isManualConnectionRequired = false;
      this.isManuallyDisconnected = false;
      this.addLog('success', `✅ Connected to socket server (ID: ${this.socket.id})`);
      this.addLog('info', `Connection established on attempt ${this.connectionAttempts + 1}`);
      this.emit('connection_status', { status: 'connected', socketId: this.socket.id });
      
      // Auto-register printer if data exists in localStorage
      this.autoRegisterPrinter();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.addLog('warning', `🔌 Disconnected from server: ${reason}`);
      this.addLog('info', `Socket ID was: ${this.socket?.id || 'unknown'}`);
      this.emit('connection_status', { status: 'disconnected', reason });
    });

    this.socket.on('connect_error', (error) => {
      this.connectionAttempts++;
      this.addLog('error', `❌ Connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts} failed: ${error.message}`);
      this.addLog('info', `Error type: ${error.type || 'unknown'}`);
      
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        this.connectionStatus = 'failed';
        this.isManualConnectionRequired = true;
        this.addLog('error', '🚫 Maximum connection attempts reached. Manual connection required.');
        this.emit('connection_status', { 
          status: 'failed', 
          requiresManualConnection: true,
          attempts: this.connectionAttempts
        });
        if (this.socket) {
          this.addLog('info', 'Forcing socket disconnection after max attempts');
          this.socket.disconnect();
        }
      } else {
        // Auto-retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts - 1), 5000);
        this.addLog('info', `⏱️ Retrying connection in ${delay/1000} seconds...`);
        this.addLog('info', `Next attempt will be ${this.connectionAttempts + 1}/${this.maxConnectionAttempts}`);
        
        setTimeout(() => {
          if (!this.isConnected && this.connectionAttempts < this.maxConnectionAttempts) {
            this.addLog('info', '🔄 Auto-retry initiated');
            this.connect(this.serverUrl);
          }
        }, delay);
      }
    });

    // Socket.io specific events for your backend
    this.addLog('info', 'Registering printer-specific event handlers...');
    
    this.socket.on('printer_registered', (data) => {
      this.addLog('success', `🖨️ Printer registered: ${data.printerId} - ${data.message}`);
      this.addLog('info', `Registration status: ${data.status || 'unknown'}`);
      this.emit('printer_registered', data);
    });

    this.socket.on('printer_disconnected', (data) => {
      this.addLog('warning', `🖨️ Printer disconnected: ${data.printerId}`);
      this.addLog('info', `Disconnection reason: ${data.reason || 'unknown'}`);
      this.emit('printer_disconnected', data);
    });

    this.socket.on('print_command', (data) => {
      this.addLog('info', `📄 Print command received: ${data.command}`);
      this.addLog('info', `Target printer: ${data.printerId || 'unknown'}`);
      this.emit('print_command', data);
    });

    this.socket.on('execute_print', (data) => {
      this.addLog('info', `🖨️ Execute print command received: ${data.command}`);
      this.addLog('info', `Command ID: ${data.commandId}`);
      this.addLog('info', `Timestamp: ${data.timestamp}`);
      if (data.printData) {
        this.addLog('info', `Print data provided: ${typeof data.printData}`);
      }
      this.emit('execute_print', data);
    });

    this.socket.on('execute_drawer', (data) => {
      this.addLog('info', `💰 Execute drawer command received: ${data.command}`);
      this.addLog('info', `Command ID: ${data.commandId}`);
      this.addLog('info', `Timestamp: ${data.timestamp}`);
      this.emit('execute_drawer', data);
    });

    this.socket.on('print_result', (data) => {
      this.addLog(data.success ? 'success' : 'error', `📋 Print result: ${data.success ? 'Success' : 'Failed'}`);
      this.addLog('info', `Printer: ${data.printerId}, Command: ${data.commandId}`);
      if (data.errorMessage) {
        this.addLog('error', `Error: ${data.errorMessage}`);
      }
      this.emit('print_result', data);
    });

    // Generic event listener for debugging
    this.socket.onAny((eventName, ...args) => {
      if (!['connect', 'disconnect', 'connect_error', 'printer_registered', 'printer_disconnected', 'print_command', 'execute_print', 'execute_drawer', 'print_result'].includes(eventName)) {
        this.addLog('info', `🔔 Received event: ${eventName}`);
        if (args.length > 0) {
          this.addLog('info', `Event data: ${JSON.stringify(args[0]).substring(0, 100)}...`);
        }
      }
    });

    this.addLog('success', 'All event handlers registered successfully');
  }

  // Auto-connect when unit is selected
  autoConnect() {
    const selectedUnit = getSelectedUnit();
    this.addLog('info', '🔄 Auto-connect triggered');
    this.addLog('info', `Selected unit: ${selectedUnit?.unitName || 'none'} (${selectedUnit?.unitIds || 'none'})`);
    this.addLog('info', `Current connection status: ${this.connectionStatus}`);
    this.addLog('info', `Is connected: ${this.isConnected}`);
    
    if (selectedUnit?.unitIds && !this.isConnected && this.connectionStatus !== 'connecting') {
      this.addLog('info', '✅ Auto-connect conditions met, initiating connection...');
      this.connect();
    } else {
      this.addLog('info', '❌ Auto-connect conditions not met');
      if (!selectedUnit?.unitIds) this.addLog('info', 'Reason: No unit selected');
      if (this.isConnected) this.addLog('info', 'Reason: Already connected');
      if (this.connectionStatus === 'connecting') this.addLog('info', 'Reason: Connection in progress');
    }
  }

  // Disconnect from socket server
  disconnect() {
    this.addLog('info', '🔌 Manual disconnect initiated');
    if (this.socket) {
      this.addLog('info', `Disconnecting socket ID: ${this.socket.id || 'unknown'}`);
      this.addLog('info', 'Sending disconnect signal to server...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionStatus = 'disconnected';
      this.connectionAttempts = 0;
      this.isManualConnectionRequired = false;
      this.isManuallyDisconnected = true; // Mark as manually disconnected
      this.addLog('success', '✅ Successfully disconnected from server');
      this.addLog('info', 'Socket cleanup completed');
      this.emit('connection_status', { status: 'disconnected' });
    } else {
      this.addLog('info', 'No active socket to disconnect');
    }
  }

  // Manual retry connection
  retryConnection(newUrl = null) {
    this.addLog('info', '🔄 Manual retry connection initiated');
    if (newUrl && newUrl !== this.serverUrl) {
      this.addLog('info', `Server URL changed from ${this.serverUrl} to ${newUrl}`);
      this.serverUrl = newUrl;
      this.addLog('info', `Updated server URL to: ${newUrl}`);
    } else {
      this.addLog('info', `Using existing server URL: ${this.serverUrl}`);
    }
    
    this.connectionAttempts = 0;
    this.isManualConnectionRequired = false;
    this.isManuallyDisconnected = false; // Reset manual disconnect flag
    this.addLog('info', 'Connection flags reset');
    this.addLog('info', '🚀 Starting manual retry...');
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
    this.addLog('info', '🖨️ Printer registration request initiated');
    
    if (!this.socket || !this.isConnected) {
      this.addLog('error', 'Cannot register printer: Not connected to server');
      this.addLog('info', `Socket exists: ${!!this.socket}, Is connected: ${this.isConnected}`);
      return false;
    }

    const { printerId, printerIp } = printerData;
    
    this.addLog('info', `Validating printer data...`);
    this.addLog('info', `Printer ID: ${printerId || 'missing'}`);
    this.addLog('info', `Printer IP: ${printerIp || 'missing'}`);
    
    if (!printerId || !printerIp) {
      this.addLog('error', 'Cannot register printer: Missing required fields (printerId, printerIp)');
      return false;
    }

    this.addLog('info', 'Sending printer_register event to server...');
    this.socket.emit('printer_register', {
      printerId,
      printerIp
    });

    this.addLog('success', `📤 Printer registration sent: ${printerId} (${printerIp})`);
    this.addLog('info', 'Waiting for server response...');
    return true;
  }

  // Send print command
  sendPrintCommand(printerId, command, printData = null) {
    this.addLog('info', '📄 Print command request initiated');
    this.addLog('info', `Target printer: ${printerId}`);
    this.addLog('info', `Command: ${command}`);
    if (printData) {
      this.addLog('info', `Print data included: ${typeof printData}`);
    }
    
    if (!this.socket || !this.isConnected) {
      this.addLog('error', 'Cannot send print command: Not connected to server');
      this.addLog('info', `Socket exists: ${!!this.socket}, Is connected: ${this.isConnected}`);
      return false;
    }

    this.addLog('info', 'Sending print_command event to server...');
    this.socket.emit('print_command', {
      printerId,
      command,
      printData
    });

    this.addLog('success', `📤 Print command sent to ${printerId}: ${command}`);
    return true;
  }

  // Send drawer open command
  sendDrawerCommand(printerId) {
    this.addLog('info', '💰 Drawer open command request initiated');
    this.addLog('info', `Target printer: ${printerId}`);
    
    if (!this.socket || !this.isConnected) {
      this.addLog('error', 'Cannot send drawer command: Not connected to server');
      this.addLog('info', `Socket exists: ${!!this.socket}, Is connected: ${this.isConnected}`);
      return false;
    }

    this.addLog('info', 'Sending open_drawer event to server...');
    this.socket.emit('open_drawer', {
      printerId
    });

    this.addLog('success', `📤 Drawer open command sent to printer ${printerId}`);
    return true;
  }

  // Send printer status update
  sendPrinterStatus(printerId, status, errorMessage = null) {
    this.addLog('info', '📊 Printer status update initiated');
    this.addLog('info', `Printer: ${printerId}, Status: ${status}`);
    if (errorMessage) {
      this.addLog('info', `Error message: ${errorMessage}`);
    }
    
    if (!this.socket || !this.isConnected) {
      this.addLog('error', 'Cannot send status update: Not connected to server');
      this.addLog('info', `Socket exists: ${!!this.socket}, Is connected: ${this.isConnected}`);
      return false;
    }

    this.addLog('info', 'Sending printer_status event to server...');
    const statusData = { printerId, status };
    if (errorMessage) {
      statusData.errorMessage = errorMessage;
    }

    this.socket.emit('printer_status', statusData);

    this.addLog('success', `📤 Status update sent for printer ${printerId}: ${status}`);
    return true;
  }

  // Send command response
  sendCommandResponse(commandId, printerId, success, errorMessage = null) {
    this.addLog('info', '📋 Command response initiated');
    this.addLog('info', `Command ID: ${commandId}, Printer: ${printerId}`);
    this.addLog('info', `Success: ${success}`);
    if (errorMessage) {
      this.addLog('info', `Error message: ${errorMessage}`);
    }
    
    if (!this.socket || !this.isConnected) {
      this.addLog('error', 'Cannot send command response: Not connected to server');
      this.addLog('info', `Socket exists: ${!!this.socket}, Is connected: ${this.isConnected}`);
      return false;
    }

    this.addLog('info', 'Sending command_response event to server...');
    const responseData = { commandId, printerId, success };
    if (errorMessage) {
      responseData.errorMessage = errorMessage;
    }

    this.socket.emit('command_response', responseData);

    this.addLog('success', `📤 Command response sent for ${commandId}: ${success ? 'Success' : 'Failed'}`);
    return true;
  }

  // Auto-register printer from localStorage when connected
  autoRegisterPrinter() {
    this.addLog('info', '🔍 Checking for saved printer configuration...');
    const selectedUnit = getSelectedUnit();
    
    if (!selectedUnit?.unitIds) {
      this.addLog('info', 'No unit selected, skipping auto-registration');
      return;
    }

    this.addLog('info', `Looking for saved printer for unit: ${selectedUnit.unitIds}`);
    const saved = localStorage.getItem(`printer_${selectedUnit.unitIds}`);
    
    if (saved) {
      this.addLog('info', 'Found saved printer configuration');
      try {
        const printerData = JSON.parse(saved);
        this.addLog('info', `Parsed data: ID=${printerData.printerId}, IP=${printerData.printerIp}`);
        
        if (printerData.printerId && printerData.printerIp) {
          this.addLog('info', '✅ Valid printer data found, scheduling auto-registration...');
          setTimeout(() => {
            this.addLog('info', '🚀 Auto-registration timer triggered');
            this.registerPrinter(printerData);
          }, 1000); // Small delay to ensure connection is fully established
        } else {
          this.addLog('warning', 'Saved printer data is incomplete');
        }
      } catch (error) {
        this.addLog('error', `Failed to parse saved printer data: ${error.message}`);
        this.addLog('info', 'Consider clearing corrupted localStorage data');
      }
    } else {
      this.addLog('info', 'No saved printer configuration found');
    }
  }
}

// Create singleton instance
const socketConnectionManager = new SocketConnectionManager();

export default socketConnectionManager;