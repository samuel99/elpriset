/**
 * API Configuration with environment variables
 * Single source of truth with sensible defaults
 */
export const API_CONFIG = {
  BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || "https://www.elprisetjustnu.se/api/v1",
  TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 5000,
  RETRY_ATTEMPTS: Number(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS) || 3,
} as const;

/**
 * Build API URL for price data
 */
export const buildPriceUrl = (area: string, date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  return `${API_CONFIG.BASE_URL}/prices/${year}/${dateStr.slice(
    5
  )}_${area}.json`;
};

/**
 * Demo URL for testing (commented URL from original code)
 */
export const DEMO_URL = `${API_CONFIG.BASE_URL}/prices/kvartspris_demo.json`;
