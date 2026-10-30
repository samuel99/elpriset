import { ApiError } from "@/services/apiClient";
import {
    fetchForecastPrices,
    fetchPricesForDate,
} from "@/services/priceService";
import type { ForecastPriceEntry, PriceArea, PriceEntry } from "@/types";
import { getMarketDateKey, QUARTER_HOUR_MS } from "@/utils/dateUtils";
import { useCallback, useEffect, useState } from "react";
import { useCurrentTime } from "./useCurrentTime";

type PriceRequest<Entry> = {
  key: string | null;
  data: Entry[];
  loading: boolean;
  error: string | null;
};

function usePriceRequest<Entry>(
  key: string | null,
  refreshKey: string,
  fetchData: (signal: AbortSignal) => Promise<Entry[]>,
) {
  const [state, setState] = useState<PriceRequest<Entry>>({
    key: null,
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    setState((previous) => ({
      key,
      data: previous.key === key ? previous.data : [],
      loading: true,
      error: null,
    }));
    fetchData(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ key, data, loading: false, error: null });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            key,
            data: [],
            loading: false,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      },
    );
    return () => controller.abort();
  }, [key, refreshKey, fetchData]);

  const isCurrent = key !== null && state.key === key;
  return {
    data: isCurrent ? state.data : [],
    loading: key !== null && (!isCurrent || state.loading),
    error: isCurrent ? state.error : null,
  };
}

interface UsePriceDataReturn {
  prices: PriceEntry[];
  tomorrowPrices: PriceEntry[];
  loading: boolean;
  tomorrowLoading: boolean;
  error: string | null;
  tomorrowError: string | null;
  forecastPrices: ForecastPriceEntry[];
  forecastLoading: boolean;
  forecastError: string | null;
  now: Date;
  refetch: () => void;
}

export const usePriceData = (
  selectedArea: PriceArea | null,
  areaLoading: boolean,
  showForecast: boolean = false,
): UsePriceDataReturn => {
  const now = useCurrentTime();
  const dateKey = getMarketDateKey(now);
  const [revision, setRevision] = useState(0);
  const requestKey =
    selectedArea && !areaLoading ? `${selectedArea}:${dateKey}` : null;
  const refreshKey = `${Math.floor(now.getTime() / QUARTER_HOUR_MS)}:${revision}`;

  const fetchToday = useCallback(
    (signal: AbortSignal) => {
      if (!selectedArea) return Promise.resolve([]);
      return fetchPricesForDate(
        selectedArea,
        0,
        signal,
        new Date(`${dateKey}T12:00:00Z`),
      );
    },
    [selectedArea, dateKey],
  );

  const fetchTomorrow = useCallback(
    async (signal: AbortSignal) => {
      if (!selectedArea) return [];
      try {
        return await fetchPricesForDate(
          selectedArea,
          1,
          signal,
          new Date(`${dateKey}T12:00:00Z`),
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return [];
        throw error;
      }
    },
    [selectedArea, dateKey],
  );

  const fetchForecast = useCallback(
    (signal: AbortSignal) => {
      if (!selectedArea) return Promise.resolve([]);
      return fetchForecastPrices(selectedArea, signal);
    },
    [selectedArea],
  );

  const today = usePriceRequest<PriceEntry>(requestKey, refreshKey, fetchToday);
  const tomorrow = usePriceRequest<PriceEntry>(
    requestKey,
    refreshKey,
    fetchTomorrow,
  );
  const forecast = usePriceRequest<ForecastPriceEntry>(
    showForecast ? requestKey : null,
    refreshKey,
    fetchForecast,
  );
  const refetch = useCallback(() => setRevision((value) => value + 1), []);

  return {
    prices: today.data,
    tomorrowPrices: tomorrow.data,
    loading: today.loading,
    tomorrowLoading: tomorrow.loading,
    error: today.error,
    tomorrowError: tomorrow.error,
    forecastPrices: forecast.data,
    forecastLoading: forecast.loading,
    forecastError: forecast.error ? "Kunde inte hämta prognosen." : null,
    now,
    refetch,
  };
};
