// Invoice statuses
export const STATUTS = {
  EN_ATTENTE: "en_attente",
  PAYEE: "payee",
  REJETEE: "rejetee",
};

// Labels for display (French UI)
export const STATUTS_LABELS = {
  en_attente: "En attente",
  payee: "Payée",
  rejetee: "Rejetée",
};

// MUI color for each status (used in Chip components)
export const STATUTS_COLORS = {
  en_attente: "warning",
  payee: "success",
  rejetee: "error",
};

// TVA rates per article type (as decimals)
export const TVA_RATES = {
  informatique: 0.20, // 20%
  services: 0.10,     // 10%
  formation: 0.00,    // 0%
};

// TVA labels for display
export const TVA_LABELS = {
  informatique: "Informatique (20%)",
  services: "Services (10%)",
  formation: "Formation (0%)",
};

// Payment / transfer types
export const VIREMENT_TYPES = [
  "Virement bancaire",
  "Chèque",
  "Espèces",
];
