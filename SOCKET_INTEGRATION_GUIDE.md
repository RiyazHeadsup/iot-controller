# Socket.IO Management Integration Guide

## 🎉 Successfully Integrated!

The SocketManager component has been successfully integrated into your IoT Controller application and will now appear after login.

## 📋 What's Been Added

### 1. **Main Integration**
- `SocketManager` component integrated into `App.jsx`
- Shows automatically after user login
- Requires unit selection before becoming active

### 2. **Unit Management**
- Auto-selects first unit if user has only one unit
- Dropdown selector in header for multiple units
- Unit selection is required for Socket functionality

### 3. **Header Enhancements**
- Unit selector dropdown (when multiple units available)
- Current active unit display with unit name and ID
- Visual indicators for selected unit

## 🚀 How to Use

### **Step 1: Login**
- Login with your credentials as usual
- You'll see the main dashboard

### **Step 2: Unit Selection**
- If you have multiple units, select one from the dropdown in the header
- If you have only one unit, it will be auto-selected
- The selected unit will be highlighted in blue

### **Step 3: Access Socket Management**
- Once a unit is selected, the Socket.IO Management panel will appear
- The panel has three tabs:
  - **Connection**: Connect to socket server
  - **Printers**: Manage and control printers
  - **Logs**: View real-time logs

### **Step 4: Connect to Socket Server**
1. Go to the **Connection** tab
2. Enter your socket server URL (default: ws://localhost:3001)
3. Click **Connect**
4. Monitor connection status in real-time

### **Step 5: Register Printers**
1. Go to the **Printers** tab
2. Click **+ Register Printer**
3. Fill in printer details:
   - Printer ID (required)
   - Printer Name
   - Printer Type
   - Location
4. Click **Register Printer**

### **Step 6: Use Printer Functions**
- **Test Print**: Send a test print command
- **Open Drawer**: Open the cash drawer
- **View Status**: Monitor printer connection status

### **Step 7: Monitor Activity**
- Go to the **Logs** tab to see all socket activities
- Filter logs by level (Error, Warning, Success, Info)
- Search through log messages
- Export logs for debugging

## 🔧 Technical Features

### **Authentication & Security**
- ✅ Uses existing authentication tokens
- ✅ Unit-based access control
- ✅ Automatic token refresh handling

### **Real-time Features**
- ✅ Live connection status indicators
- ✅ Real-time printer status updates
- ✅ Instant log updates
- ✅ Auto-reconnection with exponential backoff

### **Printer Management**
- ✅ Register/unregister printers
- ✅ Send print commands with custom data
- ✅ Open cash drawers
- ✅ Monitor printer health
- ✅ Unit-scoped printer isolation

### **Logging & Debugging**
- ✅ Comprehensive event logging
- ✅ Filterable and searchable logs
- ✅ Export logs to file
- ✅ Real-time log streaming

## 🌐 Socket Server Setup

Your backend should use the provided `SocketController` from:
```
src/socket-management/backend/SocketController.js
```

### **Quick Backend Setup:**
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const SocketController = require('./src/socket-management/backend/SocketController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
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

server.listen(3001, () => {
  console.log('Socket server running on port 3001');
});
```

## 🎯 Status Indicators

### **Connection Status**
- 🟢 **Connected**: Successfully connected to socket server
- 🔴 **Disconnected**: Not connected to socket server
- 🟡 **Connecting**: Attempting to connect
- 🟡 **Reconnecting**: Attempting to reconnect after disconnection
- 🔴 **Error**: Connection failed with error
- 🔴 **Failed**: Max reconnection attempts reached

### **Printer Status**
- 🟢 **Online**: Printer is connected and ready
- 🔴 **Offline**: Printer is disconnected
- 🟡 **Error**: Printer has an error condition
- 🔵 **Busy**: Printer is processing a command

## 📱 Mobile Responsive

The Socket Management interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔍 Troubleshooting

### **"Unit Selection Required" Message**
- Make sure you've selected a unit from the dropdown
- If you don't see units, contact your administrator

### **Connection Failed**
- Check if the socket server is running
- Verify the server URL is correct
- Check firewall settings
- Ensure you're logged in with valid credentials

### **Printer Not Connecting**
- Verify printer ID is unique
- Check network connectivity
- Ensure printer client is running the socket connection code

### **Logs Not Updating**
- Check browser console for errors
- Refresh the page
- Verify socket connection is active

## 🔧 Advanced Usage

### **Custom Print Commands**
```javascript
// Example: Send custom receipt data
const printData = {
  type: 'receipt',
  content: [
    { type: 'text', value: 'Your Store Name', style: 'bold' },
    { type: 'text', value: '123 Main St' },
    { type: 'text', value: '================' },
    { type: 'text', value: 'Item 1: $10.00' },
    { type: 'text', value: 'Total: $10.00', style: 'bold' }
  ]
};

socketController.sendPrintCommand('PRINTER_001', 'print_receipt', printData);
```

### **Event Listening**
```javascript
// Listen for specific events
socketController.on('print_result', (data) => {
  if (data.success) {
    console.log('Print completed successfully');
  } else {
    console.error('Print failed:', data.errorMessage);
  }
});
```

## 📞 Support

If you encounter any issues:
1. Check the **Logs** tab for error messages
2. Verify your unit selection
3. Ensure socket server is running
4. Check network connectivity

The Socket.IO Management system is now fully integrated and ready to use! 🎉