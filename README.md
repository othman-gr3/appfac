# AppFac — Invoice Management App

A React JS invoice management application for school, built with Firebase Realtime Database, JSON Server, Material UI, and Recharts.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React JS (Vite) | Frontend framework |
| Material UI v9 | UI components |
| Firebase Realtime DB | Store clients + factures |
| Firebase Auth | User authentication |
| JSON Server | Local REST API for articles/categories |
| Recharts | Monthly CA chart |
| jsPDF | PDF generation (to be used) |
| React Router v7 | Client-side routing |

---

## 📁 Project Structure

```
src/
├── components/
│   └── AdminLayout.jsx       # Sidebar + nav wrapper for all admin pages
├── pages/
│   ├── LoginPage.jsx         # Login form (Firebase auth)
│   ├── AdminDashboard.jsx    # KPI cards + monthly chart
│   ├── ArticlesPage.jsx      # Articles CRUD (JSON Server)
│   ├── CategoriesPage.jsx    # Categories CRUD (JSON Server)
│   └── ValidationPage.jsx    # Approve/reject factures (Firebase)
├── services/
│   ├── firebaseService.js    # Firebase Realtime DB functions (clients + factures)
│   └── jsonService.js        # JSON Server API functions (articles + categories)
├── contexts/
│   └── AuthContext.jsx       # Firebase auth + role detection
├── utils/
│   └── constants.js          # STATUTS, TVA_RATES, VIREMENT_TYPES
├── routes/
│   └── ProtectedRoute.jsx    # Route guard (login + admin role)
└── App.jsx                   # Routing setup

db/
└── articles.json             # JSON Server database (articles + categories)
```

---

## ⚙️ Setup Instructions (for teammates)

### 1. Clone & Install

```bash
git clone https://github.com/othman-gr3/appfac.git
cd appfac
npm install
```

### 2. Firebase Config

Create a `.env` file at the root (ask Othmane for the values):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> ⚠️ `.env` is gitignored — you must create it manually.

**OR** the config is already hardcoded in `src/services/firebaseService.js` — no `.env` needed in that case.

### 3. Run the App

Open **two terminals**:

```bash
# Terminal 1 — React app
npm run dev
# → http://localhost:5173

# Terminal 2 — JSON Server (articles/categories)
npm run json-server
# → http://localhost:3001
```

---

## 🔐 Authentication

- Firebase Email/Password auth is enabled
- Role detection is email-based in `AuthContext.jsx`
- Add admin emails to the `ADMIN_EMAILS` array in `src/contexts/AuthContext.jsx`
- Non-admin users are redirected to `/unauthorized`

---

## 🔥 Firebase Realtime Database Structure

```
clients/
  {clientId}
    nom, email, tel, adresse

factures/
  {factureId}
    numero, date_creation, client_id, articles[], total_ht,
    tva, total_ttc, statut, date_depot, date_encaissement,
    type_virement, validated_by_admin
```

---

## 📦 JSON Server Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /articles | Get all articles |
| POST | /articles | Create article |
| PUT | /articles/:id | Update article |
| DELETE | /articles/:id | Delete article |
| GET | /categories | Get all categories |
| POST | /categories | Create category |
| PUT | /categories/:id | Update category |
| DELETE | /categories/:id | Delete category |

---

## 📊 Shared Constants (`src/utils/constants.js`)

```js
STATUTS: en_attente | payee | rejetee
TVA_RATES: informatique 20%, services 10%, formation 0%
VIREMENT_TYPES: ["Virement bancaire", "Chèque", "Espèces"]
```

---

## ✅ Completed Tasks (Othmane - Admin)

- [x] Task 1 — Repo setup (Vite + all packages + GitHub)
- [x] Task 2 — Firebase setup (Realtime DB + Auth + firebaseService.js)
- [x] Task 3 — JSON Server (articles.json + categories.json + jsonService.js)
- [x] Task 4 — Constants file (STATUTS, TVA_RATES, VIREMENT_TYPES)
- [x] Task 5 — Auth & Login (Firebase auth, AuthContext, ProtectedRoute, login page)
- [x] Task 6 — Admin CRUD (Articles + Categories pages + AdminLayout sidebar)
- [x] Task 7 — Invoice validation (approve/reject → updates Firebase statut + validated_by_admin)
- [x] Task 8 — Admin dashboard (KPI cards + monthly CA bar chart)

---

## 👥 Team

| Member | Role |
|--------|------|
| Othmane | Admin side + Infrastructure |
| Teammate | Client/User side |
