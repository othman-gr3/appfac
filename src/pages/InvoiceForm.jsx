import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
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
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Chip,
} from "@mui/material";
import { Add, Delete, ArrowBack, SaveOutlined } from "@mui/icons-material";
import { getClients, addFacture } from "../services/firebaseService";
import { getArticles } from "../services/jsonService";
import { TVA_RATES, STATUTS } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";

// ── Helpers ──────────────────────────────────────────────────

/** Round to 2 decimal places */
const r2 = (n) => Math.round(n * 100) / 100;

/** Generate invoice number: FAC-YYYYMMDD-XXX */
const generateNumero = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `FAC-${datePart}-${rand}`;
};

const todayISO = () => new Date().toISOString().split("T")[0];

// Billing method labels
const METHODS = [
  { value: "1", label: "1 — HT + TVA simple" },
  { value: "2", label: "2 — Remise par ligne" },
  { value: "3", label: "3 — Remise globale" },
  { value: "4", label: "4 — TVA par catégorie" },
];

// Empty article row
const emptyLigne = () => ({
  article: null,     // full article object from JSON Server
  quantite: 1,
  remise_ligne: 0,   // used in method 2
});

// ── Shared styles ─────────────────────────────────────────────
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

const labelSx = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6B7280",
  mb: 0.75,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
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
  whiteSpace: "nowrap",
};

