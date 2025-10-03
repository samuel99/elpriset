/**
 * Utility functions for price formatting and time operations
 */

/**
 * Get current time with simulation support
 */
export const getCurrentTime = () => {
  //return new Date("2025-08-12T09:06:00"); // Simulate a date for testing
  return new Date();
};

/**
 * Format time from ISO string to HH:MM format
 */
export const formatTime = (timeStart: string): string => {
  const hour = new Date(timeStart).getHours();
  const minutes = new Date(timeStart).getMinutes();
  return `${hour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Format price from SEK per kWh to öre/kWh with Swedish locale
 */
export const formatPrice = (pricePerKWh: number): string => {
  return (pricePerKWh * 100).toLocaleString("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
};

/**
 * Get area display name
 */
export const getAreaName = (area: string): string => {
  const names: Record<string, string> = {
    SE1: "SE1",
    SE2: "SE2",
    SE3: "SE3",
    SE4: "SE4",
  };
  return names[area] || area;
};
