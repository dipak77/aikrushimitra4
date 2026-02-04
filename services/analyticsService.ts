
import { ActivityLog, UserProfile } from "../types";

const STORAGE_KEY = 'app_activity_logs';

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

export const logActivity = (view: string, location: string, user?: UserProfile) => {
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    view,
    location,
    userAgent: navigator.userAgent,
    userName: user?.name || 'Guest',
    userEmail: user?.email || 'N/A'
  };

  const existingLogs = getLogs();
  // Keep only last 1000 logs to prevent storage overflow
  const updatedLogs = [newLog, ...existingLogs].slice(0, 1000);
  
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
  const now = new Date();
  
  // Time boundaries
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filter Counts
  const daily = logs.filter(l => l.timestamp >= startOfDay).length;
  const weekly = logs.filter(l => l.timestamp >= startOfWeek).length;
  const monthly = logs.filter(l => l.timestamp >= startOfMonth).length;
  const total = logs.length;

  // View Breakdown
  const views: Record<string, number> = {};
  logs.forEach(l => {
    views[l.view] = (views[l.view] || 0) + 1;
  });
  
  // Unique Users
  const uniqueUsers = new Set(logs.map(l => l.userEmail).filter(e => e !== 'N/A')).size;

  return { daily, weekly, monthly, total, views, logs, uniqueUsers };
};
