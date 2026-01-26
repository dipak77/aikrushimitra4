
import { ActivityLog } from "../types";

const STORAGE_KEY = 'app_activity_logs';

// Secure Password Hashing (SHA-256)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Target Hash for "Dpk#2026"
// Generated via SHA-256 online for consistency
export const TARGET_HASH = "b4662657e20603775e533036a793c2005075c32432d0c24209a803f292323269"; 

export const logActivity = (view: string, location: string) => {
  const newLog: ActivityLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    view,
    location,
    userAgent: navigator.userAgent
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

  return { daily, weekly, monthly, total, views, logs };
};
