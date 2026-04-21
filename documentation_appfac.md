# 📋 Documentation Complète — AppFac
### Application de gestion de factures · Mini-projet scolaire

---

## 🗂️ Table des matières

1. [C'est quoi ce projet ?](#1-cest-quoi-ce-projet-)
2. [Les technologies utilisées](#2-les-technologies-utilisées)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Authentification et rôles](#4-authentification-et-rôles)
5. [Base de données Firebase](#5-base-de-données-firebase)
6. [Les services (comment on parle aux bases de données)](#6-les-services)
7. [Les pages de l'utilisateur (Hiba)](#7-les-pages-utilisateur)
8. [Les 4 méthodes de facturation](#8-les-4-méthodes-de-facturation)
9. [Génération PDF](#9-génération-pdf)
10. [Les pages admin (Othmane)](#10-les-pages-admin)
11. [Concepts React expliqués simplement](#11-concepts-react-expliqués-simplement)
12. [Questions fréquentes du prof](#12-questions-fréquentes-du-prof)

---

## 1. C'est quoi ce projet ?

**AppFac** est une application web de gestion de factures. Elle permet à :

- Un **utilisateur normal** (employé) de :
  - Créer des factures pour des clients
  - Choisir des articles depuis un catalogue
  - Suivre le paiement de ses factures
  - Télécharger ses factures en PDF

- Un **administrateur** de :
  - Voir toutes les factures soumises
  - Valider ou rejeter les factures
  - Gérer le catalogue d'articles et de catégories
  - Consulter un tableau de bord avec des statistiques

> **Analogie simple :** C'est comme une application de comptabilité légère. Un vendeur fait sa facture, la soumet, et le responsable la valide.

---

## 2. Les technologies utilisées

### 🟦 React JS
**C'est quoi ?** Une bibliothèque JavaScript pour créer des interfaces web.  
**Pourquoi ?** Au lieu de recharger toute la page à chaque action, React met à jour uniquement ce qui change. C'est rapide et moderne.  
**Exemple dans notre projet :** Quand on filtre les factures par statut, la liste se met à jour instantanément sans recharger la page.

### 🎨 Material UI (MUI)
**C'est quoi ?** Une bibliothèque de composants graphiques prêts à l'emploi (boutons, tableaux, formulaires, etc.) qui suivent le design Google.  
**Pourquoi ?** On n'a pas besoin d'écrire le CSS de zéro. On utilise des composants comme `<Button>`, `<Table>`, `<Drawer>` directement.  
**Exemple :** Le sidebar noir avec les icônes, les chips de statut colorés — tout ça c'est MUI.

### 🔥 Firebase Realtime Database
**C'est quoi ?** Une base de données en ligne (hébergée par Google) qui synchronise les données en temps réel.  
**Pourquoi ?** On peut stocker des clients et des factures sans avoir besoin de créer un serveur backend. Firebase gère tout.  
**Exemple :** Quand on crée une facture, elle est immédiatement sauvegardée dans Firebase et visible par l'admin.

### 🔐 Firebase Authentication
**C'est quoi ?** Le système de connexion de Firebase. Il gère les emails et mots de passe des utilisateurs.  
**Pourquoi ?** On n'a pas besoin de créer un système de login de zéro. Firebase gère la sécurité.  
**Exemple :** Quand on tape l'email et le mot de passe sur la page de connexion, Firebase vérifie si c'est correct.

### 📦 JSON Server
**C'est quoi ?** Un faux serveur API qui lit un fichier JSON et le sert comme une vraie API REST.  
**Pourquoi ?** Pour le catalogue d'articles et de catégories, on n'a pas besoin d'une vraie base de données. JSON Server simule un serveur et répond aux requêtes.  
**Exemple :** Quand on veut la liste des articles, on fait une requête à `http://localhost:3001/articles` et JSON Server retourne les données du fichier `db/articles.json`.

### 📄 jsPDF + jspdf-autotable
**C'est quoi ?** Des bibliothèques JavaScript pour générer des fichiers PDF directement dans le navigateur.  
**Pourquoi ?** L'utilisateur peut télécharger sa facture en PDF sans envoyer les données à un serveur.  
**Exemple :** Le bouton "Télécharger PDF" crée un PDF complet (avec tableau des articles, totaux, signature) et le télécharge directement.

### 📝 Formik + Yup
**C'est quoi ?**
- **Formik** gère l'état d'un formulaire (valeurs, soumission, erreurs).
- **Yup** définit les règles de validation (champ obligatoire, format email, etc.).

**Pourquoi ?** Sans Formik, gérer un formulaire avec validation serait très compliqué à écrire à la main.  
**Exemple :** Dans le formulaire client, si on laisse le champ "Email" vide, Yup affiche "L'email est requis" en rouge automatiquement.

---

## 3. Architecture du projet

```
appFac/
├── src/
│   ├── components/          ← Composants réutilisables (layouts)
│   │   ├── AdminLayout.jsx  ← Sidebar + contenu pour l'admin
│   │   └── UserLayout.jsx   ← Sidebar + contenu pour l'utilisateur
│   │
│   ├── pages/               ← Une page = une URL
│   │   ├── LoginPage.jsx          ← /login
│   │   ├── UserDashboard.jsx      ← /user  (tableau de bord)
│   │   ├── ClientsPage.jsx        ← /user/clients
│   │   ├── InvoiceForm.jsx        ← /user/nouvelle-facture
│   │   ├── InvoiceListPage.jsx    ← /user/factures
│   │   ├── InvoiceDetailPage.jsx  ← /user/factures/:id
│   │   ├── AdminDashboard.jsx     ← /admin
│   │   ├── ArticlesPage.jsx       ← /admin/articles
│   │   ├── CategoriesPage.jsx     ← /admin/categories
│   │   └── ValidationPage.jsx     ← /admin/validation
│   │
│   ├── services/            ← Communication avec les APIs
│   │   ├── firebaseService.js  ← Firebase (clients + factures)
│   │   └── jsonService.js      ← JSON Server (articles + catégories)
│   │
│   ├── contexts/            ← État global partagé
│   │   └── AuthContext.jsx     ← Utilisateur connecté + son rôle
│   │
│   ├── routes/              ← Gestion des accès
│   │   └── ProtectedRoute.jsx  ← Bloque les pages non autorisées
│   │
│   ├── utils/               ← Fonctions utilitaires
│   │   ├── constants.js        ← Statuts, TVA, types de virement
│   │   └── generateInvoicePDF.js ← Génération PDF
│   │
│   └── App.jsx              ← Définit toutes les routes (URLs)
│
├── db/
│   └── articles.json        ← Données pour JSON Server
│
└── package.json             ← Liste des dépendances du projet
```

---

## 4. Authentification et rôles

### Comment fonctionne la connexion ?

1. L'utilisateur tape son email + mot de passe sur `/login`
2. Firebase vérifie les informations
3. Si c'est correct, Firebase retourne un objet "user" avec un `uid` (identifiant unique)
4. **Le rôle** est déterminé par l'email : si l'email est dans la liste `ADMIN_EMAILS`, c'est un admin, sinon c'est un utilisateur normal

```javascript
// AuthContext.jsx
const ADMIN_EMAILS = ["admin@appfac.com", "othman@appfac.com"];
const role = ADMIN_EMAILS.includes(user.email) ? "admin" : "user";
```

5. Après connexion :
   - Admin → redirigé vers `/admin`
   - User → redirigé vers `/user`

### Le ProtectedRoute — C'est quoi ?

C'est un "garde-barrière". Quand on essaie d'accéder à une page protégée, il vérifie d'abord :
- Est-ce que l'utilisateur est connecté ? Sinon → redirigé vers `/login`
- Si la page est réservée aux admins, est-ce bien un admin ? Sinon → redirigé vers `/unauthorized`

```javascript
// ProtectedRoute.jsx
if (!currentUser) return <Navigate to="/login" />;
if (adminOnly && userRole !== "admin") return <Navigate to="/unauthorized" />;
return children; // ← Accès autorisé, on affiche la page
```

### Le Context — C'est quoi ?

`AuthContext` est une façon de partager des données entre tous les composants sans passer des `props` à chaque fois.
N'importe quelle page peut faire `useAuth()` pour obtenir l'utilisateur connecté et son rôle.

---

## 5. Base de données Firebase

### Structure des données

Firebase Realtime Database stocke tout en JSON (comme un grand objet JavaScript).

#### Nœud `clients/`
```json
{
  "clients": {
    "-ABC123": {
      "nom": "Société Alpha",
      "email": "contact@alpha.ma",
      "tel": "0612345678",
      "adresse": "12 rue des Fleurs, Casablanca"
    }
  }
}
```

#### Nœud `factures/`
```json
{
  "factures": {
    "-XYZ789": {
      "numero": "FAC-20260421-042",
      "date_creation": "2026-04-21",
      "client_id": "-ABC123",
      "articles": [
        {
          "article_id": "1",
          "nom": "Laptop Dell",
          "prix_ht": 800,
          "tva_type": "informatique",
          "quantite": 2
        }
      ],
      "methode_facturation": "1",
      "total_ht": 1600,
      "tva": 320,
      "total_ttc": 1920,
      "statut": "en_attente",
      "date_depot": null,
      "date_encaissement": null,
      "type_virement": null,
      "validated_by_admin": null,
      "created_by": "uid-de-l-utilisateur"
    }
  }
}
```

### Pourquoi `created_by` ?
Chaque facture enregistre l'UID de celui qui l'a créée. Ainsi, quand un utilisateur voit "Mes factures", on filtre uniquement les factures où `created_by === currentUser.uid`. Chaque utilisateur ne voit que ses propres données.

---

## 6. Les services

### firebaseService.js — Communication avec Firebase

Ce fichier contient toutes les fonctions pour lire/écrire dans Firebase. On ne touche jamais directement à la base de données depuis les pages — on passe toujours par ces fonctions.

```javascript
// Lire tous les clients
export const getClients = async () => { ... }

// Ajouter un client
export const addClient = async (clientData) => { ... }

// Modifier un client
export const updateClient = async (clientId, data) => { ... }

// Supprimer un client
export const deleteClient = async (clientId) => { ... }
```

**Pourquoi séparer les services ?** Si demain on change de base de données, on modifie seulement ce fichier. Les pages restent inchangées. C'est le principe de **séparation des responsabilités**.

### jsonService.js — Communication avec JSON Server

Même principe mais pour les articles et catégories (stockés dans `db/articles.json`).

```javascript
export const getArticles = async () => { ... }
export const getCategories = async () => { ... }
```

JSON Server tourne sur `http://localhost:3001`. On utilise **Axios** (une bibliothèque pour faire des requêtes HTTP) pour communiquer avec lui.

---

## 7. Les pages utilisateur

### 7.1 Dashboard (`/user`)

**Ce qu'il fait :** Affiche 5 cartes KPI (indicateurs clés) et les 5 dernières factures.

**Comment il calcule les KPIs :**
1. Il charge toutes les factures de Firebase
2. Il filtre celles créées par l'utilisateur connecté (`created_by === uid`)
3. Il compte : total, en attente, payées, rejetées
4. Il additionne les `total_ttc` pour le montant total

### 7.2 Page Clients (`/user/clients`)

**Ce qu'elle fait :** Affiche la liste des clients dans un tableau. On peut ajouter, modifier, supprimer.

**Le Drawer :** Au lieu d'ouvrir une nouvelle page pour le formulaire, on utilise un "drawer" (panneau qui glisse depuis la droite). C'est plus fluide pour l'utilisateur.

**Validation avec Yup :**
```javascript
const clientSchema = Yup.object({
  nom:     Yup.string().required("Le nom est requis"),
  email:   Yup.string().email("Email invalide").required(),
  tel:     Yup.string().matches(/^[0-9+\s\-]{7,15}$/, "Numéro invalide"),
  adresse: Yup.string().required()
});
```
Yup vérifie les règles AVANT d'envoyer les données à Firebase. Si une règle est violée, Formik affiche le message d'erreur sous le champ.

### 7.3 Formulaire de facture (`/user/nouvelle-facture`)

**Ce qu'il fait :** Permet de créer une facture en 3 sections dans une seule page :

1. **Informations générales** : Numéro auto-généré, date, choix du client
2. **Méthode de facturation** : 4 boutons toggle pour choisir la méthode
3. **Lignes d'articles** : Autocomplete pour chercher les articles + quantité + (remise selon la méthode)

**Numéro auto-généré :**
```javascript
const generateNumero = () => {
  // Format : FAC-20260421-042
  return `FAC-${annee}${mois}${jour}-${nombreAleatoire}`;
};
```

**Autocomplete :** Le champ article propose des suggestions pendant qu'on tape. Les articles viennent de JSON Server.

**Les totaux sont recalculés en temps réel** à chaque changement (article, quantité, remise). C'est possible grâce à `useMemo`.

### 7.4 Historique des factures (`/user/factures`)

**Ce qu'elle fait :** Tableau de toutes ses factures avec filtres et recherche.

**Filtre par statut :** Des chips cliquables (Toutes / En attente / Payée / Rejetée). Quand on clique, on change un état `statutFilter`, et `useMemo` recalcule la liste filtrée.

**Recherche :** Un champ texte filtre par nom de client ou numéro de facture en temps réel (sans requête réseau — tout est déjà chargé en mémoire).

**Résolution des noms de clients :**
- Firebase stocke seulement le `client_id` dans la facture (pas le nom)
- On charge aussi tous les clients et on crée un dictionnaire `{ id → client }`
- Quand on affiche une ligne : `clientMap[facture.client_id]?.nom`

### 7.5 Détail d'une facture (`/user/factures/:id`)

**Ce qu'elle fait :** Affiche tous les détails d'une facture et permet de remplir les infos de paiement.

**Le `:id` dans l'URL** est récupéré avec `useParams()` :
```javascript
const { id } = useParams(); // id = identifiant Firebase de la facture
```

**Suivi du paiement :** 3 champs éditables :
- `date_depot` — date à laquelle la facture a été déposée
- `date_encaissement` — date à laquelle le paiement a été reçu
- `type_virement` — dropdown : Virement bancaire / Chèque / Espèces

Quand on clique "Enregistrer le paiement", seuls ces 3 champs sont mis à jour dans Firebase via `updateFacture()`. **Le statut est géré uniquement par l'admin.**

---

## 8. Les 4 méthodes de facturation

### Méthode 1 — HT + TVA simple
**Principe :** Chaque article a un type. On applique le taux TVA correspondant.

| Type d'article | Taux TVA |
|----------------|----------|
| informatique | 20% |
| services | 10% |
| formation | 0% |

**Calcul :**
```
Total HT  = Somme(prix_ht × quantité)
TVA       = Somme(prix_ht × quantité × taux_tva_de_l_article)
Total TTC = Total HT + TVA
```

### Méthode 2 — Remise par ligne
**Principe :** Chaque ligne d'article a sa propre remise en pourcentage.

**Calcul :**
```
HT ligne  = prix_ht × quantité × (1 - remise/100)
TVA ligne = HT ligne × taux_tva
```

**Exemple :** Article à 100 DH, remise 10%, TVA 20%
→ HT = 100 × 0.90 = 90 DH
→ TVA = 90 × 0.20 = 18 DH
→ TTC ligne = 108 DH

### Méthode 3 — Remise globale
**Principe :** Une seule remise en % s'applique sur le total HT global.

**Calcul :**
```
Total HT brut        = Somme(prix_ht × quantité)
Total HT après remise = Total HT brut × (1 - remise_globale/100)
TVA                  = calculée sur le HT après remise
```

**Exemple :** Total HT = 1000 DH, remise 15%
→ HT après remise = 1000 × 0.85 = 850 DH
→ TVA (20%) = 170 DH
→ TTC = 1020 DH

### Méthode 4 — TVA par catégorie
**Principe :** Identique à la Méthode 1 en termes de calcul, mais l'intent est d'être explicite : chaque article utilise le taux TVA de sa propre catégorie. Utile quand la facture mélange des articles de catégories différentes (ex : laptop + formation + service).

---

## 9. Génération PDF

### Comment ça marche ?

La fonction `generateInvoicePDF(facture, client)` dans `src/utils/generateInvoicePDF.js` :

1. Crée un document jsPDF au format A4 (210 × 297 mm)
2. Dessine les éléments **à la main** avec des coordonnées x/y (en millimètres)
3. Utilise `autoTable` pour générer le tableau des articles automatiquement
4. Appelle `doc.save("facture.pdf")` qui déclenche le téléchargement dans le navigateur

**Aucun serveur n'est impliqué.** Tout se passe dans le navigateur du client.

### Structure du PDF généré

```
┌─────────────────────────────────────────┐  ← Barre verte fine (accent haut)
│ AppFac                    FACTURE       │  ← Nom société + titre
│ contact@appfac.ma       N° FAC-...  □  │  ← Sous-titre + n° facture + badge statut
├─────────────────────────────────────────┤  ← Ligne verte séparatrice
│ DE :                │ FACTURÉ À :       │  ← Deux colonnes
│ AppFac Entreprise   │ Nom client        │
│ RC: 123456·ICE:...  │ email             │
│ TVA intracom...     │ téléphone/adresse │
├─────────────────────────────────────────┤
│ Méthode : HT + TVA simple               │  ← Barre info méthode
├────┬──────────────┬─────┬───────┬───────┤
│ #  │ Désignation  │ Qté │ HT    │ Total │  ← En-tête tableau (fond noir)
│  1 │ Laptop Dell  │   2 │ 800DH │ 1600  │  ← Lignes articles (alternées)
│  2 │ Formation JS │   1 │ 1200  │ 1200  │
├─────────────────────┬───────────────────┤
│ Paiement :          │ Total HT : xxxx   │
│ Mode: Virement      │ TVA      : xxxx   │
│ Dépôt: 21-04-2026   │ ────────────────  │
│ Encaiss: 30-04-2026 │ ■ TTC : xxxx DH ■ │  ← Fond vert
├─────────────────────┴───────────────────┤
│ [Signature émetteur] [Signature client] │  ← 2 cases avec ligne
├─────────────────────────────────────────┤
│ Mention légale (italique)               │
├─────────────────────────────────────────┤
│ AppFac · contact...    N°    Page 1/1  │  ← Footer (fond noir)
└─────────────────────────────────────────┘  ← Barre verte fine (accent bas)
```

---

## 10. Les pages admin

> Ces pages ont été faites par Othmane.

### Dashboard admin (`/admin`)
Statistiques globales : total factures, montant encaissé, répartition par statut, graphiques.

### Articles (`/admin/articles`)
CRUD complet des articles du catalogue (stockés dans JSON Server).  
Chaque article : nom, description, prix HT, catégorie, type TVA.

### Catégories (`/admin/categories`)
CRUD des catégories : Informatique, Services, Formation.

### Validation (`/admin/validation`)
L'admin voit toutes les factures en attente et peut :
- **Valider** → statut passe à `payee`
- **Rejeter** → statut passe à `rejetee`

La mise à jour est faite via `updateFactureStatut()` dans `firebaseService.js`.

---

## 11. Concepts React expliqués simplement

### useState — La mémoire d'un composant

```javascript
const [clients, setClients] = useState([]);
// clients     = la valeur actuelle (tableau vide au départ)
// setClients  = la fonction pour changer la valeur
```
Quand on appelle `setClients(nouvelleValeur)`, React re-affiche le composant avec la nouvelle valeur. C'est la base de tout.

### useEffect — Faire quelque chose au bon moment

```javascript
useEffect(() => {
  // Ce code s'exécute UNE FOIS quand la page charge
  chargerLesClients();
}, []); // [] signifie : seulement au 1er chargement
```
Sans le tableau `[]`, le code s'exécuterait à chaque rendu (boucle infinie potentielle).

### useMemo — Calculer et mettre en cache

```javascript
const clientsFiltres = useMemo(() => {
  return clients.filter(c => c.nom.includes(recherche));
}, [clients, recherche]); // recalcule SEULEMENT si clients ou recherche change
```
Sans `useMemo`, le filtre serait recalculé à chaque re-rendu, même inutilement. Ici on évite les calculs répétés.

### useNavigate — Changer de page

```javascript
const navigate = useNavigate();
navigate("/user/factures"); // redirige l'utilisateur vers cette page
```

### useParams — Lire un paramètre dans l'URL

```javascript
// URL actuelle : /user/factures/ABC123XYZ
const { id } = useParams(); // id = "ABC123XYZ"
// On peut maintenant charger la facture avec cet id
```

### Props — Passer des données à un composant enfant

```javascript
// Composant parent qui utilise KpiCard
<KpiCard label="Total factures" value={42} accent="#2D6A4F" />

// Composant enfant qui reçoit les props
const KpiCard = ({ label, value, accent }) => (
  <div style={{ color: accent }}>
    {label}: {value}
  </div>
);
```

### Composant fonctionnel

Tout notre code utilise des **fonctions** pour définir les composants (pas des classes). C'est la façon moderne depuis React 16.8.

```javascript
const MonComposant = () => {
  return <div>Bonjour</div>;
};
export default MonComposant;
```

### async/await — Gérer le temps d'attente

```javascript
// Les opérations Firebase et les requêtes réseau prennent du temps.
// async/await permet d'attendre le résultat sans bloquer l'interface.

const chargerClients = async () => {
  const data = await getClients(); // attend la réponse de Firebase
  setClients(data);                // puis met à jour l'état
};
```

---

## 12. Questions fréquentes du prof

### ❓ Pourquoi Firebase et pas une base de données classique comme MySQL ?

Firebase est une **base de données hébergée dans le cloud** (gérée par Google). Pour ce mini-projet, elle nous évite d'installer et configurer un serveur backend (Node.js, PHP, etc.) + un serveur de base de données (MySQL, PostgreSQL). Firebase offre aussi l'authentification intégrée et la synchronisation temps réel. Une base MySQL classique nécessiterait une architecture à 3 couches (Front React → API Backend → MySQL) au lieu de 2 (Front React → Firebase).

---

### ❓ Pourquoi JSON Server pour les articles et Firebase pour les factures ?

**Séparation des besoins :**
- Le catalogue d'**articles/catégories** est géré uniquement par l'admin, change rarement, et ne nécessite pas de sécurité avancée → JSON Server suffit (simple, rapide à mettre en place).
- Les **factures et clients** sont créés en permanence par plusieurs utilisateurs, doivent être sécurisés et accessibles de partout → Firebase Realtime Database est plus adapté.

C'est aussi une façon de montrer qu'on sait utiliser deux types d'APIs différentes.

---

### ❓ Quelle est la différence entre un composant et une page ?

- **Page** : représente une URL complète. Elle contient toute la logique d'une fonctionnalité. Ex : `InvoiceForm.jsx` pour `/user/nouvelle-facture`.
- **Composant** : un élément réutilisable sans URL propre. Ex : `UserLayout.jsx` est le gabarit (sidebar + zone de contenu) utilisé par toutes les pages utilisateur. `KpiCard` est une carte réutilisée 5 fois dans le dashboard.

---

### ❓ Comment fonctionne le routage ?

React Router gère la navigation sans rechargement de page. Dans `App.jsx`, on définit quelle page afficher pour chaque URL :

```jsx
<Route path="/user/clients" element={<ClientsPage />} />
<Route path="/user/factures/:id" element={<InvoiceDetailPage />} />
```

Quand l'utilisateur clique sur "Mes factures", l'URL change mais la page ne se recharge pas. Seul le contenu de la zone principale change. C'est ce qu'on appelle une **SPA (Single Page Application)**.

---

### ❓ Pourquoi utiliser Formik et Yup et pas contrôler le formulaire à la main ?

Sans Formik, pour chaque champ de formulaire il faudrait :
- Un `useState` pour la valeur
- Un gestionnaire `onChange` pour mettre à jour
- Une vérification manuelle avant soumission
- Un `useState` pour chaque message d'erreur

Avec **Formik**, un seul objet gère tout. Avec **Yup**, les règles de validation sont déclarées en une fois et s'appliquent automatiquement. Le code est beaucoup plus court et lisible.

---

### ❓ Comment les données sont-elles protégées ? Un utilisateur peut-il voir les factures d'un autre ?

Deux niveaux de protection :
1. **Routes protégées** : `ProtectedRoute` redirige vers `/login` si l'utilisateur n'est pas connecté. Sans token Firebase valide, aucune page n'est accessible.
2. **Filtrage par UID** : Chaque facture contient `created_by = uid`. Quand on charge "Mes factures", on filtre : `factures.filter(f => f.created_by === currentUser.uid)`. Un utilisateur ne peut donc voir que ses propres factures.

---

### ❓ Pourquoi le statut ne peut être changé que par l'admin ?

C'est une **règle métier** : l'utilisateur crée et dépose la facture. Seul l'admin décide si elle est validée (payée) ou rejetée. Cette logique est appliquée dans le code :
- `InvoiceDetailPage` → `updateFacture()` avec uniquement `date_depot`, `date_encaissement`, `type_virement`. **Pas le statut.**
- `ValidationPage` (admin) → `updateFactureStatut()` pour changer le statut.

---

### ❓ C'est quoi un Context ?

Un **Context** est un moyen de partager des données entre n'importe quels composants de l'application sans passer des `props` de parent en enfant à chaque niveau.

Sans Context :
```
App → Layout → Page → Composant → SousComposant (enfin l'utilisateur ici)
```
Il faudrait passer `currentUser` à chaque niveau.

Avec `AuthContext` :
```javascript
// Dans n'importe quelle page ou composant :
const { currentUser, userRole } = useAuth();
```
L'information est accessible directement, peu importe où on se trouve dans l'arbre de composants.

---

### ❓ C'est quoi `total_ht`, `tva` et `total_ttc` ?

- **HT (Hors Taxes)** : le prix de base avant impôt
- **TVA (Taxe sur la Valeur Ajoutée)** : impôt ajouté (0%, 10%, ou 20% selon le type d'article)
- **TTC (Toutes Taxes Comprises)** : ce que le client paie réellement = HT + TVA

**Exemple concret :**
```
Laptop Dell : 800 DH HT, tva_type = "informatique" (20%)
  TVA = 800 × 0.20 = 160 DH
  TTC = 800 + 160 = 960 DH

Formation React : 1200 DH HT, tva_type = "formation" (0%)
  TVA = 0 DH
  TTC = 1200 DH

Total facture : HT = 2000 DH · TVA = 160 DH · TTC = 2160 DH
```

---

### ❓ Comment le PDF est-il généré sans serveur ?

La bibliothèque **jsPDF** crée le fichier PDF entièrement **dans le navigateur**, en JavaScript pur. Elle positionne chaque élément avec des coordonnées (x, y) en millimètres sur la page A4. `autoTable` génère le tableau des articles. Quand `doc.save()` est appelé, le navigateur déclenche automatiquement le téléchargement du fichier. **Aucun serveur n'est impliqué.**

---

### ❓ C'est quoi `useCallback` vs `useMemo` ?

- `useMemo` mémorise le **résultat** d'un calcul : `const total = useMemo(() => calculer(), [data])`
- `useCallback` mémorise une **fonction** : `const handleClick = useCallback(() => faire(), [dep])`

Les deux évitent de recréer/recalculer inutilement à chaque rendu du composant.

---

### ❓ Qu'est-ce qu'une API REST ?

Une **API REST** est un ensemble de règles pour échanger des données via HTTP. Elle utilise des URLs et des méthodes :

| Méthode | Action | Exemple |
|---------|--------|---------|
| GET | Lire | GET /articles → retourne tous les articles |
| POST | Créer | POST /articles → crée un article |
| PUT | Modifier | PUT /articles/1 → modifie l'article n°1 |
| DELETE | Supprimer | DELETE /articles/1 → supprime l'article n°1 |

JSON Server implémente automatiquement ces 4 méthodes pour chaque ressource du fichier `articles.json`.

---

## 📌 Résumé rapide à retenir

| Technologie | Rôle dans le projet |
|-------------|---------------------|
| **React** | Interface utilisateur dynamique (SPA) |
| **Material UI** | Composants graphiques prêts à l'emploi |
| **Firebase Auth** | Connexion / déconnexion / gestion des rôles |
| **Firebase Realtime DB** | Stockage des clients et factures dans le cloud |
| **JSON Server** | Catalogue articles + catégories (local) |
| **Formik + Yup** | Formulaires + validation des saisies |
| **jsPDF + autoTable** | Génération PDF dans le navigateur |
| **React Router** | Navigation entre pages sans rechargement |
| **Axios** | Requêtes HTTP vers JSON Server |

---

*Documentation rédigée pour le mini-projet AppFac — Gestion de Factures*
*Hiba (partie utilisateur + PDF) · Othmane (partie admin + Firebase)*
