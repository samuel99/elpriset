import { createPreferenceStore } from "@/utils/createPreferenceStore";
import { usePreference } from "./usePreference";

const forecastStore = createPreferenceStore("show_price_forecast", false, (saved) => saved === "true");

export function useForecastPreference() {
  const state = usePreference(forecastStore);
  return {
    showForecast: state.value,
    setShowForecast: forecastStore.setValue,
    isLoading: state.isLoading,
    error: state.error,
  };
}
