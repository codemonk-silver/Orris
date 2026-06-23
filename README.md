# ORRIS Atelier Digital Flagship

An ultra-premium, high-craftsmanship digital flagship atelier specializing in architectural curiosities, Swiss-precision horology, and private fragrance reserves. This application utilizes a clean, modern, single-page client interface paired with a high-performance Express server-side backend.

---

## 🏗️ Clean Project Architecture

The codebase strictly adheres to modular design patterns, separating data, state management, client UI components, and API execution pathways:

```
├── data-store/            # Permanent server-local database storage
│   └── credentials.json   # Securely salted client password hashes
├── server.ts              # Full-stack integration entry point (Express & Vite dev middleware)
├── src/
│   ├── App.tsx            # Main application coordinate controller & auth portal triggers
│   ├── types.ts           # Unified data models, orders, products, and curation schemas
│   ├── mockData.ts        # Fully structured curated inventory & seed metrics
│   ├── store/
│   │   └── useAppStore.ts # Central Zustand state-store for unified client context
│   └── components/        # Isolated, single-responsibility UI modules
│       ├── Helmet.tsx     # Custom SEO coordinate manager (title, description, canonical link)
│       ├── Shop.tsx       # Dynamic retail gallery featuring advanced filters & multi-axial sorting
│       ├── Navbar.tsx     # Polished menu drawer & interactive user utilities
│       ├── Homepage.tsx   # Premium brand statement, editorial showcases, and curations
│       ├── CartDrawer.tsx # Interactive cart panel with real-time tax calculation
│       ├── OrderTracker.ts# Transaction tracking console for customer acquisitions
│       └── ...About/Contact/Profile/Admin dashboards
```

---

## 🛡️ Core Infrastructure & Capabilities

### 1. Robust Password Recovery & Calibration
Integrated a cryptographic client recovery handshake:
* **Endpoint (`/api/auth/forgot-password`)**: Validates dossiers under the specified client email, triggers an active 6-digit confirmation certificate token, and secures validity for `15 minutes`.
* **Delivery Engine**: If SMTP configuration is active, dispatches an elegant editorial HTML certificate; otherwise, outputs the code securely to simulation logs with pre-filled inputs for effortless QA audits.
* **Endpoint (`/api/auth/reset-password`)**: Accepts the verification token, validates expiry/correctness, hashes the refined password (`SHA-256`), and securely registers credentials.

### 2. Multi-axial Filtering & Dynamic Sorting
Designed custom controls inside the `Shop` drawer component powered by the Zustand store:
* Fully supports sorting by **Price: Low to High**, **Price: High to Low**, and **Newest Arrivals** (via product creation timestamp comparison).
* Stateful parameters sync with the client session, ensuring filters and search queries maintain alignment.
* Real-time search indexing and categorization.

### 3. Elegant SEO Optimization (`Helmet` Integration)
Built a fast, standard, React compliant `<Helmet>` metadata injecter in `src/components/Helmet.tsx`:
* Dynamically updates the browser's document title, description tag, and canonical link attributes.
* Ensures pristine transition states as the user navigate across **Homepage, Collections, Spec-sheets, Acquisition Gateway (Checkout), and Admin Command Chambers**.
* Prevents layout shifts or blank titles during fast component mounting.

---

## 🚀 Environment Verification

Initialize development servers and verify code validation:

```bash
# 1. Verification of syntax & type safety
npm run lint

# 2. Production build compilation
npm run build

# 3. Spin up full-stack Express server (Port 3000)
npm run dev
```
