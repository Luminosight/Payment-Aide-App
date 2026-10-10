# Payment Aide

A mobile financial tracker app built with Expo, React Native, and TypeScript. Track monthly installments across multiple billers and users, with a swipeable card dashboard and per-month breakdowns.

## Features

- **Swipeable Dashboard** — Horizontal card carousel showing each biller's monthly total, "mine" vs "others" breakdown
- **Installment Tracking** — Add installments with description, amount, duration (1–12 months), start month, and assigned user
- **Multi-User Support** — Track payments for yourself and others (e.g. family members)
- **Multi-Biller Support** — Manage billers like Shopee, TikTok Shop, BDO, etc. with custom due dates
- **Monthly Navigation** — Browse past and future months to see projected totals
- **Summary View** — Aggregated breakdowns by platform and by person
- **Persistent Storage** — All data saved with AsyncStorage

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/go) app on your Android device

### Install & Run

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your Android device.

## Tech Stack

- [Expo](https://expo.dev/) SDK 52
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based routing
- [React Navigation Drawer](https://reactnavigation.org/docs/drawer-navigator/) — hamburger menu navigation
- [React Native](https://reactnative.dev/) 0.76
- [TypeScript](https://www.typescriptlang.org/) 5
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — persistent data
- [@expo/vector-icons](https://docs.expo.dev/guides/icons/) — Ionicons icons

## Project Structure

```
app/
  _layout.tsx             # Root layout with Drawer navigator
  index.tsx               # Dashboard screen (swipeable cards + add button)
  summary.tsx             # Summary screen (totals by platform & person)
  users.tsx               # Manage Users screen (CRUD)
  billers.tsx             # Manage Billers screen (CRUD)
src/
  types/index.ts          # TypeScript interfaces
  context/AppContext.tsx   # Global state (useReducer + Context + AsyncStorage)
  utils/
    formatters.ts         # Currency, month, ID formatting
    calculations.ts       # Aggregation & summary helpers
  components/
    Toast.tsx             # Toast notification container
    Dashboard/
      SwipeableCards.tsx   # Horizontal FlatList card carousel
      BillerCard.tsx       # Per-biller summary card
      EmptyState.tsx       # Empty state placeholder
    Installment/
      AddInstallmentModal.tsx  # Bottom sheet form for new installments
      MonthSelector.tsx        # Start-month picker (3 options)
```
