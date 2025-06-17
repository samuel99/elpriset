import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { ThemeManager } from '@/utils/ThemeManager';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    // Subscribe to theme changes to force re-render
    const unsubscribe = ThemeManager.subscribe(() => {
      forceUpdate({});
    });
    
    return unsubscribe;
  }, []);
  
  // Also force update when system color scheme changes (for 'system' mode)
  useEffect(() => {
    forceUpdate({});
  }, [systemColorScheme]);
  
  // Get current theme mode and resolve to actual color scheme
  const themeMode = ThemeManager.getThemeMode();
  
  if (themeMode === 'system') {
    return systemColorScheme ?? 'light';
  }
  
  return themeMode;
}
