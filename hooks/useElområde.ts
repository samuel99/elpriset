import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "selected_elområde";
const DEFAULT_AREA = "SE3";

// Global state to share between all instances
let globalSelectedArea = DEFAULT_AREA;
let globalIsLoading = true;
let subscribers: Array<(area: string) => void> = [];

// Function to notify all subscribers of state changes
const notifySubscribers = (newArea: string) => {
  globalSelectedArea = newArea;
  subscribers.forEach((callback) => callback(newArea));
};

export function useElområde() {
  const [selectedArea, setSelectedArea] = useState<string>(globalSelectedArea);
  const [isLoading, setIsLoading] = useState(globalIsLoading);

  useEffect(() => {
    // Subscribe to global state changes
    const unsubscribe = (newArea: string) => {
      setSelectedArea(newArea);
    };

    subscribers.push(unsubscribe);

    // Load initial data only once
    if (globalIsLoading) {
      loadSelectedArea();
    } else {
      setIsLoading(false);
    }

    // Cleanup subscription on unmount
    return () => {
      subscribers = subscribers.filter((sub) => sub !== unsubscribe);
    };
  }, []);
  const loadSelectedArea = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const areaToSet = saved || DEFAULT_AREA;

      globalSelectedArea = areaToSet;
      globalIsLoading = false;

      setSelectedArea(areaToSet);
      setIsLoading(false);

      // Notify other subscribers
      notifySubscribers(areaToSet);
    } catch (error) {
      console.log("Error loading selected area:", error);
      globalIsLoading = false;
      setIsLoading(false);
    }
  };
  const saveSelectedArea = async (area: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, area);

      // Update global state and notify all subscribers
      notifySubscribers(area);
    } catch (error) {
      console.log("Error saving selected area:", error);
    }
  };

  return {
    selectedArea,
    setSelectedArea: saveSelectedArea,
    isLoading,
  };
}
