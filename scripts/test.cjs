const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

function hideRendererDeprecation(context) {
  const report = console.error;
  context.mock.method(console, "error", (message, ...details) => {
    if (
      typeof message !== "string" ||
      !message.startsWith("react-test-renderer is deprecated")
    ) {
      report(message, ...details);
    }
  });
}

function loadSource(file, mocks = {}, cache = new Map()) {
  const filename = path.resolve(__dirname, "..", file);
  if (cache.has(filename)) return cache.get(filename).exports;
  const moduleObject = { exports: {} };
  cache.set(filename, moduleObject);
  const localRequire = (name) => {
    if (name in mocks) return mocks[name];
    if (name.startsWith("@/") || name.startsWith(".")) {
      const target = name.startsWith("@/")
        ? path.resolve(__dirname, "..", name.slice(2))
        : path.resolve(path.dirname(filename), name);
      return loadSource(
        `${path.relative(path.resolve(__dirname, ".."), target)}.ts`,
        mocks,
        cache,
      );
    }
    return require(name);
  };
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  new Function("require", "module", "exports", output)(
    localRequire,
    moduleObject,
    moduleObject.exports,
  );
  return moduleObject.exports;
}

test("market dates, clock labels and day arithmetic are independent of device timezone", () => {
  const {
    getMarketDateKey,
    addMarketDays,
    formatMarketTime,
    keepPreviousHour,
    isHighlighted,
  } = loadSource("utils/dateUtils.ts");
  const { buildPriceUrl } = loadSource("config/api.ts");
  const originalTimezone = process.env.TZ;
  try {
    process.env.TZ = "America/Los_Angeles";
    const now = new Date("2026-10-30T00:30:00+01:00");
    assert.equal(getMarketDateKey(now), "2026-10-30");
    assert.equal(formatMarketTime(now), "00:30");
    assert.match(buildPriceUrl("SE3", now), /\/2026\/10-30_SE3.json$/);
    assert.equal(addMarketDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addMarketDays("2026-03-29", 1), "2026-03-30");
    assert.equal(formatMarketTime(new Date("2026-03-29T01:00:00Z")), "03:00");
    assert.equal(formatMarketTime(new Date("2026-10-25T01:00:00Z")), "02:00");
    assert.equal(keepPreviousHour("2026-10-29T22:00:00Z", now), true);
    assert.equal(keepPreviousHour("2026-10-29T21:59:00Z", now), false);
    assert.equal(
      isHighlighted("2026-10-29T23:30:00Z", "2026-10-29T23:45:00Z", now),
      true,
    );
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test("published responses are validated and tomorrow is anchored to the same market date", async () => {
  const calls = [];
  let payload = { invalid: true };
  const { fetchPricesForDate } = loadSource("services/priceService.ts", {
    "./apiClient": {
      fetchJson: async (url) => {
        calls.push(url);
        return payload;
      },
    },
  });
  await assert.rejects(fetchPricesForDate("SE1"), /Invalid published/);
  payload = [
    {
      SEK_per_kWh: -0.5,
      EUR_per_kWh: -0.05,
      EXR: 10,
      time_start: "2026-10-30T00:00:00Z",
      time_end: "2026-10-30T00:15:00Z",
    },
  ];
  assert.equal(
    (
      await fetchPricesForDate(
        "SE1",
        1,
        undefined,
        new Date("2026-10-30T00:30:00+01:00"),
      )
    )[0].SEK_per_kWh,
    -0.5,
  );
  assert.match(calls.at(-1), /10-31_SE1/);
  payload[0].SEK_per_kWh = NaN;
  await assert.rejects(fetchPricesForDate("SE1"), /Invalid published/);
});

test("forecast normalization checks area, units and quarter-hour intervals", async () => {
  let payload = {
    zone: "SE1",
    days: [{ points: [{ ts_utc: "2026-10-30T00:00:00Z", ore_kwh: -5 }] }],
  };
  const { fetchForecastPrices } = loadSource("services/priceService.ts", {
    "./apiClient": {
      fetchJson: async (url) => {
        assert.equal(new URL(url).searchParams.get("zone"), "SE1");
        return payload;
      },
    },
  });
  const prices = await fetchForecastPrices("SE1");
  assert.equal(prices[0].SEK_per_kWh, -0.05);
  assert.equal(prices[0].isForecast, true);
  assert.equal(
    Date.parse(prices[0].time_end) - Date.parse(prices[0].time_start),
    900000,
  );
  payload = { zone: "SE2", days: [] };
  await assert.rejects(fetchForecastPrices("SE1"), /Invalid forecast/);
});

test("API timeout covers body reading and forwards external cancellation", async (context) => {
  const { fetchJson } = loadSource("services/apiClient.ts", {
    "@/config/api": { API_CONFIG: { TIMEOUT: 10 } },
  });
  context.mock.method(globalThis, "fetch", async (_url, { signal }) => ({
    ok: true,
    json: () =>
      new Promise((_resolve, reject) => {
        const rejectAbort = () =>
          reject(new DOMException("Aborted", "AbortError"));
        if (signal.aborted) rejectAbort();
        else signal.addEventListener("abort", rejectAbort, { once: true });
      }),
  }));
  await assert.rejects(fetchJson("https://example.test"), /timeout/);
  const controller = new AbortController();
  const pending = fetchJson("https://example.test", controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("preference storage initializes once and preserves the latest user choice", async () => {
  let resolveRead;
  let reads = 0;
  const writes = [];
  const storage = {
    getItem: () => {
      reads++;
      return new Promise((resolve) => {
        resolveRead = resolve;
      });
    },
    setItem: async (_key, value) => {
      writes.push(value);
    },
  };
  const { createPreferenceStore } = loadSource(
    "utils/createPreferenceStore.ts",
    {
      "@react-native-async-storage/async-storage": {
        __esModule: true,
        default: storage,
      },
    },
  );
  const store = createPreferenceStore("test", "SE3", (saved) =>
    saved === "SE1" ? saved : "SE3",
  );
  assert.equal(store.load(), store.load());
  assert.equal(reads, 1);
  const saveFirst = store.setValue("SE2");
  const saveLast = store.setValue("SE4");
  resolveRead("SE1");
  await Promise.all([store.load(), saveFirst, saveLast]);
  assert.equal(store.getSnapshot().value, "SE4");
  assert.deepEqual(writes, ["SE2", "SE4"]);
  assert.equal(store.getSnapshot().isLoading, false);
});

test("invalid saved preferences fall back and storage failures are exposed", async () => {
  const { createPreferenceStore } = loadSource(
    "utils/createPreferenceStore.ts",
    {
      "@react-native-async-storage/async-storage": {
        __esModule: true,
        default: {
          getItem: async () => "INVALID",
          setItem: async () => {
            throw new Error("Unavailable storage");
          },
        },
      },
    },
  );
  const { isPriceArea } = loadSource("constants/PriceAreas.ts");
  const store = createPreferenceStore("selected_price_area", "SE3", (saved) =>
    isPriceArea(saved) ? saved : "SE3",
  );
  await store.load();
  assert.equal(store.getSnapshot().value, "SE3");
  await store.setValue("SE1");
  assert.ok(store.getSnapshot().error);
});

test("price hooks run in parallel, ignore obsolete responses and refresh on date changes", async (context) => {
  const React = require("react");
  const { act, create } = require("react-test-renderer");
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  hideRendererDeprecation(context);
  let now = new Date("2026-10-30T12:00:00Z");
  const requests = [];
  const { usePriceData } = loadSource("hooks/usePriceData.ts", {
    "./useCurrentTime": { useCurrentTime: () => now },
    "@/services/priceService": {
      fetchPricesForDate: (area, offset, signal, date) =>
        new Promise((resolve, reject) =>
          requests.push({ area, offset, signal, date, resolve, reject }),
        ),
      fetchForecastPrices: async () => [],
    },
  });
  let result;
  function Probe({ area, forecast = false }) {
    result = usePriceData(area, false, forecast);
    return null;
  }
  let renderer;
  try {
    await act(async () => {
      renderer = create(React.createElement(Probe, { area: "SE1" }));
    });
    assert.equal(requests.length, 2);
    await act(async () => {
      renderer.update(React.createElement(Probe, { area: "SE2" }));
    });
    assert.ok(requests[0].signal.aborted);
    assert.equal(result.prices.length, 0);
    await act(async () => {
      requests[2].resolve([{ area: "SE2" }]);
      requests[3].resolve([{ area: "SE2 tomorrow" }]);
    });
    await act(async () => {
      requests[0].resolve([{ area: "SE1 stale" }]);
      requests[1].resolve([{ area: "SE1 stale tomorrow" }]);
    });
    assert.equal(result.prices[0].area, "SE2");
    assert.equal(result.tomorrowPrices[0].area, "SE2 tomorrow");
    now = new Date("2026-10-31T12:00:00Z");
    await act(async () => {
      renderer.update(React.createElement(Probe, { area: "SE2" }));
    });
    assert.equal(requests.length, 6);
    assert.equal(result.prices.length, 0);
    assert.equal(requests[4].date.toISOString(), "2026-10-31T12:00:00.000Z");
    now = new Date("2026-10-31T12:15:00Z");
    await act(async () => {
      renderer.update(React.createElement(Probe, { area: "SE2" }));
    });
    assert.equal(requests.length, 8);
    assert.ok(requests[4].signal.aborted);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});

test("chart slots preserve gaps, published precedence, negative prices and clock-driven highlighting", () => {
  const { transformData, getChartBounds } = loadSource("utils/chartUtils.ts");
  const { Colors } = loadSource("constants/Colors.ts");
  const entry = (start, value, forecast = false, minutes = 15) => ({
    SEK_per_kWh: value,
    EUR_per_kWh: value / 10,
    EXR: 10,
    time_start: start,
    time_end: new Date(Date.parse(start) + minutes * 60000).toISOString(),
    ...(forecast ? { isForecast: true } : {}),
  });
  const today = [entry("2026-10-30T12:00:00Z", 1, false, 60)];
  const forecast = [
    entry("2026-10-30T12:15:00Z", 9, true),
    entry("2026-10-30T14:00:00Z", -0.5, true),
    entry("2026-10-30T14:00:00Z", -0.5, true),
  ];
  const result = transformData(
    today,
    [],
    "light",
    forecast,
    new Date("2026-10-30T12:10:00Z"),
  );
  assert.equal(result.length, 9);
  assert.equal(result[0].value, 100);
  assert.equal(result[0].frontColor, Colors.primary);
  assert.equal(result[1].value, 100);
  assert.equal(result[1].priceEntry.isForecast, undefined);
  assert.equal(result[4].priceEntry, undefined);
  assert.equal(result[4].frontColor, "transparent");
  assert.equal(result[4].disablePress, true);
  assert.equal(result[8].value, -50);
  assert.equal(result[8].frontColor, Colors.light.forecastBar);
  assert.deepEqual(getChartBounds(result), { maxValue: 125, minValue: -60 });
  const advanced = transformData(
    today,
    [],
    "light",
    forecast,
    new Date("2026-10-30T12:20:00Z"),
  );
  assert.equal(advanced[0].frontColor, Colors.light.chartBar);
  assert.equal(advanced[1].frontColor, Colors.primary);
  const withoutForecast = transformData(
    today,
    [],
    "light",
    [],
    new Date("2026-10-30T12:10:00Z"),
  );
  assert.equal(withoutForecast.length, 4);
});

test("tomorrow 404 is unpublished, network failures remain errors, and disabled forecasts stay hidden", async (context) => {
  const React = require("react");
  const { act, create } = require("react-test-renderer");
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  hideRendererDeprecation(context);
  const { ApiError } = loadSource("services/apiClient.ts");
  let tomorrowStatus = 404;
  let forecastRequest;
  const { usePriceData } = loadSource("hooks/usePriceData.ts", {
    "@/services/apiClient": { ApiError },
    "./useCurrentTime": {
      useCurrentTime: () => new Date("2026-10-30T12:00:00Z"),
    },
    "@/services/priceService": {
      fetchPricesForDate: async (_area, offset) => {
        if (offset === 1) throw new ApiError("Unavailable", tomorrowStatus);
        return [{ marker: "published" }];
      },
      fetchForecastPrices: (_area, signal) =>
        new Promise((resolve) => {
          forecastRequest = { signal, resolve };
        }),
    },
  });
  let result;
  function Probe({ enabled }) {
    result = usePriceData("SE1", false, enabled);
    return null;
  }
  let renderer;
  try {
    await act(async () => {
      renderer = create(React.createElement(Probe, { enabled: true }));
    });
    assert.equal(result.tomorrowError, null);
    assert.deepEqual(result.tomorrowPrices, []);
    assert.equal(result.prices[0].marker, "published");
    await act(async () => {
      renderer.update(React.createElement(Probe, { enabled: false }));
    });
    assert.ok(forecastRequest.signal.aborted);
    await act(async () => {
      forecastRequest.resolve([{ isForecast: true }]);
    });
    assert.deepEqual(result.forecastPrices, []);
    tomorrowStatus = 503;
    await act(async () => {
      result.refetch();
    });
    assert.ok(result.tomorrowError);
    assert.equal(result.error, null);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});

test("shared clock ticks, updates on foreground and cleans up subscriptions", async (context) => {
  const React = require("react");
  const { act, create } = require("react-test-renderer");
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  hideRendererDeprecation(context);
  let now = new Date("2026-10-30T12:00:00Z");
  let tick;
  let appStateChange;
  let removed = false;
  let cleared = false;
  context.mock.method(globalThis, "setInterval", (callback) => {
    tick = callback;
    return 42;
  });
  context.mock.method(globalThis, "clearInterval", (timer) => {
    cleared = timer === 42;
  });
  const { useCurrentTime } = loadSource("hooks/useCurrentTime.ts", {
    "@/utils/dateUtils": { getCurrentTime: () => now },
    "react-native": {
      AppState: {
        addEventListener: (_event, callback) => {
          appStateChange = callback;
          return {
            remove: () => {
              removed = true;
            },
          };
        },
      },
    },
  });
  let result;
  function Probe() {
    result = useCurrentTime();
    return null;
  }
  let renderer;
  try {
    await act(async () => {
      renderer = create(React.createElement(Probe));
    });
    now = new Date("2026-10-30T12:15:00Z");
    await act(async () => tick());
    assert.equal(result, now);
    now = new Date("2026-10-31T12:15:00Z");
    await act(async () => appStateChange("active"));
    assert.equal(result, now);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
  assert.ok(removed);
  assert.ok(cleared);
});

test("font-loading errors unblock startup with system fonts", async (context) => {
  const React = require("react");
  const { act, create } = require("react-test-renderer");
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  hideRendererDeprecation(context);
  context.mock.method(console, "warn", () => {});
  const error = new Error("Font download failed");
  const { useAppFonts } = loadSource("hooks/useFonts.ts", {
    "@expo-google-fonts/roboto": {},
    "expo-font": { useFonts: () => [false, error] },
  });
  let ready;
  function Probe() {
    ready = useAppFonts();
    return null;
  }
  let renderer;
  try {
    await act(async () => {
      renderer = create(React.createElement(Probe));
    });
    assert.equal(ready, true);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});

test("edge tooltips stay inside the plot while arrows remain aligned and the chart reserves headroom", async (context) => {
  const React = require("react");
  const { act, create } = require("react-test-renderer");
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  hideRendererDeprecation(context);
  const native = {
    View: "View",
    Text: "Text",
    StyleSheet: { create: (styles) => styles },
    useWindowDimensions: () => ({ width: 390 }),
  };
  const { PriceTooltip } = loadSource("components/PriceTooltip.tsx", {
    "react-native": native,
  });
  const item = {
    value: 100,
    priceEntry: { SEK_per_kWh: 1, time_start: "2026-10-30T12:00:00Z" },
  };
  let renderer;
  try {
    await act(async () => {
      renderer = create(
        React.createElement(PriceTooltip, { item, barWidth: 8, leftOffset: 0 }),
      );
    });
    await act(async () => {
      renderer.root
        .findAllByType("View")[0]
        .props.onLayout({ nativeEvent: { layout: { width: 96 } } });
    });
    const shifts = () =>
      renderer.root
        .findAllByType("View")
        .filter((view) => Array.isArray(view.props.style))
        .map((view) => view.props.style[1].transform[0].translateX);
    assert.deepEqual(shifts(), [44, -44]);
    await act(async () => {
      renderer.update(
        React.createElement(PriceTooltip, { item, barWidth: 8, leftOffset: 9 }),
      );
    });
    assert.deepEqual(shifts(), [35, -35]);
    await act(async () => {
      renderer.update(
        React.createElement(PriceTooltip, {
          item,
          barWidth: 8,
          leftOffset: 100,
        }),
      );
    });
    assert.equal(shifts()[0], 0);
    await act(async () => {
      renderer.update(
        React.createElement(PriceTooltip, {
          item,
          barWidth: 8,
          leftOffset: 310,
          viewportWidth: 330,
        }),
      );
    });
    assert.deepEqual(shifts(), [-32, 32]);
    const { PriceChart } = loadSource("components/PriceChart.tsx", {
      "react-native": native,
      "react-native-gifted-charts": { BarChart: "BarChart" },
      "@/components/PriceTooltip": { PriceTooltip },
    });
    await act(async () => {
      renderer.update(
        React.createElement(PriceChart, { data: [], colorScheme: "light" }),
      );
    });
    const chart = renderer.root.findByType("BarChart");
    assert.equal(chart.props.initialSpacing, 0);
    assert.ok(chart.props.yAxisExtraHeight >= 80);
    assert.ok(chart.props.autoCenterTooltip);
    chart.props.onScroll({ nativeEvent: { contentOffset: { x: 900 } } });
    const scrolledTooltip = chart.props.renderTooltip(item, 100);
    assert.equal(scrolledTooltip.props.leftOffset, 0);
    assert.equal(scrolledTooltip.props.viewportWidth, 330);
  } finally {
    if (renderer) await act(async () => renderer.unmount());
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
