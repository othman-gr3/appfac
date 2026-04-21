import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ReceiptLong,
  HourglassTop,
  CheckCircleOutlined,
  CancelOutlined,
  EuroSymbol,
  Visibility,
  ArrowForward,
} from "@mui/icons-material";
import { getFactures, getClients } from "../services/firebaseService";
import { STATUTS, STATUTS_LABELS } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";

// ── Statut chip styles ────────────────────────────────────────
const STATUT_CHIP = {
  [STATUTS.EN_ATTENTE]: { bgcolor: "#FEF3C7", color: "#92400E" },
  [STATUTS.PAYEE]:      { bgcolor: "#D1FAE5", color: "#065F46" },
  [STATUTS.REJETEE]:    { bgcolor: "#FEE2E2", color: "#7F1D1D" },
};

// ── KPI card component ────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, accent }) => (
  <Paper
    elevation={0}
    sx={{
      border: "1px solid #E0E0D8",
      borderRadius: "4px",
      p: "20px 24px",
      bgcolor: "#fff",
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "4px",
        bgcolor: accent + "18",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, color: "#1C2023", lineHeight: 1.1, mb: 0.25 }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>{sub}</Typography>
      )}
    </Box>
  </Paper>
);

// ── Table header cell style ───────────────────────────────────
const thSx = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  bgcolor: "#EEEEE8",
  borderBottom: "1px solid #E0E0D8",
  py: 1.25,
};

// ─────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Load data ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [allFactures, allClients] = await Promise.all([
          getFactures(),
          getClients(),
        ]);
        // Only this user's invoices
        setFactures(allFactures.filter((f) => f.created_by === currentUser?.uid));
        setClients(allClients);
      } catch {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  // ── Client lookup ─────────────────────────────────────────
  const clientMap = useMemo(() => {
    const m = {};
    clients.forEach((c) => { m[c.id] = c; });
    return m;
  }, [clients]);

  // ── KPI calculations ──────────────────────────────────────
  const kpis = useMemo(() => {
    const enAttente = factures.filter((f) => f.statut === STATUTS.EN_ATTENTE);
    const payees    = factures.filter((f) => f.statut === STATUTS.PAYEE);
    const rejetees  = factures.filter((f) => f.statut === STATUTS.REJETEE);

    const totalTTC = factures.reduce(
      (sum, f) => sum + (typeof f.total_ttc === "number" ? f.total_ttc : 0),
      0
    );
    const totalPayees = payees.reduce(
      (sum, f) => sum + (typeof f.total_ttc === "number" ? f.total_ttc : 0),
      0
    );

    return {
      total: factures.length,
      totalTTC,
      totalPayees,
      enAttente: enAttente.length,
      payees: payees.length,
      rejetees: rejetees.length,
    };
  }, [factures]);

  // ── Recent factures (last 5, sorted by date desc) ─────────
  const recent = useMemo(
    () =>
      [...factures]
        .sort((a, b) => (b.date_creation ?? "").localeCompare(a.date_creation ?? ""))
        .slice(0, 5),
    [factures]
  );

  // ── Loading / error ───────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress size={28} sx={{ color: "#2D6A4F" }} />
      </Box>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Page title ── */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: "#1C2023", letterSpacing: "-0.02em" }}
        >
          Tableau de bord
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.25 }}>
          Bienvenue, {currentUser?.email}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}>
          {error}
        </Alert>
      )}

      {/* ── KPI cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        <KpiCard
          label="Total factures"
          value={kpis.total}
          sub="mes factures"
          accent="#1C2023"
          icon={<ReceiptLong sx={{ fontSize: 20, color: "#1C2023" }} />}
        />
        <KpiCard
          label="Montant total TTC"
          value={`${kpis.totalTTC.toFixed(0)} DH`}
          sub={`dont ${kpis.totalPayees.toFixed(0)} DH encaissés`}
          accent="#2D6A4F"
          icon={<EuroSymbol sx={{ fontSize: 20, color: "#2D6A4F" }} />}
        />
        <KpiCard
          label="En attente"
          value={kpis.enAttente}
          sub="à valider"
          accent="#D97706"
          icon={<HourglassTop sx={{ fontSize: 20, color: "#D97706" }} />}
        />
        <KpiCard
          label="Payées"
          value={kpis.payees}
          sub="encaissées"
          accent="#059669"
          icon={<CheckCircleOutlined sx={{ fontSize: 20, color: "#059669" }} />}
        />
        <KpiCard
          label="Rejetées"
          value={kpis.rejetees}
          sub="non validées"
          accent="#8B2E2E"
          icon={<CancelOutlined sx={{ fontSize: 20, color: "#8B2E2E" }} />}
        />
      </Box>

      {/* ── Recent invoices ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E0E0D8", borderRadius: "4px", bgcolor: "#fff" }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023" }}>
            Factures récentes
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
            onClick={() => navigate("/user/factures")}
            sx={{
              textTransform: "none",
              fontSize: 12,
              color: "#2D6A4F",
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            Voir toutes
          </Button>
        </Box>

        <Divider sx={{ borderColor: "#E0E0D8" }} />

        {recent.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <ReceiptLong sx={{ fontSize: 36, color: "#D1D5DB", mb: 1 }} />
            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
              Aucune facture pour l'instant.
            </Typography>
            <Button
              size="small"
              onClick={() => navigate("/user/nouvelle-facture")}
              sx={{
                mt: 1.5,
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
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={thSx}>N° Facture</TableCell>
                  <TableCell sx={thSx}>Date</TableCell>
                  <TableCell sx={thSx}>Client</TableCell>
                  <TableCell sx={{ ...thSx, textAlign: "right" }}>Total TTC</TableCell>
                  <TableCell sx={{ ...thSx, textAlign: "center" }}>Statut</TableCell>
                  <TableCell sx={{ ...thSx, width: 60, textAlign: "center" }}>
                    Détail
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.map((f, idx) => {
                  const statut = f.statut ?? STATUTS.EN_ATTENTE;
                  const chipStyle = STATUT_CHIP[statut] ?? STATUT_CHIP[STATUTS.EN_ATTENTE];
                  const clientNom = clientMap[f.client_id]?.nom ?? "—";

                  return (
                    <TableRow
                      key={f.id}
                      sx={{
                        bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAF8",
                        "&:hover": { bgcolor: "#F0F4F1" },
                        transition: "background 0.15s",
                      }}
                    >
                      <TableCell
                        sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023", py: 1.25 }}
                      >
                        {f.numero ?? "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25 }}>
                        {f.date_creation ?? "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25 }}>
                        {clientNom}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#2D6A4F",
                          py: 1.25,
                          textAlign: "right",
                        }}
                      >
                        {typeof f.total_ttc === "number"
                          ? `${f.total_ttc.toFixed(2)} DH`
                          : "—"}
                      </TableCell>
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
                      <TableCell sx={{ py: 1.25, textAlign: "center" }}>
                        <Tooltip title="Voir le détail">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/user/factures/${f.id}`)}
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
      </Paper>
    </Box>
  );
};

export default UserDashboard;