// ─────────────────────────────────────────────────────────────

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // ── Remote data ─────────────────────────────────────────────
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── Form state ──────────────────────────────────────────────
  const [clientId, setClientId] = useState("");
  const [numero, setNumero] = useState(generateNumero());
  const [dateCreation, setDateCreation] = useState(todayISO());
  const [methode, setMethode] = useState("1");
  const [lignes, setLignes] = useState([emptyLigne()]);
  const [remiseGlobale, setRemiseGlobale] = useState(0); // method 3 only

  // ── Submit state ────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Load clients + articles ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [c, a] = await Promise.all([getClients(), getArticles()]);
        setClients(c);
        setArticles(a);
      } catch {
        setError("Impossible de charger les données.");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // ── Line helpers ────────────────────────────────────────────
  const addLigne = () => setLignes((prev) => [...prev, emptyLigne()]);

  const removeLigne = (idx) =>
    setLignes((prev) => prev.filter((_, i) => i !== idx));

  const updateLigne = (idx, field, value) =>
    setLignes((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );

  // ── Totals calculation ──────────────────────────────────────
  const calcTotals = useCallback(() => {
    let total_ht = 0;
    let tva_amount = 0;

    lignes.forEach((l) => {
      if (!l.article) return;
      const prixHT = l.article.prix_ht * l.quantite;
      const tvaRate = TVA_RATES[l.article.tva_type] ?? 0;

      switch (methode) {
        case "1": {
          // Simple: apply flat TVA per article type
          total_ht += prixHT;
          tva_amount += prixHT * tvaRate;
          break;
        }
        case "2": {
          // Remise per line
          const remise = (l.remise_ligne || 0) / 100;
          const ht_apres = prixHT * (1 - remise);
          total_ht += ht_apres;
          tva_amount += ht_apres * tvaRate;
          break;
        }
        case "3": {
          // Global discount — apply to HT before TVA
          const remise = (remiseGlobale || 0) / 100;
          const ht_apres = prixHT * (1 - remise);
          total_ht += ht_apres;
          tva_amount += ht_apres * tvaRate;
          break;
        }
        case "4": {
          // TVA per category (same as method 1 but explicit)
          total_ht += prixHT;
          tva_amount += prixHT * tvaRate;
          break;
        }
        default:
          break;
      }
    });

    return {
      total_ht: r2(total_ht),
      tva: r2(tva_amount),
      total_ttc: r2(total_ht + tva_amount),
    };
  }, [lignes, methode, remiseGlobale]);

  const totals = calcTotals();

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");

    if (!clientId) return setError("Veuillez sélectionner un client.");
    if (lignes.every((l) => !l.article))
      return setError("Ajoutez au moins un article.");

    const articlesPayload = lignes
      .filter((l) => l.article)
      .map((l) => ({
        article_id: l.article.id,
        nom: l.article.nom,
        prix_ht: l.article.prix_ht,
        tva_type: l.article.tva_type,
        quantite: l.quantite,
        ...(methode === "2" && { remise_ligne: l.remise_ligne || 0 }),
      }));

    const payload = {
      numero,
      date_creation: dateCreation,
      client_id: clientId,
      articles: articlesPayload,
      methode_facturation: methode,
      ...(methode === "3" && { remise_globale: remiseGlobale }),
      total_ht: totals.total_ht,
      tva: totals.tva,
      total_ttc: totals.total_ttc,
      statut: STATUTS.EN_ATTENTE,
      date_depot: null,
      date_encaissement: null,
      type_virement: null,
      validated_by_admin: null,
      created_by: currentUser?.uid ?? null,
    };

    setSaving(true);
    try {
      await addFacture(payload);
      setSuccess(true);
      setTimeout(() => navigate("/user/factures"), 1500);
    } catch {
      setError("Erreur lors de l'enregistrement. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────
  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress size={28} sx={{ color: "#2D6A4F" }} />
      </Box>
    );
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* ── Page header ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton
          size="small"
          onClick={() => navigate("/user/factures")}
          sx={{ color: "#6B7280", border: "1px solid #E0E0D8", borderRadius: "4px" }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "#1C2023", letterSpacing: "-0.02em" }}
          >
            Nouvelle facture
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.25 }}>
            Remplissez le formulaire puis enregistrez.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}>
          Facture enregistrée ! Redirection…
        </Alert>
      )}

      {/* ── Section 1: General info ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E0E0D8", borderRadius: "4px", p: 3, mb: 3, bgcolor: "#fff" }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023", mb: 2.5 }}>
          Informations générales
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2.5 }}>
          {/* Numéro */}
          <Box>
            <Typography sx={labelSx}>N° Facture</Typography>
            <TextField
              id="invoice-numero"
              fullWidth
              size="small"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Date */}
          <Box>
            <Typography sx={labelSx}>Date</Typography>
            <TextField
              id="invoice-date"
              type="date"
              fullWidth
              size="small"
              value={dateCreation}
              onChange={(e) => setDateCreation(e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Client */}
          <Box>
            <Typography sx={labelSx}>Client *</Typography>
            <FormControl fullWidth size="small">
              <Select
                id="invoice-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
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
                <MenuItem value="" disabled sx={{ fontSize: 13, color: "#9CA3AF" }}>
                  Sélectionner un client
                </MenuItem>
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: 13 }}>
                    {c.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* ── Section 2: Billing method ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E0E0D8", borderRadius: "4px", p: 3, mb: 3, bgcolor: "#fff" }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023", mb: 2 }}>
          Méthode de facturation
        </Typography>

        <ToggleButtonGroup
          value={methode}
          exclusive
          onChange={(_, v) => { if (v) setMethode(v); }}
          size="small"
          sx={{ flexWrap: "wrap", gap: 1 }}
        >
          {METHODS.map((m) => (
            <ToggleButton
              key={m.value}
              value={m.value}
              sx={{
                borderRadius: "4px !important",
                border: "1px solid #E0E0D8 !important",
                fontSize: 12,
                fontWeight: 500,
                textTransform: "none",
                px: 2,
                color: "#374151",
                "&.Mui-selected": {
                  bgcolor: "#2D6A4F",
                  color: "#fff",
                  borderColor: "#2D6A4F !important",
                  "&:hover": { bgcolor: "#245a42" },
                },
              }}
            >
              {m.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Method descriptions */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: "#F5F5F0",
            borderRadius: "4px",
            fontSize: 12,
            color: "#6B7280",
          }}
        >
          {methode === "1" && "TVA fixe appliquée selon le type d'article (Informatique 20%, Services 10%, Formation 0%)."}
          {methode === "2" && "Remise individuelle (%) saisie pour chaque ligne. La TVA s'applique après remise."}
          {methode === "3" && "Une remise globale (%) appliquée sur le total HT. Saisissez le taux ci-dessous."}
          {methode === "4" && "TVA calculée par catégorie d'article — chaque ligne utilise son propre taux TVA."}
        </Box>

        {/* Method 3: global discount input */}
        {methode === "3" && (
          <Box sx={{ mt: 2, maxWidth: 200 }}>
            <Typography sx={labelSx}>Remise globale (%)</Typography>
            <TextField
              id="invoice-remise-globale"
              type="number"
              size="small"
              value={remiseGlobale}
              onChange={(e) =>
                setRemiseGlobale(Math.min(100, Math.max(0, Number(e.target.value))))
              }
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              sx={{ ...inputSx, width: 160 }}
            />
          </Box>
        )}
      </Paper>

      {/* ── Section 3: Article lines ── */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #E0E0D8", borderRadius: "4px", p: 3, mb: 3, bgcolor: "#fff" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C2023" }}>
            Lignes d'articles
          </Typography>
          <Button
            startIcon={<Add />}
            size="small"
            onClick={addLigne}
            sx={{
              textTransform: "none",
              fontSize: 12,
              color: "#2D6A4F",
              border: "1px solid #2D6A4F",
              borderRadius: "4px",
              px: 1.5,
              "&:hover": { bgcolor: "rgba(45,106,79,0.06)" },
            }}
          >
            Ajouter une ligne
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...thSx, width: "35%" }}>Article</TableCell>
                <TableCell sx={{ ...thSx, width: 80 }}>Qté</TableCell>
                <TableCell sx={thSx}>Prix HT unit.</TableCell>
                {methode === "2" && <TableCell sx={thSx}>Remise (%)</TableCell>}
                <TableCell sx={thSx}>Total HT</TableCell>
                {(methode === "1" || methode === "4") && <TableCell sx={thSx}>TVA</TableCell>}
                {methode === "2" && <TableCell sx={thSx}>TVA</TableCell>}
                {methode === "3" && <TableCell sx={thSx}>TVA</TableCell>}
                <TableCell sx={{ ...thSx, width: 40 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {lignes.map((ligne, idx) => {
                const tvaRate = TVA_RATES[ligne.article?.tva_type] ?? 0;
                const prixBrut = (ligne.article?.prix_ht ?? 0) * ligne.quantite;

                // HT after discount (per-line logic)
                let htApres = prixBrut;
                if (methode === "2") {
                  htApres = prixBrut * (1 - (ligne.remise_ligne || 0) / 100);
                } else if (methode === "3") {
                  htApres = prixBrut * (1 - (remiseGlobale || 0) / 100);
                }

                const tvaMontant = htApres * tvaRate;

                return (
                  <TableRow
                    key={idx}
                    sx={{
                      bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAF8",
                      verticalAlign: "middle",
                    }}
                  >
                    {/* Article autocomplete */}
                    <TableCell sx={{ py: 1 }}>
                      <Autocomplete
                        size="small"
                        options={articles}
                        getOptionLabel={(a) => a.nom}
                        value={ligne.article}
                        onChange={(_, v) => updateLigne(idx, "article", v)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderOption={(props, a) => (
                          <li {...props} key={a.id} style={{ fontSize: 13 }}>
                            <Box>
                              <span>{a.nom}</span>
                              <Typography
                                component="span"
                                sx={{ fontSize: 11, color: "#9CA3AF", ml: 1 }}
                              >
                                {a.prix_ht} DH HT
                              </Typography>
                            </Box>
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Chercher un article…"
                            sx={{
                              ...inputSx,
                              "& .MuiOutlinedInput-root": {
                                ...inputSx["& .MuiOutlinedInput-root"],
                                fontSize: 13,
                              },
                            }}
                          />
                        )}
                      />
                    </TableCell>

                    {/* Quantité */}
                    <TableCell sx={{ py: 1 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={ligne.quantite}
                        onChange={(e) =>
                          updateLigne(idx, "quantite", Math.max(1, Number(e.target.value)))
                        }
                        inputProps={{ min: 1, style: { textAlign: "center" } }}
                        sx={{ ...inputSx, width: 65 }}
                      />
                    </TableCell>

                    {/* Prix HT unit */}
                    <TableCell sx={{ fontSize: 13, color: "#374151", py: 1 }}>
                      {ligne.article ? `${r2(ligne.article.prix_ht)} DH` : "—"}
                    </TableCell>

                    {/* Remise per line (method 2 only) */}
                    {methode === "2" && (
                      <TableCell sx={{ py: 1 }}>
                        <TextField
                          type="number"
                          size="small"
                          value={ligne.remise_ligne || 0}
                          onChange={(e) =>
                            updateLigne(
                              idx,
                              "remise_ligne",
                              Math.min(100, Math.max(0, Number(e.target.value)))
                            )
                          }
                          inputProps={{ min: 0, max: 100, style: { textAlign: "center" } }}
                          sx={{ ...inputSx, width: 75 }}
                        />
                      </TableCell>
                    )}

                    {/* Total HT */}
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "#1C2023", py: 1 }}>
                      {ligne.article ? `${r2(htApres)} DH` : "—"}
                    </TableCell>

                    {/* TVA info */}
                    <TableCell sx={{ py: 1 }}>
                      {ligne.article ? (
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
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* Delete row */}
                    <TableCell sx={{ py: 1 }}>
                      <Tooltip title="Supprimer la ligne">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => removeLigne(idx)}
                            disabled={lignes.length === 1}
                            sx={{ color: "#8B2E2E" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Section 4: Totals + submit ── */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #E0E0D8",
          borderRadius: "4px",
          p: 3,
          bgcolor: "#fff",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Box sx={{ minWidth: 280 }}>
          {/* Method 3 reminder */}
          {methode === "3" && remiseGlobale > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                fontSize: 13,
                color: "#6B7280",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                Remise globale
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#8B2E2E", fontWeight: 500 }}>
                − {remiseGlobale}%
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Total HT</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {totals.total_ht.toFixed(2)} DH
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>TVA</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              {totals.tva.toFixed(2)} DH
            </Typography>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: "#E0E0D8" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1C2023" }}>
              Total TTC
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#2D6A4F" }}>
              {totals.total_ttc.toFixed(2)} DH
            </Typography>
          </Box>

          <Button
            id="invoice-submit-btn"
            fullWidth
            variant="contained"
            startIcon={saving ? null : <SaveOutlined />}
            onClick={handleSubmit}
            disabled={saving || success}
            sx={{
              bgcolor: "#2D6A4F",
              color: "#fff",
              borderRadius: "4px",
              boxShadow: "none",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 500,
              py: 1.25,
              "&:hover": { bgcolor: "#245a42", boxShadow: "none" },
              "&:disabled": { bgcolor: "#E0E0D8" },
            }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : "Enregistrer la facture"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceForm;
