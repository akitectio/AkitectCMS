/**
 * Format a date string to a more readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "Apr 15, 2023")
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string with time
 * @param dateString ISO date string
 * @returns Formatted date and time string (e.g., "Apr 15, 2023, 2:30 PM")
 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Invalid date';
  }
};

/**
 * Get relative time from now (e.g., "3 hours ago", "2 days ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    
    // Convert to appropriate unit
    const secondsInMinute = 60;
    const secondsInHour = 60 * secondsInMinute;
    const secondsInDay = 24 * secondsInHour;
    const secondsInMonth = 30 * secondsInDay;
    const secondsInYear = 365 * secondsInDay;

    if (Math.abs(diffInSeconds) < secondsInMinute) {
      return rtf.format(Math.floor(diffInSeconds), 'second');
    } else if (Math.abs(diffInSeconds) < secondsInHour) {
      return rtf.format(Math.floor(diffInSeconds / secondsInMinute), 'minute');
    } else if (Math.abs(diffInSeconds) < secondsInDay) {
      return rtf.format(Math.floor(diffInSeconds / secondsInHour), 'hour');
    } else if (Math.abs(diffInSeconds) < secondsInMonth) {
      return rtf.format(Math.floor(diffInSeconds / secondsInDay), 'day');
    } else if (Math.abs(diffInSeconds) < secondsInYear) {
      return rtf.format(Math.floor(diffInSeconds / secondsInMonth), 'month');
    } else {
      return rtf.format(Math.floor(diffInSeconds / secondsInYear), 'year');
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown time';
  }
};