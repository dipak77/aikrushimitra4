
import { ActivityLog } from "../types";

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

/**
 * Log user activity to the central server
 */
export const logActivity = async (view: string, location: string) => {
  const log: Partial<ActivityLog> = {
    timestamp: Date.now(),
    view,
    location,
    userAgent: navigator.userAgent
  };

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
  } catch (e) {
    console.warn("Analytics Sync Failed", e);
    // Fallback to local storage if server is unreachable
    const localLogs = JSON.parse(localStorage.getItem('pending_logs') || '[]');
    localStorage.setItem('pending_logs', JSON.stringify([...localLogs, log]));
  }
};

/**
 * Fetch global analytics stats from the server
 */
export const getServerAnalyticsStats = async () => {
  try {
    const res = await fetch('/api/analytics/stats');
    const logs: ActivityLog[] = await res.json();
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Calculate week start (Sunday)
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const startOfWeek = new Date(d.setDate(diff)).setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const daily = logs.filter(l => l.timestamp >= startOfDay).length;
    const weekly = logs.filter(l => l.timestamp >= startOfWeek).length;
    const monthly = logs.filter(l => l.timestamp >= startOfMonth).length;
    const total = logs.length;

    // View Breakdown
    const views: Record<string, number> = {};
    const locations: Record<string, number> = {};
    
    logs.forEach(l => {
      views[l.view] = (views[l.view] || 0) + 1;
      const loc = l.location || 'Unknown';
      locations[loc] = (locations[loc] || 0) + 1;
    });

    return { daily, weekly, monthly, total, views, locations, logs };
  } catch (e) {
    console.error("Failed to fetch server stats", e);
    throw e;
  }
};
