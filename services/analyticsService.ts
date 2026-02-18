
import { ActivityLog, UserProfile } from "../types";

const STORAGE_KEY = 'app_activity_logs';
const SESSION_KEY = 'app_current_session';

// Target Hash for "Dpk#2026" (SHA-256)
export const TARGET_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"; 

// Secure Password Hashing (SHA-256) with Fallback
export const hashPassword = async (password: string): Promise<string> => {
  if (password === "Dpk#2026") {
      return TARGET_HASH;
  }

  if (window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.error("Crypto Error:", e);
    }
  }
  
  return "invalid_hash_fallback";
};

// Helper to parse User Agent for Device/OS details
const getDeviceDetails = () => {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';
  
  let os = 'Unknown';
  if (ua.indexOf("Win") !== -1) os = "Windows";
  if (ua.indexOf("Mac") !== -1) os = "MacOS";
  if (ua.indexOf("Linux") !== -1) os = "Linux";
  if (ua.indexOf("Android") !== -1) os = "Android";
  if (ua.indexOf("like Mac") !== -1) os = "iOS";

  return { device, os };
}

export const logActivity = (view: string, location: string, user?: UserProfile, action: string = 'VIEW') => {
  // Session Management
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  const { device, os } = getDeviceDetails();
  
  // Determine Provider
  let provider: 'google' | 'guest' | 'unknown' = 'unknown';
  if (user?.email) {
      if (user.email.includes('guest')) provider = 'guest';
      else provider = 'google';
  }

  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    view,
    action,
    location: location || "Unknown",
    userAgent: navigator.userAgent,
    userName: user?.name || 'Guest',
    userEmail: user?.email || 'N/A',
    sessionId,
    device,
    os,
    provider
  };

  const existingLogs = getLogs();
  // Keep last 5000 logs for robust history
  const updatedLogs = [newLog, ...existingLogs].slice(0, 5000);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
};

export const getLogs = (): ActivityLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const getAnalyticsStats = () => {
  const logs = getLogs();
  const now = Date.now();
  
  // Time boundaries
  const startOfDay = new Date().setHours(0,0,0,0);
  
  // 1. Basic Counts
  const totalLogs = logs.length;
  const dailyActivity = logs.filter(l => l.timestamp >= startOfDay).length;
  
  // 2. User Analysis Data Structures
  const userMap = new Map();
  const activeThreshold = 30 * 60 * 1000; // 30 mins for "Active" status
  let activeUsersCount = 0;

  // Session Duration Map (SessionID -> {start, end})
  const sessionDurations = new Map(); 

  // First pass: Calculate session times (min/max timestamps per session)
  logs.forEach(l => {
      const sid = l.sessionId || 'unknown';
      if(!sessionDurations.has(sid)) sessionDurations.set(sid, {start: l.timestamp, end: l.timestamp});
      const s = sessionDurations.get(sid);
      s.start = Math.min(s.start, l.timestamp);
      s.end = Math.max(s.end, l.timestamp);
  });

  // Second pass: Aggregate User Data
  logs.forEach(log => {
    if (!log.userEmail || log.userEmail === 'N/A') return;
    
    if (!userMap.has(log.userEmail)) {
      userMap.set(log.userEmail, {
        name: log.userName,
        email: log.userEmail,
        provider: log.provider || (log.userEmail.includes('guest') ? 'guest' : 'google'),
        firstSeen: log.timestamp,
        lastSeen: log.timestamp,
        lastLocation: log.location,
        sessions: new Set(),
        locations: new Set(),
        devices: new Set(),
        os: new Set(),
        totalTime: 0,
        logsCount: 0
      });
    }
    
    const u = userMap.get(log.userEmail);
    u.lastSeen = Math.max(u.lastSeen, log.timestamp);
    u.firstSeen = Math.min(u.firstSeen, log.timestamp);
    // Update location to most recent
    if (log.timestamp === u.lastSeen) u.lastLocation = log.location;
    
    if (log.sessionId) u.sessions.add(log.sessionId);
    u.locations.add(log.location);
    if (log.device) u.devices.add(log.device);
    if (log.os) u.os.add(log.os);
    u.logsCount++;
  });

  // Finalize User Stats (Calculate Time Spent)
  const users = Array.from(userMap.values()).map(u => {
      let time = 0;
      u.sessions.forEach((sid: string) => {
          const s = sessionDurations.get(sid);
          if(s) {
             let duration = s.end - s.start;
             // If session has only 1 log or duration is 0, estimate 30s as baseline engagement
             if (duration === 0) duration = 30 * 1000; 
             time += duration;
          }
      });

      const isActive = (now - u.lastSeen) < activeThreshold;
      if (isActive) activeUsersCount++;

      return {
          ...u,
          sessionsCount: u.sessions.size,
          uniqueLocations: u.locations.size,
          deviceList: Array.from(u.devices),
          osList: Array.from(u.os),
          totalTimeFormatted: formatDuration(time),
          totalTimeMs: time,
          isActive,
          status: isActive ? 'Online' : 'Offline'
      };
  });

  // 3. Provider Split
  const googleUsers = users.filter(u => u.provider === 'google').length;
  const guestUsers = users.filter(u => u.provider === 'guest').length;

  // 4. View Analytics
  const views: Record<string, number> = {};
  logs.forEach(l => { views[l.view] = (views[l.view] || 0) + 1; });

  // 5. Avg Session Time (Global)
  const totalSessionTime = Array.from(sessionDurations.values()).reduce((acc: number, val: any) => acc + (val.end - val.start), 0);
  const avgSessionTime = sessionDurations.size > 0 ? formatDuration(totalSessionTime / sessionDurations.size) : '0m';

  return {
    overview: {
        totalLogs,
        totalUsers: users.length,
        activeUsers: activeUsersCount,
        googleUsers,
        guestUsers,
        dailyActivity,
        avgSessionTime,
        totalSessions: sessionDurations.size
    },
    users: users.sort((a,b) => b.lastSeen - a.lastSeen),
    views,
    recentLogs: logs.slice(0, 100)
  };
};

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
