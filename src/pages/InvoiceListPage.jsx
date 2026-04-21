import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Visibility,
  Add,
  ReceiptLong,
} from "@mui/icons-material";
import { getFactures, getClients } from "../services/firebaseService";
import { STATUTS, STATUTS_LABELS } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";

// ── Helpers ───────────────────────────────────────────────────

const STATUT_CHIP = {
  [STATUTS.EN_ATTENTE]: { bgcolor: "#FEF3C7", color: "#92400E" },
  [STATUTS.PAYEE]:      { bgcolor: "#D1FAE5", color: "#065F46" },
  [STATUTS.REJETEE]:    { bgcolor: "#FEE2E2", color: "#7F1D1D" },
};

const FILTER_OPTIONS = [
  { value: "all",                label: "Toutes" },
  { value: STATUTS.EN_ATTENTE,   label: "En attente" },
  { value: STATUTS.PAYEE,        label: "Payée" },
  { value: STATUTS.REJETEE,      label: "Rejetée" },
];

const thSx = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  bgcolor: "#EEEEE8",
  borderBottom: "1px solid #E0E0D8",
  py: 1.25,
  whiteSpace: "nowrap",
};

// ─────────────────────────────────────────────────────────────

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [statutFilter, setStatutFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ── Load data ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [allFactures, allClients] = await Promise.all([
          getFactures(),
          getClients(),
        ]);
        // Only show invoices created by this user
        const mine = allFactures.filter(
          (f) => f.created_by === currentUser?.uid
        );
        setFactures(mine);
        setClients(allClients);
      } catch {
        setLoadError("Impossible de charger les factures.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  // ── Client lookup map ─────────────────────────────────────
  const clientMap = useMemo(() => {
    const m = {};
    clients.forEach((c) => { m[c.id] = c; });
    return m;
  }, [clients]);

  // ── Filtered + searched list ──────────────────────────────
  const displayed = useMemo(() => {
    let list = factures;

    // Filter by statut
    if (statutFilter !== "all") {
      list = list.filter((f) => f.statut === statutFilter);
    }

    // Search by client name
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) => {
        const clientNom = clientMap[f.client_id]?.nom ?? "";
        return (
          clientNom.toLowerCase().includes(q) ||
          (f.numero ?? "").toLowerCase().includes(q)
        );
      });
    }

    // Sort: most recent first
    return [...list].sort((a, b) =>
      (b.date_creation ?? "").localeCompare(a.date_creation ?? "")
    );
  }, [factures, statutFilter, search, clientMap]);

  // ── Counts per statut (for filter badges) ─────────────────
  const counts = useMemo(() => {
    const c = { all: factures.length };
    Object.values(STATUTS).forEach((s) => {
      c[s] = factures.filter((f) => f.statut === s).length;
    });
    return c;
  }, [factures]);

  // ── Render ────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "#1C2023", letterSpacing: "-0.02em" }}
          >
            Mes factures
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.25 }}>
            {factures.length} facture{factures.length !== 1 ? "s" : ""} au total
          </Typography>
        </Box>

        <Button
          id="new-invoice-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/user/nouvelle-facture")}
          sx={{
            bgcolor: "#2D6A4F",
            color: "#fff",
            borderRadius: "4px",
            boxShadow: "none",
            textTransform: "none",
            fontSize: 13,
            fontWeight: 500,
            px: 2,
            "&:hover": { bgcolor: "#245a42", boxShadow: "none" },
          }}
        >
          Nouvelle facture
        </Button>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}>
          {loadError}
        </Alert>
      )}

      {/* ── Filters row ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2.5,
          flexWrap: "wrap",
        }}
      >
        {/* Statut chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = statutFilter === opt.value;
            return (
              <Chip
                key={opt.value}
                label={`${opt.label}${counts[opt.value] !== undefined ? ` (${counts[opt.value]})` : ""}`}
                onClick={() => setStatutFilter(opt.value)}
                size="small"
                sx={{
                  borderRadius: "4px",
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  bgcolor: isActive ? "#1C2023" : "#fff",
                  color: isActive ? "#F5F5F0" : "#374151",
                  border: "1px solid",
                  borderColor: isActive ? "#1C2023" : "#E0E0D8",
                  "&:hover": {
                    bgcolor: isActive ? "#1C2023" : "#F5F5F0",
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Search */}
        <TextField
          id="invoice-search"
          size="small"
          placeholder="Rechercher par client ou N° facture…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            ml: "auto",
            width: 280,
            "& .MuiOutlinedInput-root": {
              borderRadius: "4px",
              fontSize: 13,
              bgcolor: "#fff",
              "& fieldset": { borderColor: "#E0E0D8" },
              "&:hover fieldset": { borderColor: "#1C2023" },
              "&.Mui-focused fieldset": { borderColor: "#2D6A4F" },
            },
          }}
        />
      </Box>

      {/* ── Table or states ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
          <CircularProgress size={28} sx={{ color: "#2D6A4F" }} />
        </Box>
      ) : displayed.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            pt: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ReceiptLong sx={{ fontSize: 40, color: "#D1D5DB" }} />
          <Typography sx={{ fontSize: 14, color: "#9CA3AF" }}>
            {factures.length === 0
              ? "Aucune facture pour l'instant."
              : "Aucun résultat pour ce filtre."}
          </Typography>
          {factures.length === 0 && (
            <Button
              size="small"
              onClick={() => navigate("/user/nouvelle-facture")}
              sx={{
                mt: 1,
                textTransform: "none",
                fontSize: 13,
                color: "#2D6A4F",
                border: "1px solid #2D6A4F",
                borderRadius: "4px",
                px: 2,
              }}
            >
              Créer ma première facture
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer
          sx={{
            border: "1px solid #E0E0D8",
            borderRadius: "4px",
            bgcolor: "#fff",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thSx}>N° Facture</TableCell>
                <TableCell sx={thSx}>Date</TableCell>
                <TableCell sx={thSx}>Client</TableCell>
                <TableCell sx={{ ...thSx, textAlign: "right" }}>Total TTC</TableCell>
                <TableCell sx={thSx}>Méthode</TableCell>
                <TableCell sx={{ ...thSx, textAlign: "center" }}>Statut</TableCell>
                <TableCell sx={{ ...thSx, textAlign: "center" }}>Dépôt</TableCell>
                <TableCell sx={{ ...thSx, width: 60, textAlign: "center" }}>
                  Détail
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayed.map((facture, idx) => {
                const clientNom = clientMap[facture.client_id]?.nom ?? "—";
                const statut = facture.statut ?? STATUTS.EN_ATTENTE;
                const chipStyle = STATUT_CHIP[statut] ?? STATUT_CHIP[STATUTS.EN_ATTENTE];
                const methodeLabel = {
                  "1": "HT+TVA",
                  "2": "Remise/ligne",
                  "3": "Remise glob.",
                  "4": "TVA/catég.",
                }[facture.methode_facturation] ?? "—";

                return (
                  <TableRow
                    key={facture.id}
                    sx={{
                      bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAF8",
                      "&:hover": { bgcolor: "#F0F4F1" },
                      transition: "background 0.15s",
                    }}
                  >
                    {/* N° */}
                    <TableCell
                      sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023", py: 1.25 }}
                    >
                      {facture.numero ?? "—"}
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25 }}>
                      {facture.date_creation ?? "—"}
                    </TableCell>

                    {/* Client */}
                    <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25 }}>
                      {clientNom}
                    </TableCell>

                    {/* Total TTC */}
                    <TableCell
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#2D6A4F",
                        py: 1.25,
                        textAlign: "right",
                      }}
                    >
                      {typeof facture.total_ttc === "number"
                        ? `${facture.total_ttc.toFixed(2)} DH`
                        : "—"}
                    </TableCell>

                    {/* Méthode */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Chip
                        label={methodeLabel}
                        size="small"
                        sx={{
                          fontSize: 11,
                          bgcolor: "#F3F4F6",
                          color: "#374151",
                          borderRadius: "4px",
                          fontWeight: 400,
                        }}
                      />
                    </TableCell>

                    {/* Statut */}
                    <TableCell sx={{ py: 1.25, textAlign: "center" }}>
                      <Chip
                        label={STATUTS_LABELS[statut] ?? statut}
                        size="small"
                        sx={{
                          fontSize: 11,
                          bgcolor: chipStyle.bgcolor,
                          color: chipStyle.color,
                          fontWeight: 600,
                          borderRadius: "4px",
                          height: 22,
                        }}
                      />
                    </TableCell>

                    {/* Date dépôt */}
                    <TableCell
                      sx={{ fontSize: 13, color: "#374151", py: 1.25, textAlign: "center" }}
                    >
                      {facture.date_depot ?? (
                        <Typography sx={{ fontSize: 12, color: "#D1D5DB" }}>—</Typography>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 1.25, textAlign: "center" }}>
                      <Tooltip title="Voir le détail">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/user/factures/${facture.id}`)}
                          sx={{ color: "#2D6A4F" }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InvoiceListPage;
