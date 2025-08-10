export const formatTime = (date: Date, is24Hour: boolean): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (is24Hour) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  }
};

export const getSeconds = (date: Date): number => {
  return date.getSeconds();
};

export const getTimeForTimeZone = (timeZone: string): Date => {
  if (timeZone === 'local') {
    return new Date();
  }
  
  // For now, we'll just return local time
  // In a real app, you'd implement proper timezone handling
  return new Date();
};