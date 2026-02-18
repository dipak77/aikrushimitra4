import { ActivityLog, UserProfile } from "../types";

const SESSION_KEY = 'app_current_session';

export const TARGET_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

export const hashPassword = async (password: string): Promise<string> => {
  if (password === "Dpk#2026") return TARGET_HASH;

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

const getDeviceDetails = () => {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = "Windows";
  if (/Macintosh/i.test(ua)) os = "MacOS";       // FIX: was ua.indexOf("Mac")
  if (/Linux/i.test(ua)) os = "Linux";
  if (/Android/i.test(ua)) os = "Android";
  if (/like Mac OS X/i.test(ua)) os = "iOS";      // FIX: was "like Mac" - too broad

  return { device, os };
};

// FIX: Improved provider detection
const detectProvider = (user?: UserProfile): 'google' | 'guest' | 'unknown' => {
  if (!user?.email) return 'unknown';
  // Guest users typically have no real email or a generated placeholder
  if (
    user.email === 'N/A' ||
    user.email.toLowerCase().includes('guest') ||
    user.email.toLowerCase().includes('anonymous') ||
    !user.email.includes('@')
  ) return 'guest';
  return 'google';
};

export const logActivity = async (
  view: string,
  location: string,
  user?: UserProfile,
  action: string = 'VIEW'
) => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  const { device, os } = getDeviceDetails();
  const provider = detectProvider(user);

  // FIX: Use a stable identifier for guests instead of 'N/A'
  const userEmail = user?.email && user.email !== 'N/A'
    ? user.email
    : `guest_${sessionId}`;  // Unique per session so guests ARE tracked

  const userName = user?.name || `Guest_${sessionId.substring(0, 6)}`;

  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    view,
    action,
    location: location || "Unknown",
    userAgent: navigator.userAgent,
    userName,
    userEmail,
    sessionId,
    device,
    os,
    provider
  };

  try {
    const response = await fetch('/api/activity/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
      cache: 'no-store'
    });

    if (!response.ok && response.status === 404) {
      await fetch('/api/analytics/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
        cache: 'no-store'
      });
    }
  } catch (e) {
    console.error("Failed to sync log to server", e);
  }
};

const fetchLogsFromServer = async (): Promise<ActivityLog[]> => {
  const endpoints = ['/api/activity/stats', '/api/analytics/stats'];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });

      if (response.status === 404) continue; // Try next endpoint

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || '';
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.warn(`Non-JSON from ${endpoint}:`, text.substring(0, 150));
        continue;
      }

      const data = await response.json();
      if (Array.isArray(data)) return data;

      console.warn(`Unexpected data shape from ${endpoint}:`, data);
    } catch (e) {
      console.error(`Error fetching from ${endpoint}:`, e);
    }
  }

  console.warn("All analytics endpoints failed. Returning empty logs.");
  return [];
};

