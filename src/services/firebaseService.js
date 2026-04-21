import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove, push } from "firebase/database";

// Firebase config from .env (Vite prefix: VITE_)
const firebaseConfig = {
  apiKey: "AIzaSyDhsGd1paX3ajjsZe_lE88f98b27ef45Cw",
  authDomain: "appfac-60362.firebaseapp.com",
  databaseURL: "https://appfac-60362-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "appfac-60362",
  storageBucket: "appfac-60362.firebasestorage.app",
  messagingSenderId: "1059351154120",
  appId: "1:1059351154120:web:56694292fef0c6ae7b84fd",
  measurementId: "G-BLFKT7HJ47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// ─── CLIENTS ────────────────────────────────────────────────

// Get all clients
export const getClients = async () => {
  const snapshot = await get(ref(db, "clients"));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
};

// Get one client
export const getClient = async (clientId) => {
  const snapshot = await get(ref(db, `clients/${clientId}`));
  return snapshot.exists() ? { id: clientId, ...snapshot.val() } : null;
};

// Add a client (auto-generated ID)
export const addClient = async (clientData) => {
  const newRef = push(ref(db, "clients"));
  await set(newRef, clientData);
  return newRef.key;
};

// Update a client
export const updateClient = async (clientId, clientData) => {
  await update(ref(db, `clients/${clientId}`), clientData);
};

// Delete a client
export const deleteClient = async (clientId) => {
  await remove(ref(db, `clients/${clientId}`));
};

// ─── FACTURES ───────────────────────────────────────────────

// Get all factures
export const getFactures = async () => {
  const snapshot = await get(ref(db, "factures"));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
};

// Get one facture
export const getFacture = async (factureId) => {
  const snapshot = await get(ref(db, `factures/${factureId}`));
  return snapshot.exists() ? { id: factureId, ...snapshot.val() } : null;
};

// Add a facture (auto-generated ID)
export const addFacture = async (factureData) => {
  const newRef = push(ref(db, "factures"));
  await set(newRef, factureData);
  return newRef.key;
};

// Update a facture
export const updateFacture = async (factureId, factureData) => {
  await update(ref(db, `factures/${factureId}`), factureData);
};

// Delete a facture
export const deleteFacture = async (factureId) => {
  await remove(ref(db, `factures/${factureId}`));
};

// Update only the statut + validated_by_admin (used by admin validation)
export const updateFactureStatut = async (factureId, statut, validatedByAdmin) => {
  await update(ref(db, `factures/${factureId}`), {
    statut,
    validated_by_admin: validatedByAdmin,
  });
};
