// Constant for localStorage keys
export const ELEVATE_USER = 'ELEVATE_USER';
export const ECESS_TOKEN = 'ECESS_TOKEN';
export const UNIT_SELECTED = 'UNIT_SELECTED';
export const CURRENT_PUNCH_STATUS = 'CURRENT_PUNCH_STATUS';
export const CURRENT_ATTENDANCE_ID = 'CURRENT_ATTENDANCE_ID';
export const PUNCH_IN_TIME = 'PUNCH_IN_TIME';
export const PUNCH_RECORDS = 'PUNCH_RECORDS';


/**
 * Sets user data in localStorage
 * @param {Object} data - User data to store
 */
export const setElevateUser = (data) => {
  localStorage.setItem(ELEVATE_USER, JSON.stringify(data));
};

export const setAcessToken = (data) => {
  localStorage.setItem(ECESS_TOKEN, JSON.stringify(data));
};

/**
 * Sets selected unit data in localStorage
 * @param {Object} data - Unit data to store
 */
export const setSelectedUnit = (data) => {
  localStorage.setItem(UNIT_SELECTED, JSON.stringify(data));
};

/**
 * Gets user data from localStorage
 * @returns {Object|null} - Parsed user data or null if not found
 */
export const getElevateUser = () => {
  const data = localStorage.getItem(ELEVATE_USER);
  return data ? JSON.parse(data) : null;
};

export const getAcessToken = () => {
  const data = localStorage.getItem(ECESS_TOKEN);
  return data ? JSON.parse(data) : null;
};

/**
 * Gets selected unit data from localStorage
 * @returns {Object|null} - Parsed unit data or null if not found
 */
export const getSelectedUnit = () => {
  const data = localStorage.getItem(UNIT_SELECTED);
  return data ? JSON.parse(data) : null;
};

/**
 * Removes user data from localStorage
 * @returns {boolean} - True if data was removed, false if it didn't exist
 */
export const removeElevateUser = () => {
  if (localStorage.getItem(ELEVATE_USER)) {
    localStorage.removeItem(ELEVATE_USER);
    return true;
  }
  return false;
};

export const removeAcessToken = () => {
  if (localStorage.getItem(ECESS_TOKEN)) {
    localStorage.removeItem(ECESS_TOKEN);
    return true;
  }
  return false;
};

/**
 * Removes selected unit data from localStorage
 * @returns {boolean} - True if data was removed, false if it didn't exist
 */
export const removeSelectedUnit = () => {
  if (localStorage.getItem(UNIT_SELECTED)) {
    localStorage.removeItem(UNIT_SELECTED);
    return true;
  }
  return false;
};

/**
 * Safely ensures a value is a string and trims it
 * @param {any} value - Value to convert to string and trim
 * @returns {string} - Trimmed string or empty string if value is null/undefined
 */
// export const safeStringTrim = (value) => {
//   if (value === null || value === undefined) return '';
//   return typeof value === 'string' ? value.trim() : String(value).trim();
// };

/**
 * Service validation function
 * @param {Object} json - Service data to validate
 * @returns {Promise<Object>} - Promise resolving to validation errors
 */


// Attendance localStorage keys


/**
 * Sets current punch status in localStorage
 * @param {string} status - Punch status ('in' or 'out')
 */
export const setPunchStatus = (status) => {
  localStorage.setItem(CURRENT_PUNCH_STATUS, status);
};

/**
 * Gets current punch status from localStorage
 * @returns {string} - Punch status or 'out' if not found
 */
export const getPunchStatus = () => {
  return localStorage.getItem(CURRENT_PUNCH_STATUS) || 'out';
};

/**
 * Sets current attendance ID in localStorage
 * @param {string} attendanceId - Attendance ID from API response
 */
export const setAttendanceId = (attendanceId) => {
  localStorage.setItem(CURRENT_ATTENDANCE_ID, attendanceId);
};

/**
 * Gets current attendance ID from localStorage
 * @returns {string|null} - Attendance ID or null if not found
 */
export const getAttendanceId = () => {
  return localStorage.getItem(CURRENT_ATTENDANCE_ID);
};

/**
 * Sets punch in time in localStorage
 * @param {number} timestamp - Punch in timestamp
 */
export const setPunchInTime = (timestamp) => {
  localStorage.setItem(PUNCH_IN_TIME, timestamp.toString());
};

/**
 * Gets punch in time from localStorage
 * @returns {number|null} - Punch in timestamp or null if not found
 */
export const getPunchInTime = () => {
  const time = localStorage.getItem(PUNCH_IN_TIME);
  return time ? parseInt(time) : null;
};

/**
 * Adds a punch record to localStorage
 * @param {Object} record - Punch record object
 */
export const addPunchRecord = (record) => {
  const allRecords = JSON.parse(localStorage.getItem(PUNCH_RECORDS) || '[]');
  allRecords.push(record);
  localStorage.setItem(PUNCH_RECORDS, JSON.stringify(allRecords));
};

/**
 * Gets all punch records from localStorage
 * @returns {Array} - Array of punch records
 */
export const getPunchRecords = () => {
  return JSON.parse(localStorage.getItem(PUNCH_RECORDS) || '[]');
};

/**
 * Clears all attendance data from localStorage
 */
export const clearAttendanceData = () => {
  localStorage.removeItem(CURRENT_PUNCH_STATUS);
  localStorage.removeItem(CURRENT_ATTENDANCE_ID);
  localStorage.removeItem(PUNCH_IN_TIME);
  localStorage.removeItem(PUNCH_RECORDS);
};

/**
 * Removes attendance ID from localStorage
 */
export const removeAttendanceId = () => {
  localStorage.removeItem(CURRENT_ATTENDANCE_ID);
};

/**
 * Removes punch in time from localStorage
 */
export const removePunchInTime = () => {
  localStorage.removeItem(PUNCH_IN_TIME);
};

/**
 * Checks if the selected unit has a cash drawer enabled
 * @returns {Object} - Object containing cash drawer status and unit info
 */
export const getUnitCashDrawerStatus = () => {
  try {
    const unit = getSelectedUnit();
    
    if (!unit) {
      return {
        hasDrawer: false,
        unit: null,
        reason: 'No unit selected'
      };
    }

    // Check if unit has cash drawer settings
    const hasDrawerSettings = unit.cashDrawerSettings && 
                             Array.isArray(unit.cashDrawerSettings) && 
                             unit.cashDrawerSettings.length > 0;
    
    // Check if cash drawer is explicitly enabled
    const hasDrawerEnabled = unit.cashDrawerEnabled === true;
    
    // Unit has cash drawer if either settings exist or it's explicitly enabled
    const hasDrawer = hasDrawerSettings || hasDrawerEnabled;
    
    return {
      hasDrawer,
      unit,
      drawerSettings: unit.cashDrawerSettings || [],
      drawerEnabled: hasDrawerEnabled,
      reason: hasDrawer ? 'Cash drawer available' : 'Cash drawer not configured'
    };
  } catch (error) {
    console.error('Error checking unit cash drawer status:', error);
    return {
      hasDrawer: false,
      unit: null,
      reason: 'Error checking cash drawer status'
    };
  }
};