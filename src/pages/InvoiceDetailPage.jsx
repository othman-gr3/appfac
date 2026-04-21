import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  MenuItem,
  Select,
  FormControl,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack, SaveOutlined, PictureAsPdf } from "@mui/icons-material";
import { getFacture, getClient, updateFacture } from "../services/firebaseService";
import {
  STATUTS,
  STATUTS_LABELS,
  VIREMENT_TYPES,
  TVA_RATES,
} from "../utils/constants";
import { generateInvoicePDF } from "../utils/generateInvoicePDF";

// ── Helpers ───────────────────────────────────────────────────

const r2 = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : 0);

const STATUT_STYLES = {
  [STATUTS.EN_ATTENTE]: { bgcolor: "#FEF3C7", color: "#92400E", label: "En attente" },
  [STATUTS.PAYEE]:      { bgcolor: "#D1FAE5", color: "#065F46", label: "Payée" },
  [STATUTS.REJETEE]:    { bgcolor: "#FEE2E2", color: "#7F1D1D", label: "Rejetée" },
};

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

const labelSx = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6B7280",
  mb: 0.75,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    fontSize: 13,
    bgcolor: "#fff",
    "& fieldset": { borderColor: "#E0E0D8" },
    "&:hover fieldset": { borderColor: "#1C2023" },
    "&.Mui-focused fieldset": { borderColor: "#2D6A4F" },
  },
};

const METHODE_LABELS = {
  "1": "HT + TVA simple",
  "2": "Remise par ligne",
  "3": "Remise globale",
  "4": "TVA par catégorie",
};

