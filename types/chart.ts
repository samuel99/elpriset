/**
 * Chart-related types for data visualization
 */

/**
 * Data point for bar chart visualization
 */
export type BarDataPoint = {
  value: number;
  label?: string;
  frontColor?: string;
};

/**
 * Chart configuration options
 */
export type ChartConfig = {
  height: number;
  barWidth: number;
  spacing: number;
  maxValue?: number;
  minValue?: number;
};

/**
 * Chart theme colors
 */
export type ChartTheme = {
  barColor: string;
  highlightColor: string;
  futureColor: string;
  backgroundColor: string;
};
