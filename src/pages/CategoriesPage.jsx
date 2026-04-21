import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Alert, CircularProgress, Drawer,
} from "@mui/material";
import { Add, Edit, Delete, Close } from "@mui/icons-material";
import { getCategories, createCategorie, updateCategorie, deleteCategorie } from "../services/jsonService";

const emptyForm = { nom: "" };

const FieldLabel = ({ children }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
    {children}
  </Typography>
);

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError("Erreur lors du chargement des catégories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (cat) => { setEditingId(cat.id); setForm({ nom: cat.nom }); setOpen(true); };
  const handleClose = () => { setOpen(false); setError(""); };

  const handleSave = async () => {
    if (!form.nom.trim()) { setError("Le nom est obligatoire."); return; }
    setSaving(true);
    try {
      if (editingId) { await updateCategorie(editingId, form); } else { await createCategorie(form); }
      await fetchData();
      handleClose();
    } catch {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategorie(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress size={28} sx={{ color: "#2D6A4F" }} /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E" }}>Catégories</Typography>
        <Button
          id="add-categorie-btn"
          variant="contained"
          startIcon={<Add fontSize="small" />}
          onClick={openAdd}
          sx={{
            bgcolor: "#2D6A4F", color: "#F5F5F0", borderRadius: "4px", fontSize: 13,
            fontWeight: 500, textTransform: "none", boxShadow: "none",
            "&:hover": { bgcolor: "#245a42", boxShadow: "none" },
          }}
        >
          Ajouter une catégorie
        </Button>
      </Box>

      {error && !open && <Alert severity="error" sx={{ mb: 2, borderRadius: "4px", fontSize: 13 }}>{error}</Alert>}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ bgcolor: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#FAFAF8" }}>
              {["ID", "Nom", "Actions"].map((h, i) => (
                <TableCell
                  key={h}
                  align={i === 2 ? "center" : "left"}
                  sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E0E0D8", py: 1.5 }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 5, fontSize: 13, color: "#6B6B6B" }}>
                  Aucune catégorie trouvée
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id} sx={{ height: 48, "&:hover": { bgcolor: "#F5F5F0" }, "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ fontSize: 13, color: "#6B6B6B", borderBottom: "1px solid #E0E0D8", width: 80 }}>{cat.id}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{cat.nom}</TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #E0E0D8" }}>
                    <IconButton id={`edit-cat-${cat.id}`} size="small" onClick={() => openEdit(cat)} sx={{ color: "#1C1C1E", mr: 0.5 }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton id={`delete-cat-${cat.id}`} size="small" onClick={() => setDeleteId(cat.id)} sx={{ color: "#8B2E2E" }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Add / Edit Drawer ── */}
      <Drawer anchor="right" open={open} onClose={handleClose}
        PaperProps={{ sx: { width: 380, bgcolor: "#FFFFFF", borderLeft: "1px solid #E0E0D8", p: 0 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E0E0D8" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>
            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#6B6B6B" }}><Close fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: "4px", fontSize: 13 }}>{error}</Alert>}
          <FieldLabel>Nom *</FieldLabel>
          <TextField
            id="categorie-nom"
            name="nom"
            value={form.nom}
            onChange={(e) => setForm({ nom: e.target.value })}
            fullWidth
            size="small"
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px", fontSize: 13,
                "& fieldset": { borderColor: "#E0E0D8" },
                "&:hover fieldset": { borderColor: "#1C1C1E" },
                "&.Mui-focused fieldset": { borderColor: "#2D6A4F" },
              },
            }}
          />
        </Box>
        <Box sx={{ px: 3, py: 2.5, borderTop: "1px solid #E0E0D8", display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", borderColor: "#E0E0D8", color: "#1C1C1E", "&:hover": { borderColor: "#1C1C1E", bgcolor: "transparent" } }}>
            Annuler
          </Button>
          <Button id="save-categorie-btn" variant="contained" onClick={handleSave} disabled={saving}
            sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", bgcolor: "#2D6A4F", boxShadow: "none", "&:hover": { bgcolor: "#245a42", boxShadow: "none" } }}
          >
            {saving ? <CircularProgress size={16} color="inherit" /> : "Enregistrer"}
          </Button>
        </Box>
      </Drawer>

      {/* ── Delete Confirm Drawer ── */}
      <Drawer anchor="right" open={!!deleteId} onClose={() => setDeleteId(null)}
        PaperProps={{ sx: { width: 360, bgcolor: "#FFFFFF", borderLeft: "1px solid #E0E0D8", p: 0 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E0E0D8" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>Confirmer la suppression</Typography>
          <IconButton onClick={() => setDeleteId(null)} size="small" sx={{ color: "#6B6B6B" }}><Close fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>Voulez-vous vraiment supprimer cette catégorie ? Cette action est irréversible.</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5, borderTop: "1px solid #E0E0D8", display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", borderColor: "#E0E0D8", color: "#1C1C1E", "&:hover": { borderColor: "#1C1C1E", bgcolor: "transparent" } }}>
            Annuler
          </Button>
          <Button id="confirm-delete-cat" variant="contained" onClick={handleDelete}
            sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", bgcolor: "#8B2E2E", boxShadow: "none", "&:hover": { bgcolor: "#7a2828", boxShadow: "none" } }}
          >
            Supprimer
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default CategoriesPage;
