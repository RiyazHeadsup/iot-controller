import React, { useState, useRef, useEffect } from 'react';

const SocketLogs = ({ logs, onClearLogs }) => {
  const [filterLevel, setFilterLevel] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const logsEndRef = useRef(null);

  const scrollToBottom = () => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs, autoScroll]);

  const getFilteredLogs = () => {
    let filteredLogs = logs;

    // Filter by level
    if (filterLevel !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === filterLevel);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.level.toLowerCase().includes(searchLower)
      );
    }

    return filteredLogs;
  };

  const getLogLevelIcon = (level) => {
    const icons = {
      error: '🔴',
      warning: '🟡',
      success: '🟢',
      info: 'ℹ️'
    };
    return icons[level] || 'ℹ️';
  };

  const getLogLevelClass = (level) => {
    return `log-entry ${level}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const exportLogs = () => {
    const filteredLogs = getFilteredLogs();
    const logText = filteredLogs.map(log => 
      `[${formatTimestamp(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socket-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="socket-logs">
      <div className="logs-header">
        <h3>Socket Logs</h3>
        <div className="logs-stats">
          <span className="stat">Total: {logs.length}</span>
          <span className="stat">Filtered: {filteredLogs.length}</span>
        </div>
      </div>

      <div className="logs-controls">
        <div className="filter-controls">
          <div className="form-group">
            <label htmlFor="levelFilter">Filter by Level:</label>
            <select
              id="levelFilter"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="form-select"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="searchLogs">Search Logs:</label>
            <input
              id="searchLogs"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="form-input"
            />
          </div>
        </div>

        <div className="action-controls">
          <div className="checkbox-group">
            <input
              id="autoScroll"
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            <label htmlFor="autoScroll">Auto-scroll</label>
          </div>

          <button
            onClick={exportLogs}
            className="btn-secondary"
            disabled={filteredLogs.length === 0}
          >
            📄 Export
          </button>

          <button
            onClick={onClearLogs}
            className="btn-danger"
            disabled={logs.length === 0}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">
            <div className="icon">📝</div>
            <p>No logs to display</p>
            <small>
              {logs.length === 0 
                ? 'Logs will appear here when socket events occur'
                : 'Try adjusting your filters'
              }
            </small>
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map((log) => (
              <div key={log.id} className={getLogLevelClass(log.level)}>
                <div className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </div>
                <div className="log-level">
                  <span className="level-icon">{getLogLevelIcon(log.level)}</span>
                  <span className="level-text">{log.level.toUpperCase()}</span>
                </div>
                <div className="log-message">
                  {log.message}
                </div>
                <div className="log-unit">
                  Unit: {log.unit}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      <div className="logs-footer">
        <div className="log-level-legend">
          <span className="legend-item error">🔴 Error</span>
          <span className="legend-item warning">🟡 Warning</span>
          <span className="legend-item success">🟢 Success</span>
          <span className="legend-item info">ℹ️ Info</span>
        </div>
      </div>
    </div>
  );
};

export default SocketLogs;