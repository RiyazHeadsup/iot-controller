// Backend Socket Controller with Unit ID support
// This is the server-side implementation that should be used in your Node.js backend

class SocketController {
  constructor(io) {
    this.io = io;
    this.connectedPrinters = new Map(); // socketId -> printer data
    this.printersByUnit = new Map(); // unitId -> Set of printer IDs
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Device connected: ${socket.id}`);
      
      // Get unit ID from authentication
      const unitId = socket.handshake.auth?.unitId;
      if (!unitId) {
        console.log(`Connection rejected: No unit ID provided for ${socket.id}`);
        socket.emit('connection_error', { message: 'Unit ID is required' });
        socket.disconnect();
        return;
      }

      socket.unitId = unitId;
      socket.join(`unit_${unitId}`);

      socket.on('printer_register', (data) => {
        const { printerId, printerName, printerType, location } = data;
        
        // Validate unit ID matches
        if (data.unitId && data.unitId !== unitId) {
          socket.emit('registration_error', { 
            message: 'Unit ID mismatch',
            providedUnit: data.unitId,
            authenticatedUnit: unitId
          });
          return;
        }

        const printerData = {
          printerId, 
          printerName: printerName || 'Unknown Printer',
          printerType: printerType || 'thermal',
          location: location || 'Unknown Location',
          status: 'online',
          unitId: unitId,
          socketId: socket.id,
          connectedAt: new Date().toISOString()
        };

        this.connectedPrinters.set(socket.id, printerData);
        
        // Add to unit mapping
        if (!this.printersByUnit.has(unitId)) {
          this.printersByUnit.set(unitId, new Set());
        }
        this.printersByUnit.get(unitId).add(printerId);
        
        // Join printer-specific room
        socket.join(`printer_${printerId}`);
        
        console.log(`Printer registered: ${printerId} (${printerName}) for unit: ${unitId}`);
        
        socket.emit('printer_registered', {
          printerId,
          unitId,
          message: `Printer ${printerId} registered successfully`,
          status: 'success'
        });

        // Notify unit members about new printer
        socket.to(`unit_${unitId}`).emit('printer_connected', {
          printerId,
          printerName,
          printerType,
          location,
          unitId
        });

        // Send updated printers list to unit
        this.sendPrintersListToUnit(unitId);
      });

      socket.on('print_command', (data) => {
        const { printerId, command, printData } = data;
        
        // Validate unit ID
        if (data.unitId && data.unitId !== unitId) {
          socket.emit('command_error', { message: 'Unit ID mismatch' });
          return;
        }
        
        const commandData = {
          command,
          printData,
          unitId,
          timestamp: new Date().toISOString(),
          commandId: this.generateCommandId()
        };

        // Send to specific printer
        this.io.to(`printer_${printerId}`).emit('execute_print', commandData);
        
        console.log(`Print command sent to printer ${printerId} for unit ${unitId}: ${command}`);
        
        // Acknowledge command received
        socket.emit('command_sent', {
          printerId,
          commandId: commandData.commandId,
          message: 'Print command sent successfully'
        });
      });

      socket.on('open_drawer', (data) => {
        const { printerId } = data;
        
        // Validate unit ID
        if (data.unitId && data.unitId !== unitId) {
          socket.emit('command_error', { message: 'Unit ID mismatch' });
          return;
        }
        
        const commandData = {
          command: 'open_drawer',
          unitId,
          timestamp: new Date().toISOString(),
          commandId: this.generateCommandId()
        };

        this.io.to(`printer_${printerId}`).emit('execute_drawer', commandData);
        
        console.log(`Drawer open command sent to printer ${printerId} for unit ${unitId}`);
        
        socket.emit('command_sent', {
          printerId,
          commandId: commandData.commandId,
          message: 'Drawer command sent successfully'
        });
      });

      socket.on('printer_status', (data) => {
        const { printerId, status, errorMessage } = data;
        
        // Validate unit ID
        if (data.unitId && data.unitId !== unitId) {
          return;
        }

        const printerData = this.connectedPrinters.get(socket.id);
        
        if (printerData && printerData.unitId === unitId) {
          printerData.status = status;
          printerData.lastUpdate = new Date().toISOString();
          if (errorMessage) {
            printerData.lastError = errorMessage;
          }

          // Notify unit members about status change
          socket.to(`unit_${unitId}`).emit('printer_status_updated', {
            printerId,
            status,
            errorMessage,
            unitId,
            timestamp: printerData.lastUpdate
          });
        }
        
        console.log(`Printer ${printerId} status updated for unit ${unitId}: ${status}`);
      });

      socket.on('command_response', (data) => {
        const { commandId, success, errorMessage, printerId } = data;
        
        // Validate unit ID
        if (data.unitId && data.unitId !== unitId) {
          return;
        }
        
        // Broadcast result to unit members
        socket.to(`unit_${unitId}`).emit('print_result', {
          printerId,
          commandId,
          success,
          errorMessage,
          unitId,
          timestamp: new Date().toISOString()
        });
        
        console.log(`Command ${commandId} response from printer ${printerId} (unit ${unitId}): ${success ? 'Success' : 'Failed'}`);
      });

      socket.on('get_printers_list', (data) => {
        // Validate unit ID
        if (data.unitId && data.unitId !== unitId) {
          socket.emit('printers_list_error', { message: 'Unit ID mismatch' });
          return;
        }

        this.sendPrintersListToSocket(socket, unitId);
      });

      socket.on('disconnect', () => {
        const printerData = this.connectedPrinters.get(socket.id);
        if (printerData && printerData.unitId === unitId) {
          const { printerId, printerName } = printerData;
          
          // Remove from unit mapping
          if (this.printersByUnit.has(unitId)) {
            this.printersByUnit.get(unitId).delete(printerId);
            if (this.printersByUnit.get(unitId).size === 0) {
              this.printersByUnit.delete(unitId);
            }
          }
          
          // Notify unit members
          socket.to(`unit_${unitId}`).emit('printer_disconnected', {
            printerId,
            printerName,
            unitId,
            message: `Printer ${printerId} (${printerName}) disconnected`
          });
          
          this.connectedPrinters.delete(socket.id);
          console.log(`Printer ${printerId} (${printerName}) disconnected from unit ${unitId}`);

          // Send updated printers list to unit
          this.sendPrintersListToUnit(unitId);
        }
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  generateCommandId() {
    return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get printers for a specific unit
  getConnectedPrintersByUnit(unitId) {
    const unitPrinters = [];
    this.connectedPrinters.forEach((printer) => {
      if (printer.unitId === unitId) {
        unitPrinters.push(printer);
      }
    });
    return unitPrinters;
  }

  // Get all connected printers
  getConnectedPrinters() {
    return Array.from(this.connectedPrinters.values());
  }

  // Send printers list to specific socket
  sendPrintersListToSocket(socket, unitId) {
    const printers = this.getConnectedPrintersByUnit(unitId);
    socket.emit('printers_list', {
      printers,
      unitId,
      totalConnected: printers.length,
      timestamp: new Date().toISOString()
    });
  }

  // Send printers list to all sockets in a unit
  sendPrintersListToUnit(unitId) {
    const printers = this.getConnectedPrintersByUnit(unitId);
    this.io.to(`unit_${unitId}`).emit('printers_list', {
      printers,
      unitId,
      totalConnected: printers.length,
      timestamp: new Date().toISOString()
    });
  }

  // API endpoint handlers
  getHealth(req, res) {
    const totalConnected = this.connectedPrinters.size;
    const unitStats = {};
    
    this.printersByUnit.forEach((printers, unitId) => {
      unitStats[unitId] = printers.size;
    });

    res.json({ 
      status: 'healthy', 
      service: 'socket-service',
      totalConnectedPrinters: totalConnected,
      connectedUnits: this.printersByUnit.size,
      unitStats
    });
  }

  getConnectedPrintersList(req, res) {
    const unitId = req.query.unitId;
    
    if (!unitId) {
      return res.status(400).json({
        statusCode: 400,
        error: 'unitId query parameter is required'
      });
    }

    const printers = this.getConnectedPrintersByUnit(unitId);
    res.json({
      statusCode: 200,
      data: {
        connectedPrinters: printers,
        totalConnected: printers.length,
        unitId
      }
    });
  }

  sendPrintCommand(req, res) {
    const { printerId, command, printData, unitId } = req.body;
    
    if (!printerId || !command || !unitId) {
      return res.status(400).json({
        statusCode: 400,
        error: 'printerId, command, and unitId are required'
      });
    }

    const commandId = this.generateCommandId();
    
    const commandData = {
      command,
      printData,
      unitId,
      timestamp: new Date().toISOString(),
      commandId
    };

    this.io.to(`printer_${printerId}`).emit('execute_print', commandData);

    res.json({
      statusCode: 200,
      data: {
        message: `Print command sent to printer ${printerId}`,
        commandId,
        printerId,
        unitId
      }
    });
  }

  openDrawer(req, res) {
    const { printerId, unitId } = req.body;
    
    if (!printerId || !unitId) {
      return res.status(400).json({
        statusCode: 400,
        error: 'printerId and unitId are required'
      });
    }

    const commandId = this.generateCommandId();
    
    const commandData = {
      command: 'open_drawer',
      unitId,
      timestamp: new Date().toISOString(),
      commandId
    };

    this.io.to(`printer_${printerId}`).emit('execute_drawer', commandData);

    res.json({
      statusCode: 200,
      data: {
        message: `Drawer open command sent to printer ${printerId}`,
        commandId,
        printerId,
        unitId
      }
    });
  }

  // Send command to all printers in a unit
  broadcastToUnit(req, res) {
    const { unitId, command, data } = req.body;
    
    if (!unitId || !command) {
      return res.status(400).json({
        statusCode: 400,
        error: 'unitId and command are required'
      });
    }

    const commandId = this.generateCommandId();
    const commandData = {
      command,
      data,
      unitId,
      timestamp: new Date().toISOString(),
      commandId,
      broadcast: true
    };

    this.io.to(`unit_${unitId}`).emit('unit_broadcast', commandData);

    res.json({
      statusCode: 200,
      data: {
        message: `Command broadcasted to unit ${unitId}`,
        commandId,
        unitId,
        affectedPrinters: this.getConnectedPrintersByUnit(unitId).length
      }
    });
  }
}

module.exports = SocketController;

/* 
Usage Example:

// In your Express.js server
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const SocketController = require('./SocketController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Initialize socket controller
const socketController = new SocketController(io);

// API routes
app.get('/health', (req, res) => socketController.getHealth(req, res));
app.get('/api/printers', (req, res) => socketController.getConnectedPrintersList(req, res));
app.post('/api/print', (req, res) => socketController.sendPrintCommand(req, res));
app.post('/api/drawer', (req, res) => socketController.openDrawer(req, res));
app.post('/api/broadcast', (req, res) => socketController.broadcastToUnit(req, res));

server.listen(3001, () => {
  console.log('Socket server running on port 3001');
});
*/