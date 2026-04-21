import { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, TextField, Alert, CircularProgress,
  Stack, Drawer, IconButton,
} from "@mui/material";
import { CheckCircle, Cancel, Close } from "@mui/icons-material";
import { getFactures, updateFactureStatut } from "../services/firebaseService";
import { useAuth } from "../contexts/AuthContext";
import { STATUTS, STATUTS_LABELS } from "../utils/constants";

// Map statut → palette badge style
const BADGE_STYLES = {
  [STATUTS.EN_ATTENTE]: { bgcolor: "#FDF6E3", color: "#7A5C1E", border: "1px solid #e8d5a3" },
  [STATUTS.PAYEE]:      { bgcolor: "#EAF4EE", color: "#2D6A4F", border: "1px solid #b2d8c2" },
  [STATUTS.REJETEE]:    { bgcolor: "#F9EAEA", color: "#8B2E2E", border: "1px solid #e0b0b0" },
};

const StatusBadge = ({ statut }) => {
  const style = BADGE_STYLES[statut] || { bgcolor: "#F5F5F0", color: "#1C1C1E", border: "1px solid #E0E0D8" };
  return (
    <Box component="span" sx={{ display: "inline-block", px: 1, py: 0.25, borderRadius: "4px", fontSize: 11, fontWeight: 500, ...style }}>
      {STATUTS_LABELS[statut] || statut}
    </Box>
  );
};

const SectionLabel = ({ children }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>
    {children}
  </Typography>
);

const TABLE_HEADERS_PENDING = ["Numéro", "Client ID", "Total TTC (DA)", "Date dépôt", "Type virement", "Statut", "Actions"];
const TABLE_HEADERS_DONE    = ["Numéro", "Client ID", "Total TTC (DA)", "Statut", "Validé par"];

