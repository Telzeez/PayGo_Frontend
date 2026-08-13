# PayGo (SPM) - Frontend Application

> **Next.js Progressive Web Application (PWA) for Pay-As-You-Go (PayGo) Solar Energy & Local Energy Marketplace**

PayGo is a state-of-the-art Web & PWA interface designed to provide seamless solar energy top-ups, a location-aware local energy marketplace, real-time hardware meter monitoring, transaction audit history, offline recovery token delivery, and full account management.

---

## 🚀 Key Features

### 1. ⚡ Instant Pay-As-You-Go Energy Top-Ups
- **Paystack Integration**: Direct payment initiation via NGN currency top-ups.
- **Automated Payment Verification**: Real-time polling verification page (`/verify`) with non-alarmist status banners and automatic meter credit confirmation.
- **Dynamic kWh Calculation**: Live preview of energy units credited based on current tariff rates (e.g., ₦200/kWh).

### 2. 📍 Local Energy Marketplace
- **Location-Aware Matching Engine**: Haversine geographical distance calculations ($0\text{m}$ to $5\text{km}$ radius) matching eligible nearby solar energy sellers.
- **Buyer "Find Energy" Experience (`/marketplace`)**: GPS location permission prompt, radius search controls (`200m`, `500m`, `1km`, `2km`, `5km`), distance pills (`📍 180m away`), meter status (`🟢 ONLINE`), and **Purchase Confirmation Drawer** displaying Seller Name, Distance, Energy Units, Tariff Rate (₦/kWh), and Total Amount before Paystack checkout.
- **Seller Portal ("My Energy") (`/marketplace/seller`)**: Register solar generation sources (assigned meter, latitude/longitude, service radius), publish available kWh listings, set tariffs, and toggle listing status (`ACTIVE` / `PAUSED`).
- **Concurrency & Idempotency Protection**: Server-side distance recalculation, `reserved_kwh` energy reservation locking, unique `purchase_reference` idempotency keys, and automated 15-minute stale reservation expiry.

### 3. 📊 Real-Time Hardware Balance & Meter Monitoring
- **Live 5-Second Balance Sync**: Real-time background polling updates customer and admin dashboards automatically as physical solar meters report consumption over MQTT.
- **Hardware Connectivity Status**: Visual indicators (`🟢 Meter Online` / `⚪ Meter Offline`) with timestamped "last seen" tracking.

### 4. 🔑 Offline Fallback Token System
- **16-Digit Keypad Credentials**: Automatically generates and dispatches fallback recovery tokens when meters are offline or unreachable over GSM/cellular networks.
- **Interactive Keypad Tester**: Built-in 16-digit keypad simulator on the Recovery Tokens page (`/tokens`) to test offline code redemption.

### 5. 📜 Ledger & Audit History
- **Categorized Transactions**: Filterable history (`All`, `Top-ups`, `Consumption`, `Confirmed`, `Pending`, `Failed`).
- **Audit Detail Drawer**: Clickable modal displaying payment reference IDs, kWh credited/consumed, payment amount, and hardware delivery status.

### 6. 👤 Self-Service Account & Profile Management
- **Profile Editing**: Live modal to configure contact phone numbers (essential for receiving SMS recovery tokens), update email addresses, or change passwords.
- **Session Management**: Persistent JWT authentication stored in browser `localStorage` (`paygo_token`) with role-based routing (`BUYER` / Customer vs `OWNER` / Admin).

### 7. 🛠️ Owner / Admin Overview Dashboard
- **Meter Registry & Connection State**: High-level telemetry monitoring for all registered hardware devices.
- **Pending Credit Queues & ACK Alerts**: Flags offline meters with pending credit balance queues requiring synchronization.

### 8. 📱 Progressive Web App (PWA) & Responsive UX
- **Mobile-First Glassmorphic Design**: 6-item bottom navigation bar for mobile devices, top navigation tabs for desktop displays.
- **Universal "← Back" Navigation**: Intuitive navigation hierarchy following "Don't Make Me Think" usability principles.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Client & Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS Glassmorphism
- **Icons**: Lucide Inline SVG Icons
- **State Management**: React Context API (`AuthContext`), Local Storage persistence
- **API Client**: Fetch-based modular API layer with automatic Bearer token injection

---

## 📁 Directory Structure

```text
frontend/
├── public/
│   ├── logo.png               # PayGo Brand Mark
│   └── manifest.json          # PWA Web App Manifest
├── src/
│   ├── app/
│   │   ├── (customer)/        # Customer Route Group (Protected)
│   │   │   ├── dashboard/     # Customer Dashboard & Live kWh Balance
│   │   │   ├── marketplace/   # Buyer "Find Energy" & Distance Matching
│   │   │   │   └── seller/    # Seller Portal ("My Energy" & Listings)
│   │   │   ├── profile/       # Profile Settings & Account Editing
│   │   │   ├── recharge/      # Payment Amount & Paystack Checkout
│   │   │   ├── tokens/        # 16-Digit Offline Recovery Tokens
│   │   │   ├── transactions/  # Ledger History & Detail Drawer
│   │   │   └── verify/        # Paystack Callback Verification
│   │   ├── (public)/          # Public Route Group
│   │   │   ├── login/         # Sign In & Registration Tabs
│   │   │   └── register/      # Dedicated Account Registration
│   │   ├── admin/             # Owner / Admin Hardware Dashboard
│   │   ├── layout.tsx         # Root Layout & Auth Provider Wrap
│   │   └── page.tsx           # Entry Point Redirection
│   ├── components/
│   │   ├── auth/              # Route Guards (ProtectedRoute)
│   │   └── layout/            # App Shell & Navigation (AppShell.tsx)
│   └── lib/
│       ├── api/               # API Route Handlers (auth, devices, marketplace, payment)
│       ├── contexts/          # React Contexts (AuthContext.tsx)
│       └── types/             # TypeScript Domain Model Interfaces
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 2. Environment Configuration
Create a `.env.local` file in the `frontend` root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Installation
Install project dependencies:

```bash
npm install
```

### 4. Running Development Server
Start the Next.js development server:

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### 5. Production Build
Build and optimize the application for production:

```bash
npm run build
npm run start
```

---

## 🔗 Related Resources

- **Backend API Server**: Node.js, Express, PostgreSQL, MQTT Broker ([`../backend`](file:///c:/Users/Telzeez/Desktop/SolarPayMe(SPM)/backend))
- **System Documentation**: Specifications located in [`../files/`](file:///c:/Users/Telzeez/Desktop/SolarPayMe(SPM)/files)