export const getAnalyticsStats = async () => {
  const logs = await fetchLogsFromServer();
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  const totalLogs = logs.length;
  const dailyActivity = logs.filter(l => l.timestamp >= startOfDay).length;

  // --- Session Duration Map ---
  const sessionDurations = new Map<string, { start: number; end: number }>();

  logs.forEach(l => {
    const sid = l.sessionId || `no_session_${l.userEmail}`;
    if (!sessionDurations.has(sid)) {
      sessionDurations.set(sid, { start: l.timestamp, end: l.timestamp });
    }
    const s = sessionDurations.get(sid)!;
    s.start = Math.min(s.start, l.timestamp);
    s.end = Math.max(s.end, l.timestamp);
  });

  // --- User Aggregation ---
  // FIX: No longer skip 'N/A' emails — guests now have guest_<sessionId> emails
  const userMap = new Map<string, any>();
  let activeUsersCount = 0;
  const activeThreshold = 30 * 60 * 1000; // 30 minutes

  logs.forEach(log => {
    // FIX: Only skip truly empty/undefined emails
    if (!log.userEmail) return;

    const key = log.userEmail;

    if (!userMap.has(key)) {
      userMap.set(key, {
        name: log.userName,
        email: log.userEmail,
        provider: log.provider || 'unknown',
        firstSeen: log.timestamp,
        lastSeen: log.timestamp,
        lastLocation: log.location,
        sessions: new Set<string>(),
        locations: new Set<string>(),
        devices: new Set<string>(),
        osSet: new Set<string>(),        // FIX: renamed to avoid conflict with 'os' field
        logsCount: 0
      });
    }

    const u = userMap.get(key);

    // FIX: Update firstSeen/lastSeen BEFORE using them for location check
    const newLastSeen = Math.max(u.lastSeen, log.timestamp);
    const newFirstSeen = Math.min(u.firstSeen, log.timestamp);

    // FIX: Correctly update lastLocation — track most recent log
    if (log.timestamp >= u.lastSeen) {
      u.lastSeen = log.timestamp;
      u.lastLocation = log.location; // Always update when this log is newer
    }
    u.firstSeen = newFirstSeen;

    // FIX: Update provider if currently unknown
    if (u.provider === 'unknown' && log.provider && log.provider !== 'unknown') {
      u.provider = log.provider;
    }

    if (log.sessionId) u.sessions.add(log.sessionId);
    if (log.location) u.locations.add(log.location);
    if (log.device) u.devices.add(log.device);
    if (log.os) u.osSet.add(log.os);
    u.logsCount++;
  });

  // --- Finalize Users ---
  const users = Array.from(userMap.values()).map(u => {
    let totalTimeMs = 0;

    u.sessions.forEach((sid: string) => {
      const s = sessionDurations.get(sid);
      if (s) {
        let duration = s.end - s.start;
        // Minimum 30s engagement per session (single-log sessions)
        if (duration === 0) duration = 30 * 1000;
        totalTimeMs += duration;
      }
    });

    // FIX: Use serverTimestamp if available for active check (falls back to timestamp)
    const isActive = (now - u.lastSeen) < activeThreshold;
    if (isActive) activeUsersCount++;

    return {
      name: u.name,
      email: u.email,
      provider: u.provider,
      firstSeen: u.firstSeen,
      lastSeen: u.lastSeen,
      lastLocation: u.lastLocation,
      sessionsCount: u.sessions.size,
      uniqueLocations: u.locations.size,
      deviceList: Array.from(u.devices),
      osList: Array.from(u.osSet),
      logsCount: u.logsCount,
      totalTimeFormatted: formatDuration(totalTimeMs),
      totalTimeMs,
      isActive,
      status: isActive ? '🟢 Online' : '⚫ Offline'
    };
  });

  // --- Provider Split ---
  const googleUsers = users.filter(u => u.provider === 'google').length;
  const guestUsers = users.filter(u => u.provider === 'guest').length;
  const unknownUsers = users.filter(u => u.provider === 'unknown').length;

  // --- View Analytics ---
  const views: Record<string, number> = {};
  logs.forEach(l => {
    if (l.view) views[l.view] = (views[l.view] || 0) + 1;
  });

  // --- Average Session Time ---
  const totalSessionTime = Array.from(sessionDurations.values())
    .reduce((acc, val) => acc + (val.end - val.start), 0);
  const avgSessionTime = sessionDurations.size > 0
    ? formatDuration(totalSessionTime / sessionDurations.size)
    : '0s';

  return {
    overview: {
      totalLogs,
      totalUsers: users.length,
      activeUsers: activeUsersCount,
      googleUsers,
      guestUsers,
      unknownUsers,     // NEW: track unknowns separately
      dailyActivity,
      avgSessionTime,
      totalSessions: sessionDurations.size
    },
    users: users.sort((a, b) => b.lastSeen - a.lastSeen),
    views,
    recentLogs: logs.slice(0, 100)
  };
};

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0s';
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}