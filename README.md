<div align="center">

# 🧾 AppFac — Application de Gestion de Factures

**Mini-projet scolaire · React JS · Firebase · Material UI**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?style=flat&logo=firebase&logoColor=black)
![MUI](https://img.shields.io/badge/Material_UI-v5-007FFF?style=flat&logo=mui&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![jsPDF](https://img.shields.io/badge/jsPDF-PDF_Generation-E74C3C?style=flat)

</div>

---

## 📖 Présentation

**AppFac** est une application web complète de gestion de factures construite avec React JS. Elle permet à des utilisateurs de créer et suivre leurs factures, et à un administrateur de les valider.

### Fonctionnalités principales

| Rôle | Fonctionnalités |
|------|----------------|
| 👤 **Utilisateur** | Créer des factures · Gérer ses clients · Suivre les paiements · Télécharger en PDF |
| 🛡️ **Admin** | Valider/rejeter les factures · Gérer le catalogue articles · Consulter les KPIs |

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **React 18** | Interface utilisateur (SPA) |
| **Material UI v5** | Composants graphiques |
| **Firebase Realtime Database** | Stockage clients + factures |
| **Firebase Authentication** | Connexion + gestion des rôles |
| **JSON Server** | Catalogue articles + catégories |
| **jsPDF + jspdf-autotable** | Génération de PDF |
| **Formik + Yup** | Formulaires + validation |
| **React Router v6** | Navigation entre pages |
| **Axios** | Requêtes HTTP vers JSON Server |
| **Vite** | Build tool & dev server |

---

## 📁 Structure du projet

```
appFac/
├── src/
│   ├── components/
│   │   ├── AdminLayout.jsx       # Layout admin (sidebar + contenu)
│   │   └── UserLayout.jsx        # Layout utilisateur (sidebar + contenu)
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx         # Page de connexion
│   │   ├── UserDashboard.jsx     # Dashboard utilisateur (KPIs)
│   │   ├── ClientsPage.jsx       # Gestion CRUD des clients
│   │   ├── InvoiceForm.jsx       # Formulaire de création de facture
│   │   ├── InvoiceListPage.jsx   # Historique des factures (filtres + recherche)
│   │   ├── InvoiceDetailPage.jsx # Détail facture + suivi paiement
│   │   ├── AdminDashboard.jsx    # Dashboard admin
│   │   ├── ArticlesPage.jsx      # Gestion articles (admin)
│   │   ├── CategoriesPage.jsx    # Gestion catégories (admin)
│   │   └── ValidationPage.jsx    # Validation des factures (admin)
│   │
│   ├── services/
│   │   ├── firebaseService.js    # CRUD Firebase (clients + factures)
│   │   └── jsonService.js        # API JSON Server (articles + catégories)
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx       # Contexte global : user connecté + rôle
│   │
│   ├── routes/
│   │   └── ProtectedRoute.jsx    # Guard pour routes protégées
│   │
│   ├── utils/
│   │   ├── constants.js          # STATUTS, TVA_RATES, VIREMENT_TYPES
│   │   └── generateInvoicePDF.js # Génération PDF professionnelle
│   │
│   └── App.jsx                   # Routeur principal
│
├── db/
│   └── articles.json             # Données JSON Server
│
├── documentation_appfac.md       # Documentation complète du projet
└── package.json
```

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js ≥ 18
- npm ≥ 9
- Un projet Firebase actif

### 1. Cloner le dépôt
```bash
git clone https://github.com/othman-gr3/appfac.git
cd appfac
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer Firebase

Créer un fichier `.env` à la racine :
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
```

### 4. Lancer l'application

Dans deux terminaux séparés :

```bash
# Terminal 1 — Serveur de développement React
npm run dev

# Terminal 2 — JSON Server (articles & catégories)
npm run json-server
```

L'application est disponible sur **http://localhost:5173**  
JSON Server tourne sur **http://localhost:3001**

---

## 👥 Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@test.com` | *(voir prof)* | 🛡️ Admin |
| `user@test.com` | *(voir prof)* | 👤 Utilisateur |

---

## 🗂️ Base de données Firebase

### Structure `clients/`
```json
{
  "-ABC123": {
    "nom": "Société Alpha",
    "email": "contact@alpha.ma",
    "tel": "0612345678",
    "adresse": "12 rue des Fleurs, Casablanca"
  }
}
```

### Structure `factures/`
```json
{
  "-XYZ789": {
    "numero": "FAC-20260421-042",
    "date_creation": "2026-04-21",
    "client_id": "-ABC123",
    "articles": [...],
    "methode_facturation": "1",
    "total_ht": 1600,
    "tva": 320,
    "total_ttc": 1920,
    "statut": "en_attente",
    "date_depot": null,
    "date_encaissement": null,
    "type_virement": null,
    "validated_by_admin": null,
    "created_by": "uid-utilisateur"
  }
}
```

---

## 📊 Les 4 méthodes de facturation

| # | Méthode | Description |
|---|---------|-------------|
| **1** | HT + TVA simple | TVA fixe par type d'article (20% info, 10% services, 0% formation) |
| **2** | Remise par ligne | Une remise `%` individuelle par article avant application de la TVA |
| **3** | Remise globale | Une remise `%` unique appliquée sur le total HT |
| **4** | TVA par catégorie | Chaque article applique explicitement le taux TVA de sa catégorie |

### Taux TVA
```
informatique → 20%
services     → 10%
formation    →  0%
```

---

## 📄 Génération PDF

Le PDF est généré **entièrement dans le navigateur** via `jsPDF` + `jspdf-autotable`, sans aucun serveur.

**Structure du PDF :**
- 🟢 Barre d'accent verte (haut & bas)
- 📋 En-tête : société + numéro de facture + statut coloré
- 👥 Deux colonnes : émetteur | client facturé
- 📊 Tableau articles (alternance de lignes, colonne totaux en gras)
- 💰 Bloc totaux : HT / TVA / **TTC fond vert**
- 💳 Informations de paiement
- ✍️ Zones de signature (émetteur + client)
- 📝 Mentions légales
- 🔲 Footer avec référence et numérotation

---

## 🔐 Authentification & Rôles

```
Connexion Firebase Auth
        │
        ▼
Email dans ADMIN_EMAILS ?
    ├── Oui → rôle "admin" → /admin
    └── Non → rôle "user"  → /user
```

- **ProtectedRoute** : redirige vers `/login` si non connecté
- **adminOnly** : redirige vers `/unauthorized` si l'utilisateur n'est pas admin
- **Isolation des données** : chaque facture contient `created_by = uid`, les utilisateurs ne voient que leurs propres factures

---

## 📱 Pages de l'application

### Espace Utilisateur

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/user` | 5 KPIs + 5 dernières factures |
| Clients | `/user/clients` | CRUD clients (drawer slide-in) |
| Nouvelle facture | `/user/nouvelle-facture` | Formulaire avec 4 méthodes de facturation |
| Mes factures | `/user/factures` | Tableau filtrable + recherche |
| Détail facture | `/user/factures/:id` | Détails + suivi paiement + PDF |

### Espace Admin

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/admin` | KPIs globaux + graphiques |
| Articles | `/admin/articles` | Gestion du catalogue |
| Catégories | `/admin/categories` | Gestion des catégories |
| Validation | `/admin/validation` | Valider / rejeter les factures |

---

## 👨‍💻 Équipe

| Membre | Rôle |
|--------|------|
| **Othmane** | Admin side · Firebase setup · Auth · Articles/Catégories · Validation |
| **Hiba** | User side · Clients · Factures · Paiement · Dashboard · PDF |

---

## 📚 Documentation

Une documentation détaillée expliquant toutes les technologies, l'architecture, les méthodes de facturation et les concepts React est disponible dans :

📄 [`documentation_appfac.md`](./documentation_appfac.md)

---

<div align="center">
  <sub>Mini-projet scolaire · AppFac · 2026</sub>
</div>
