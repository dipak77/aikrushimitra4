
export const formatDate = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

/**
 * Trigger haptic feedback on supported devices
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 50;
    navigator.vibrate(duration);
  }
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): { supported: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!('WebSocket' in window)) missing.push('WebSocket');
  if (!('AudioContext' in window || 'webkitAudioContext' in window)) {
    missing.push('AudioContext');
  }
  if (!navigator.mediaDevices?.getUserMedia) missing.push('getUserMedia');
  
  return {
    supported: missing.length === 0,
    missing
  };
}

/**
 * Format timestamp for display
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 100
): Promise<boolean> {
  const startTime = Date.now();
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return true;
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