// ─────────────────────────────────────────────────────────────
const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [facture, setFacture] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editable payment fields
  const [dateDepot, setDateDepot] = useState("");
  const [dateEncaissement, setDateEncaissement] = useState("");
  const [typeVirement, setTypeVirement] = useState("");

  // ── Load invoice ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const f = await getFacture(id);
        if (!f) { navigate("/user/factures"); return; }
        setFacture(f);
        setDateDepot(f.date_depot ?? "");
        setDateEncaissement(f.date_encaissement ?? "");
        setTypeVirement(f.type_virement ?? "");

        if (f.client_id) {
          const c = await getClient(f.client_id);
          setClient(c);
        }
      } catch {
        setError("Impossible de charger la facture.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Save payment info ─────────────────────────────────────
  const handleSave = async () => {
    setError("");
    setSuccessMsg("");
    setSaving(true);
    try {
      await updateFacture(id, {
        date_depot: dateDepot || null,
        date_encaissement: dateEncaissement || null,
        type_virement: typeVirement || null,
      });
      setSuccessMsg("Informations de paiement enregistrées.");
      // Refresh local state
      setFacture((prev) => ({
        ...prev,
        date_depot: dateDepot || null,
        date_encaissement: dateEncaissement || null,
        type_virement: typeVirement || null,
      }));
    } catch {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress size={28} sx={{ color: "#2D6A4F" }} />
      </Box>
    );
  }

  if (!facture) return null;

  const statut = facture.statut ?? STATUTS.EN_ATTENTE;
  const statutStyle = STATUT_STYLES[statut] ?? STATUT_STYLES[STATUTS.EN_ATTENTE];
  const articles = Array.isArray(facture.articles) ? facture.articles : [];

  // ── Render ────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 860 }}>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton
          size="small"
          onClick={() => navigate("/user/factures")}
          sx={{
            color: "#6B7280",
            border: "1px solid #E0E0D8",
            borderRadius: "4px",
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "#1C2023", letterSpacing: "-0.02em" }}
            >
              {facture.numero}
            </Typography>
            {/* Statut badge */}
            <Chip
              label={STATUTS_LABELS[statut] ?? statut}
              size="small"
              sx={{
                bgcolor: statutStyle.bgcolor,
                color: statutStyle.color,
                fontWeight: 600,
                fontSize: 11,
                borderRadius: "4px",
                height: 22,
              }}
            />
          </Box>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.25 }}>
            Créée le {facture.date_creation ?? "—"}
            {facture.methode_facturation && (
              <> · Méthode : {METHODE_LABELS[facture.methode_facturation] ?? facture.methode_facturation}</>
            )}
          </Typography>
        </Box>

        {/* PDF download button */}
        <Button
          id="download-pdf-btn"
          variant="outlined"
          startIcon={<PictureAsPdf />}
          onClick={() => generateInvoicePDF(facture, client)}
          sx={{
            borderRadius: "4px",
            textTransform: "none",
            fontSize: 13,
            fontWeight: 500,
            borderColor: "#2D6A4F",
            color: "#2D6A4F",
            "&:hover": { bgcolor: "rgba(45,106,79,0.06)", borderColor: "#2D6A4F" },
          }}
        >
          Télécharger PDF
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}>
          {successMsg}
        </Alert>
      )}

      {/* ── Client info ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E0E0D8", borderRadius: "4px", p: 3, mb: 3, bgcolor: "#fff" }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023", mb: 1.5 }}>
          Client
        </Typography>
        {client ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", mb: 0.25 }}>NOM</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1C2023" }}>
                {client.nom}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", mb: 0.25 }}>EMAIL</Typography>
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{client.email}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", mb: 0.25 }}>TÉLÉPHONE</Typography>
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{client.tel}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", mb: 0.25 }}>ADRESSE</Typography>
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{client.adresse}</Typography>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>Client introuvable.</Typography>
        )}
      </Paper>

      {/* ── Articles table ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E0E0D8", borderRadius: "4px", p: 3, mb: 3, bgcolor: "#fff" }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023", mb: 2 }}>
          Articles
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={thSx}>Article</TableCell>
                <TableCell sx={{ ...thSx, textAlign: "center" }}>Qté</TableCell>
                <TableCell sx={thSx}>Prix HT unit.</TableCell>
                {facture.methode_facturation === "2" && (
                  <TableCell sx={thSx}>Remise</TableCell>
                )}
                <TableCell sx={thSx}>Total HT</TableCell>
                <TableCell sx={thSx}>TVA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {articles.map((art, idx) => {
                const tvaRate = TVA_RATES[art.tva_type] ?? 0;
                let htBase = (art.prix_ht ?? 0) * (art.quantite ?? 1);
                if (facture.methode_facturation === "2") {
                  htBase = htBase * (1 - (art.remise_ligne ?? 0) / 100);
                } else if (facture.methode_facturation === "3") {
                  htBase = htBase * (1 - (facture.remise_globale ?? 0) / 100);
                }
                const tvaMontant = htBase * tvaRate;

                return (
                  <TableRow
                    key={idx}
                    sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAF8" }}
                  >
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "#1C2023", py: 1.25 }}>
                      {art.nom}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25, textAlign: "center" }}>
                      {art.quantite ?? 1}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25 }}>
                      {r2(art.prix_ht)} DH
                    </TableCell>
                    {facture.methode_facturation === "2" && (
                      <TableCell sx={{ fontSize: 13, color: "#8B2E2E", py: 1.25 }}>
                        -{art.remise_ligne ?? 0}%
                      </TableCell>
                    )}
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "#1C2023", py: 1.25 }}>
                      {r2(htBase)} DH
                    </TableCell>
                    <TableCell sx={{ py: 1.25 }}>
                      <Chip
                        label={`${(tvaRate * 100).toFixed(0)}% · ${r2(tvaMontant)} DH`}
                        size="small"
                        sx={{
                          fontSize: 11,
                          bgcolor: tvaRate === 0 ? "#F3F4F6" : "rgba(45,106,79,0.1)",
                          color: tvaRate === 0 ? "#6B7280" : "#2D6A4F",
                          fontWeight: 500,
                          borderRadius: "4px",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Box sx={{ minWidth: 260 }}>
            {facture.methode_facturation === "3" && (facture.remise_globale ?? 0) > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Remise globale</Typography>
                <Typography sx={{ fontSize: 13, color: "#8B2E2E", fontWeight: 500 }}>
                  −{facture.remise_globale}%
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Total HT</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                {r2(facture.total_ht).toFixed(2)} DH
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>TVA</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                {r2(facture.tva).toFixed(2)} DH
              </Typography>
            </Box>
            <Divider sx={{ my: 1, borderColor: "#E0E0D8" }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1C2023" }}>
                Total TTC
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#2D6A4F" }}>
                {r2(facture.total_ttc).toFixed(2)} DH
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ── Payment tracking ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E0E0D8", borderRadius: "4px", p: 3, bgcolor: "#fff" }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023", mb: 0.5 }}>
          Suivi du paiement
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#9CA3AF", mb: 2.5 }}>
          Remplissez ces champs après avoir déposé ou encaissé la facture.
        </Typography>

        {/* Admin validation note */}
        {facture.validated_by_admin && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 12 }}>
            Validée par l'admin : {facture.validated_by_admin}
          </Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2.5, mb: 3 }}>
          {/* Date dépôt */}
          <Box>
            <Typography sx={labelSx}>Date de dépôt</Typography>
            <TextField
              id="payment-date-depot"
              type="date"
              fullWidth
              size="small"
              value={dateDepot}
              onChange={(e) => setDateDepot(e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Date encaissement */}
          <Box>
            <Typography sx={labelSx}>Date d'encaissement</Typography>
            <TextField
              id="payment-date-encaissement"
              type="date"
              fullWidth
              size="small"
              value={dateEncaissement}
              onChange={(e) => setDateEncaissement(e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Type de virement */}
          <Box>
            <Typography sx={labelSx}>Mode de paiement</Typography>
            <FormControl fullWidth size="small">
              <Select
                id="payment-type-virement"
                value={typeVirement}
                onChange={(e) => setTypeVirement(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: "4px",
                  fontSize: 13,
                  bgcolor: "#fff",
                  "& fieldset": { borderColor: "#E0E0D8" },
                  "&:hover fieldset": { borderColor: "#1C2023" },
                  "&.Mui-focused fieldset": { borderColor: "#2D6A4F" },
                }}
              >
                <MenuItem value="" sx={{ fontSize: 13, color: "#9CA3AF" }}>
                  — Sélectionner —
                </MenuItem>
                {VIREMENT_TYPES.map((vt) => (
                  <MenuItem key={vt} value={vt} sx={{ fontSize: 13 }}>
                    {vt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Statut summary row */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#F5F5F0",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>STATUT</Typography>
              <Chip
                label={STATUTS_LABELS[statut] ?? statut}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: statutStyle.bgcolor,
                  color: statutStyle.color,
                  fontWeight: 600,
                  fontSize: 11,
                  borderRadius: "4px",
                  height: 22,
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>DÉPÔT</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, mt: 0.5 }}>
                {dateDepot || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>ENCAISSEMENT</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, mt: 0.5 }}>
                {dateEncaissement || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>MODE</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 500, mt: 0.5 }}>
                {typeVirement || "—"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            id="payment-save-btn"
            variant="contained"
            startIcon={saving ? null : <SaveOutlined />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              bgcolor: "#2D6A4F",
              color: "#fff",
              borderRadius: "4px",
              boxShadow: "none",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 500,
              px: 3,
              "&:hover": { bgcolor: "#245a42", boxShadow: "none" },
              "&:disabled": { bgcolor: "#E0E0D8" },
            }}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : "Enregistrer le paiement"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceDetailPage;
