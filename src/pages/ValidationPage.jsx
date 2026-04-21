import { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress,
  Stack,
} from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { getFactures, updateFactureStatut } from "../services/firebaseService";
import { useAuth } from "../contexts/AuthContext";
import { STATUTS, STATUTS_LABELS, STATUTS_COLORS } from "../utils/constants";

const ValidationPage = () => {
  const { currentUser } = useAuth();
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reject dialog state
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

  useEffect(() => {
    fetchFactures();
  }, []);

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

  const openRejectDialog = (factureId) => {
    setRejectNote("");
    setRejectDialog({ open: true, factureId });
  };

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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pending = factures.filter((f) => f.statut === STATUTS.EN_ATTENTE);
  const others = factures.filter((f) => f.statut !== STATUTS.EN_ATTENTE);

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" fontWeight={700} mb={3}>
        Validation des factures
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Pending factures */}
      <Typography variant="h6" fontWeight={600} mb={1} sx={{ color: "#f59e0b" }}>
        En attente ({pending.length})
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", mb: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#fffbeb" }}>
            <TableRow>
              <TableCell><strong>Numéro</strong></TableCell>
              <TableCell><strong>Client ID</strong></TableCell>
              <TableCell><strong>Total TTC (DA)</strong></TableCell>
              <TableCell><strong>Date dépôt</strong></TableCell>
              <TableCell><strong>Type virement</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pending.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Aucune facture en attente
                </TableCell>
              </TableRow>
            ) : (
              pending.map((facture) => (
                <TableRow key={facture.id} hover>
                  <TableCell fontWeight={600}>{facture.numero || facture.id}</TableCell>
                  <TableCell>{facture.client_id || "-"}</TableCell>
                  <TableCell>{facture.total_ttc ? Number(facture.total_ttc).toFixed(2) : "-"}</TableCell>
                  <TableCell>{facture.date_depot || "-"}</TableCell>
                  <TableCell>{facture.type_virement || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={STATUTS_LABELS[facture.statut]}
                      color={STATUTS_COLORS[facture.statut]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        id={`approve-${facture.id}`}
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(facture.id)}
                        disabled={processing}
                        sx={{ borderRadius: 2 }}
                      >
                        Approuver
                      </Button>
                      <Button
                        id={`reject-${facture.id}`}
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => openRejectDialog(facture.id)}
                        disabled={processing}
                        sx={{ borderRadius: 2 }}
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

      {/* Already processed factures */}
      <Typography variant="h6" fontWeight={600} mb={1} sx={{ color: "text.secondary" }}>
        Factures traitées ({others.length})
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell><strong>Numéro</strong></TableCell>
              <TableCell><strong>Client ID</strong></TableCell>
              <TableCell><strong>Total TTC (DA)</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Validé par</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {others.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Aucune facture traitée
                </TableCell>
              </TableRow>
            ) : (
              others.map((facture) => (
                <TableRow key={facture.id} hover>
                  <TableCell>{facture.numero || facture.id}</TableCell>
                  <TableCell>{facture.client_id || "-"}</TableCell>
                  <TableCell>{facture.total_ttc ? Number(facture.total_ttc).toFixed(2) : "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={STATUTS_LABELS[facture.statut]}
                      color={STATUTS_COLORS[facture.statut]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "text.secondary" }}>
                    {facture.validated_by_admin || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, factureId: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Rejeter la facture</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Voulez-vous vraiment rejeter cette facture ?
          </Typography>
          <TextField
            id="reject-note"
            label="Note (optionnel)"
            fullWidth
            multiline
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Motif du rejet..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialog({ open: false, factureId: null })}>Annuler</Button>
          <Button
            id="confirm-reject-btn"
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={processing}
          >
            {processing ? <CircularProgress size={20} /> : "Confirmer le rejet"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ValidationPage;
