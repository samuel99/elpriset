import { getCurrentTime } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useCurrentTime(): Date {
  const [now, setNow] = useState(getCurrentTime);
  useEffect(() => {
    const update = () => setNow(getCurrentTime());
    const timer = setInterval(update, 30000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") update();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  return now;
}