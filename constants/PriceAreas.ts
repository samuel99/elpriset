import type { PriceArea, PriceAreaOption } from "@/types";

export const DEFAULT_PRICE_AREA: PriceArea = "SE3";

export const PRICE_AREAS: readonly PriceAreaOption[] = [
  { value: "SE1", label: "SE1, Norra Sverige" },
  { value: "SE2", label: "SE2, Norra Mellansverige" },
  { value: "SE3", label: "SE3, Södra Mellansverige" },
  { value: "SE4", label: "SE4, Södra Sverige" },
];

export const isPriceArea = (value: unknown): value is PriceArea =>
  PRICE_AREAS.some((area) => area.value === value);