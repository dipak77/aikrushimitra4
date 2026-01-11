
export const formatDate = () => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

export const triggerHaptic = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(15); 
  }
};
