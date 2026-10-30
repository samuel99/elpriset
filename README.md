# Elpriset 👋

Appen visar kvartspriser på el från Nordpool med hjälp av det öppna APIet från https://www.elprisetjustnu.se/. Priserna inkluderar inte moms eller andra hittepå-avgifter.

Den här appen har inga annonser och ingen tracking what so ever. Du kan välja ditt elprisområde, färgtema och om grafen ska visa prognospriser (beta).

När morgondagens priser är tillgängliga ser du dem i samma vy som dagens, inga tabbar eller annat jobbigt. Bara datan. Snabbt.

Prognoser hämtas från https://wolta.se/ för valt elprisområde och visas med egen färg i grafen. Publicerade priser har alltid företräde. Prognoser är uppskattningar, inte publicerade elpriser. Funktionen är avstängd från början och valet sparas mellan appstarter.

Datum och klockslag följer svensk marknadstid (`Europe/Stockholm`), oavsett enhetens tidszon. Grafen behåller tomma tidsintervall när priser saknas. Priser hämtas på nytt varje kvart och tidsmarkeringen uppdateras var 30:e sekund samt när appen blir aktiv.

# Privacy policy

Ingen tracking. Inga annonser. Ingen känslig data.

Bygg projektet med `eas build --platform android`.

# Generell info om appen på engelska:

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Configuration

Use `.env.example` as the reference for local `.env` configuration. EAS build environments need the same public variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Published-price API base URL | `https://www.elprisetjustnu.se/api/v1` |
| `EXPO_PUBLIC_API_URL_FORECAST` | Forecast endpoint; the app adds `?zone=SE1` through `SE4` | `https://wolta.se/api/v1/prices/forecast` |
| `EXPO_PUBLIC_API_TIMEOUT` | Request timeout in milliseconds, including the response body | `5000` |

`EXPO_PUBLIC_` values are included in the app bundle and must not contain secrets. `EXPO_PUBLIC_API_RETRY_ATTEMPTS` is no longer used and can be removed from local/EAS environments.

## Project Structure

- `app/`: Expo Router screens and layouts.
- `components/`: Themed primitives, price chart/tooltip/rows, and shared settings options.
- `hooks/`: Screen data, shared clock, and preference subscriptions.
- `services/`: Cancellable HTTP requests and validated API responses.
- `utils/`: Market-time calculations, pure chart transformations, and persistent preference stores.
- `constants/`: Colors, typography, navigation themes, and price-area definitions.
- `types/`: Shared data and presentation contracts.

Saved setting keys remain `selected_price_area`, `app_theme_mode`, and `show_price_forecast`; existing installations require no migration.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

Tests use Node's test runner with the project's TypeScript compiler and a React-version-matched test renderer. They cover Swedish market dates and DST, API validation and cancellation, request races, saved preferences, clock updates, forecast priority, chart gaps, and font-loading failure.
