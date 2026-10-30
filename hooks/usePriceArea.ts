import { DEFAULT_PRICE_AREA, isPriceArea } from "@/constants/PriceAreas";
import { createPreferenceStore } from "@/utils/createPreferenceStore";
import { usePreference } from "./usePreference";

const areaStore = createPreferenceStore(
  "selected_price_area",
  DEFAULT_PRICE_AREA,
  (saved) => (isPriceArea(saved) ? saved : DEFAULT_PRICE_AREA),
);

export function usePriceArea() {
  const state = usePreference(areaStore);
  return {
    selectedArea: state.value,
    setSelectedArea: areaStore.setValue,
    isLoading: state.isLoading,
    error: state.error,
  };
}
