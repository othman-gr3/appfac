import { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Chip, Alert, CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
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

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirm dialog
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

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (article) => {
    setEditingId(article.id);
    setForm({
      nom: article.nom,
      description: article.description,
      prix_ht: article.prix_ht,
      categorie_id: article.categorie_id,
      tva_type: article.tva_type,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.nom || !form.prix_ht || !form.categorie_id || !form.tva_type) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, prix_ht: parseFloat(form.prix_ht) };
      if (editingId) {
        await updateArticle(editingId, data);
      } else {
        await createArticle(data);
      }
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

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Articles</Typography>
        <Button
          id="add-article-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{ borderRadius: 2, background: "linear-gradient(135deg, #6c63ff, #3b82f6)" }}
        >
          Ajouter un article
        </Button>
      </Box>

      {error && !open && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Prix HT (DA)</strong></TableCell>
              <TableCell><strong>TVA</strong></TableCell>
              <TableCell><strong>Catégorie</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id} hover>
                  <TableCell>{article.nom}</TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>{article.description}</TableCell>
                  <TableCell>{Number(article.prix_ht).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={TVA_LABELS[article.tva_type] || article.tva_type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{getCatNom(article.categorie_id)}</TableCell>
                  <TableCell align="center">
                    <IconButton id={`edit-article-${article.id}`} color="primary" onClick={() => openEdit(article)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton id={`delete-article-${article.id}`} color="error" onClick={() => setDeleteId(article.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Modifier l'article" : "Ajouter un article"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField id="article-nom" name="nom" label="Nom *" value={form.nom} onChange={handleChange} fullWidth />
          <TextField id="article-desc" name="description" label="Description" value={form.description} onChange={handleChange} fullWidth multiline rows={2} />
          <TextField id="article-prix" name="prix_ht" label="Prix HT (DA) *" type="number" value={form.prix_ht} onChange={handleChange} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Catégorie *</InputLabel>
            <Select id="article-cat" name="categorie_id" value={form.categorie_id} onChange={handleChange} label="Catégorie *">
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Type TVA *</InputLabel>
            <Select id="article-tva" name="tva_type" value={form.tva_type} onChange={handleChange} label="Type TVA *">
              {Object.entries(TVA_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Annuler</Button>
          <Button id="save-article-btn" variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous vraiment supprimer cet article ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button id="confirm-delete-article" variant="contained" color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArticlesPage;
