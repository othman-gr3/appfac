import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, TextField, Select, MenuItem,
  FormControl, Chip, Alert, CircularProgress, Drawer,
} from "@mui/material";
import { Add, Edit, Delete, Close } from "@mui/icons-material";
import {
  getArticles, createArticle, updateArticle, deleteArticle,
} from "../services/jsonService";
import { getCategories } from "../services/jsonService";
import { TVA_LABELS } from "../utils/constants";

const emptyForm = {
  nom: "",
  description: "",
  prix_ht: "",
  categorie_id: "",
  tva_type: "",
};

// Shared label above inputs
const FieldLabel = ({ children }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
    {children}
  </Typography>
);

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Drawer state
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      const [arts, cats] = await Promise.all([getArticles(), getCategories()]);
      setArticles(arts);
      setCategories(cats);
    } catch {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (article) => {
    setEditingId(article.id);
    setForm({ nom: article.nom, description: article.description, prix_ht: article.prix_ht, categorie_id: article.categorie_id, tva_type: article.tva_type });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setError(""); };
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.nom || !form.prix_ht || !form.categorie_id || !form.tva_type) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, prix_ht: parseFloat(form.prix_ht) };
      if (editingId) { await updateArticle(editingId, data); } else { await createArticle(data); }
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
      await deleteArticle(deleteId);
      setDeleteId(null);
      await fetchData();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const getCatNom = (id) => categories.find((c) => c.id === id)?.nom || "-";

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress size={28} sx={{ color: "#2D6A4F" }} /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E" }}>Articles</Typography>
        <Button
          id="add-article-btn"
          variant="contained"
          startIcon={<Add fontSize="small" />}
          onClick={openAdd}
          sx={{
            bgcolor: "#2D6A4F", color: "#F5F5F0", borderRadius: "4px", fontSize: 13,
            fontWeight: 500, textTransform: "none", boxShadow: "none",
            "&:hover": { bgcolor: "#245a42", boxShadow: "none" },
          }}
        >
          Ajouter un article
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
              {["Nom", "Description", "Prix HT (DA)", "TVA", "Catégorie", "Actions"].map((h, i) => (
                <TableCell
                  key={h}
                  align={i === 5 ? "center" : "left"}
                  sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E0E0D8", py: 1.5 }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, fontSize: 13, color: "#6B6B6B" }}>
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow
                  key={article.id}
                  sx={{ height: 48, "&:hover": { bgcolor: "#F5F5F0" }, "&:last-child td": { borderBottom: 0 } }}
                >
                  <TableCell sx={{ fontSize: 13, fontWeight: 500, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{article.nom}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: "#6B6B6B", borderBottom: "1px solid #E0E0D8" }}>{article.description || "-"}</TableCell>
                  <TableCell sx={{ fontSize: 13, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{Number(article.prix_ht).toFixed(2)}</TableCell>
                  <TableCell sx={{ borderBottom: "1px solid #E0E0D8" }}>
                    <Chip
                      label={TVA_LABELS[article.tva_type] || article.tva_type}
                      size="small"
                      sx={{ fontSize: 11, height: 22, borderRadius: "4px", bgcolor: "#F5F5F0", color: "#1C1C1E", border: "1px solid #E0E0D8", fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "#1C1C1E", borderBottom: "1px solid #E0E0D8" }}>{getCatNom(article.categorie_id)}</TableCell>
                  <TableCell align="center" sx={{ borderBottom: "1px solid #E0E0D8" }}>
                    <IconButton id={`edit-article-${article.id}`} size="small" onClick={() => openEdit(article)} sx={{ color: "#1C1C1E", mr: 0.5 }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton id={`delete-article-${article.id}`} size="small" onClick={() => setDeleteId(article.id)} sx={{ color: "#8B2E2E" }}>
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
        PaperProps={{ sx: { width: 420, bgcolor: "#FFFFFF", borderLeft: "1px solid #E0E0D8", p: 0 } }}
      >
        {/* Drawer header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E0E0D8" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>
            {editingId ? "Modifier l'article" : "Nouvel article"}
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#6B6B6B" }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer body */}
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5, overflowY: "auto", flexGrow: 1 }}>
          {error && <Alert severity="error" sx={{ borderRadius: "4px", fontSize: 13 }}>{error}</Alert>}

          <Box>
            <FieldLabel>Nom *</FieldLabel>
            <TextField id="article-nom" name="nom" value={form.nom} onChange={handleChange} fullWidth size="small" sx={inputStyle} />
          </Box>
          <Box>
            <FieldLabel>Description</FieldLabel>
            <TextField id="article-desc" name="description" value={form.description} onChange={handleChange} fullWidth size="small" multiline rows={2} sx={inputStyle} />
          </Box>
          <Box>
            <FieldLabel>Prix HT (DA) *</FieldLabel>
            <TextField id="article-prix" name="prix_ht" type="number" value={form.prix_ht} onChange={handleChange} fullWidth size="small" sx={inputStyle} />
          </Box>
          <Box>
            <FieldLabel>Catégorie *</FieldLabel>
            <FormControl fullWidth size="small">
              <Select id="article-cat" name="categorie_id" value={form.categorie_id} onChange={handleChange} displayEmpty sx={{ borderRadius: "4px", fontSize: 13 }}>
                <MenuItem value="" disabled><em style={{ color: "#6B6B6B", fontSize: 13 }}>Sélectionner…</em></MenuItem>
                {categories.map((c) => <MenuItem key={c.id} value={c.id} sx={{ fontSize: 13 }}>{c.nom}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FieldLabel>Type TVA *</FieldLabel>
            <FormControl fullWidth size="small">
              <Select id="article-tva" name="tva_type" value={form.tva_type} onChange={handleChange} displayEmpty sx={{ borderRadius: "4px", fontSize: 13 }}>
                <MenuItem value="" disabled><em style={{ color: "#6B6B6B", fontSize: 13 }}>Sélectionner…</em></MenuItem>
                {Object.entries(TVA_LABELS).map(([key, label]) => <MenuItem key={key} value={key} sx={{ fontSize: 13 }}>{label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Drawer footer */}
        <Box sx={{ px: 3, py: 2.5, borderTop: "1px solid #E0E0D8", display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", borderColor: "#E0E0D8", color: "#1C1C1E", "&:hover": { borderColor: "#1C1C1E", bgcolor: "transparent" } }}>
            Annuler
          </Button>
          <Button id="save-article-btn" variant="contained" onClick={handleSave} disabled={saving}
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
          <Typography sx={{ fontSize: 13, color: "#6B6B6B" }}>Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2.5, borderTop: "1px solid #E0E0D8", display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", borderColor: "#E0E0D8", color: "#1C1C1E", "&:hover": { borderColor: "#1C1C1E", bgcolor: "transparent" } }}>
            Annuler
          </Button>
          <Button id="confirm-delete-article" variant="contained" onClick={handleDelete}
            sx={{ borderRadius: "4px", fontSize: 13, fontWeight: 500, textTransform: "none", bgcolor: "#8B2E2E", boxShadow: "none", "&:hover": { bgcolor: "#7a2828", boxShadow: "none" } }}
          >
            Supprimer
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    fontSize: 13,
    "& fieldset": { borderColor: "#E0E0D8" },
    "&:hover fieldset": { borderColor: "#1C1C1E" },
    "&.Mui-focused fieldset": { borderColor: "#2D6A4F" },
  },
};

export default ArticlesPage;
