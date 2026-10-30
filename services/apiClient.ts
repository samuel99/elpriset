import { API_CONFIG } from "@/config/api";

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timeoutId = setTimeout(abort, API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new ApiError(`Request timeout after ${API_CONFIG.TIMEOUT}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abort);
  }
}