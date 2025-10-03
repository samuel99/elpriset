/**
 * Custom hook for managing price data state and fetching
 */

import { fetchPricesForDate } from "@/services/priceService";
import type { PriceEntry } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UsePriceDataReturn {
  prices: PriceEntry[];
  tomorrowPrices: PriceEntry[];
  loading: boolean;
  tomorrowLoading: boolean;
  error: string | null;
  tomorrowError: string | null;
  refetch: () => void;
}

export const usePriceData = (
  selectedArea: string | null,
  areaLoading: boolean
): UsePriceDataReturn => {
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [tomorrowPrices, setTomorrowPrices] = useState<PriceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tomorrowLoading, setTomorrowLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tomorrowError, setTomorrowError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedArea || areaLoading) return;

    // Reset states
    setLoading(true);
    setTomorrowLoading(true);
    setError(null);
    setTomorrowError(null);

    // Fetch today's prices
    try {
      const todayData = await fetchPricesForDate(selectedArea);
      setPrices(todayData);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setLoading(false);
    }

    // Fetch tomorrow's prices
    try {
      const tomorrowData = await fetchPricesForDate(selectedArea, 1);
      setTomorrowPrices(tomorrowData);
      setTomorrowLoading(false);
      setTomorrowError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setTomorrowPrices([]);
      setTomorrowLoading(false);
      setTomorrowError(errorMessage);
    }
  }, [selectedArea, areaLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    prices,
    tomorrowPrices,
    loading,
    tomorrowLoading,
    error,
    tomorrowError,
    refetch: fetchData,
  };
};