const ValidationPage = () => {
  const { currentUser } = useAuth();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rejectDialog, setRejectDialog] = useState({ open: false, factureId: null });
  const [rejectNote, setRejectNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchFactures = async () => {
    try {
      const data = await getFactures();
      setFactures(data);
    } catch {
      setError("Erreur lors du chargement des factures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFactures(); }, []);

  const handleApprove = async (factureId) => {
    setProcessing(true);
    setError("");
    try {
      await updateFactureStatut(factureId, STATUTS.PAYEE, currentUser.email);
      setSuccess("Facture approuvée avec succès.");
      await fetchFactures();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erreur lors de l'approbation.");
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (factureId) => { setRejectNote(""); setRejectDialog({ open: true, factureId }); };

  const handleReject = async () => {
    setProcessing(true);
    setError("");
    try {
      await updateFactureStatut(rejectDialog.factureId, STATUTS.REJETEE, currentUser.email);
      setRejectDialog({ open: false, factureId: null });
      setSuccess("Facture rejetée.");
      await fetchFactures();
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erreur lors du rejet.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress size={28} sx={{ color: "#2D6A4F" }} /></Box>;

  const pending = factures.filter((f) => f.statut === STATUTS.EN_ATTENTE);
  const others  = factures.filter((f) => f.statut !== STATUTS.EN_ATTENTE);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Page title */}
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E" }}>
        Validation des factures
      </Typography>

      {error   && <Alert severity="error"   sx={{ borderRadius: "4px", fontSize: 13, mt: -2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ borderRadius: "4px", fontSize: 13, mt: -2 }}>{success}</Alert>}

      {/* ── Pending section ── */}
      <Box>
        <SectionLabel>En attente ({pending.length})</SectionLabel>
        <TableContainer component={Paper} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAF8" }}>
                {TABLE_HEADERS_PENDING.map((h, i) => (
                  <TableCell key={h} align={i === TABLE_HEADERS_PENDING.length - 1 ? "center" : "left"}
                    sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E0E0D8", py: 1.5 }}
                  >{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5, fontSize: 13, color: "#6B6B6B" }}>
                    Aucune facture en attente
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((facture) => (
                  <TableRow key={facture.id} sx={{ height: 48, "&:hover": { bgcolor: "#F5F5F0" }, "&:last-child td": { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{facture.numero || facture.id}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#6B6B6B", borderBottom: "1px solid #E0E0D8" }}>{facture.client_id || "-"}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{facture.total_ttc ? Number(facture.total_ttc).toFixed(2) : "-"}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#6B6B6B", borderBottom: "1px solid #E0E0D8" }}>{facture.date_depot || "-"}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#6B6B6B", borderBottom: "1px solid #E0E0D8" }}>{facture.type_virement || "-"}</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #E0E0D8" }}><StatusBadge statut={facture.statut} /></TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #E0E0D8" }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          id={`approve-${facture.id}`}
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircle fontSize="small" />}
                          onClick={() => handleApprove(facture.id)}
                          disabled={processing}
                          sx={{ borderRadius: "4px", fontSize: 12, fontWeight: 500, textTransform: "none", boxShadow: "none", bgcolor: "#2D6A4F", "&:hover": { bgcolor: "#245a42", boxShadow: "none" } }}
                        >
                          Approuver
                        </Button>
                        <Button
                          id={`reject-${facture.id}`}
                          variant="outlined"
                          size="small"
                          startIcon={<Cancel fontSize="small" />}
                          onClick={() => openRejectDialog(facture.id)}
                          disabled={processing}
                          sx={{ borderRadius: "4px", fontSize: 12, fontWeight: 500, textTransform: "none", borderColor: "#8B2E2E", color: "#8B2E2E", "&:hover": { bgcolor: "#F9EAEA", borderColor: "#8B2E2E" } }}
                        >
                          Rejeter
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Processed section ── */}
      <Box>
        <SectionLabel>Factures traitées ({others.length})</SectionLabel>
        <TableContainer component={Paper} sx={{ bgcolor: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#FAFAF8" }}>
                {TABLE_HEADERS_DONE.map((h) => (
                  <TableCell key={h}
                    sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E0E0D8", py: 1.5 }}
                  >{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {others.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, fontSize: 13, color: "#6B6B6B" }}>
                    Aucune facture traitée
                  </TableCell>
                </TableRow>
              ) : (
                others.map((facture) => (
                  <TableRow key={facture.id} sx={{ height: 48, "&:hover": { bgcolor: "#F5F5F0" }, "&:last-child td": { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{facture.numero || facture.id}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#6B6B6B", borderBottom: "1px solid #E0E0D8" }}>{facture.client_id || "-"}</TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{facture.total_ttc ? Number(facture.total_ttc).toFixed(2) : "-"}</TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #E0E0D8" }}><StatusBadge statut={facture.statut} /></TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#6B6B6B", borderBottom: "1px solid #E0E0D8" }}>{facture.validated_by_admin || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Reject Drawer ── */}
      <Drawer anchor="right" open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, factureId: null })}
        PaperProps={{ sx: { width: 400, bgcolor: "#FFFFFF", borderLeft: "1px solid #E0E0D8", p: 0 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E0E0D8" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>Rejeter la facture</Typography>
          <IconButton onClick={() => setRejectDialog({ open: false, factureId: null })} size="small" sx={{ color: "#6B6B6B" }}><Close fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#6B6B6B", mb: 2.5 }}>
            Voulez-vous vraiment rejeter cette facture ?
          </Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Note (optionnel)
          </Typography>
          <TextField
            id="reject-note"
            fullWidth
            multiline
            rows={4}
            size="small"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Motif du rejet…"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px", fontSize: 13,
                "& fieldset": { borderColor: "#E0E0D8" },
                "&:hover fieldset": { borderColor: "#1C1C1E" },
                "&.Mui-focused fieldset": { borderColor: "#8B2E2E" },
              },
            }}
          />
        </Box>
        <Box sx={{ px: 3, py: 2.5, borderTop: "1px solid #E0E0D8", display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={() => setRejectDialog({ open: false, factureId: null })} variant="outlined"
            sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", borderColor: "#E0E0D8", color: "#1C1C1E", "&:hover": { borderColor: "#1C1C1E", bgcolor: "transparent" } }}
          >
            Annuler
          </Button>
          <Button id="confirm-reject-btn" variant="contained" onClick={handleReject} disabled={processing}
            sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", bgcolor: "#8B2E2E", boxShadow: "none", "&:hover": { bgcolor: "#7a2828", boxShadow: "none" } }}
          >
            {processing ? <CircularProgress size={16} color="inherit" /> : "Confirmer le rejet"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ValidationPage;
