import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Typography,
  Button,
  Drawer,
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
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Close,
  PersonOutlined,
} from "@mui/icons-material";
import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
} from "../services/firebaseService";

// ── Yup validation schema ────────────────────────────────────
const clientSchema = Yup.object({
  nom: Yup.string().trim().required("Le nom est requis"),
  email: Yup.string()
    .trim()
    .email("Email invalide")
    .required("L'email est requis"),
  tel: Yup.string()
    .trim()
    .matches(/^[0-9+\s\-().]{7,15}$/, "Numéro invalide")
    .required("Le téléphone est requis"),
  adresse: Yup.string().trim().required("L'adresse est requise"),
});

// ── Shared input style (matches project design) ──────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    fontSize: 13,
    bgcolor: "#fff",
    "& fieldset": { borderColor: "#E0E0D8" },
    "&:hover fieldset": { borderColor: "#1C2023" },
    "&.Mui-focused fieldset": { borderColor: "#2D6A4F" },
  },
  "& .MuiFormHelperText-root": { fontSize: 11 },
};

// ── Column header style ──────────────────────────────────────
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

// ────────────────────────────────────────────────────────────
const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create
  const [submitError, setSubmitError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null); // id being deleted

  // ── Load clients ───────────────────────────────────────────
  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // ── Formik setup ───────────────────────────────────────────
  const formik = useFormik({
    initialValues: { nom: "", email: "", tel: "", adresse: "" },
    validationSchema: clientSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        const payload = {
          nom: values.nom.trim(),
          email: values.email.trim(),
          tel: values.tel.trim(),
          adresse: values.adresse.trim(),
        };
        if (editTarget) {
          await updateClient(editTarget.id, payload);
        } else {
          await addClient(payload);
        }
        await loadClients();
        closeDrawer();
      } catch {
        setSubmitError("Une erreur est survenue. Veuillez réessayer.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ── Open drawer for add or edit ────────────────────────────
  const openAddDrawer = () => {
    setEditTarget(null);
    formik.resetForm({ values: { nom: "", email: "", tel: "", adresse: "" } });
    setSubmitError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (client) => {
    setEditTarget(client);
    formik.resetForm({
      values: {
        nom: client.nom ?? "",
        email: client.email ?? "",
        tel: client.tel ?? "",
        adresse: client.adresse ?? "",
      },
    });
    setSubmitError("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditTarget(null);
    formik.resetForm();
    setSubmitError("");
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;
    setDeleteLoading(id);
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeleteLoading(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────
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
            Clients
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.25 }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} enregistré
            {clients.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <Button
          id="add-client-btn"
          variant="contained"
          startIcon={<Add />}
          onClick={openAddDrawer}
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
          Nouveau client
        </Button>
      </Box>

      {/* ── Table ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
          <CircularProgress size={28} sx={{ color: "#2D6A4F" }} />
        </Box>
      ) : clients.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            pt: 10,
            color: "#9CA3AF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PersonOutlined sx={{ fontSize: 40, color: "#D1D5DB" }} />
          <Typography sx={{ fontSize: 14 }}>Aucun client pour l'instant</Typography>
          <Typography sx={{ fontSize: 12 }}>
            Cliquez sur « Nouveau client » pour commencer.
          </Typography>
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
                <TableCell sx={thSx}>Nom</TableCell>
                <TableCell sx={thSx}>Email</TableCell>
                <TableCell sx={thSx}>Téléphone</TableCell>
                <TableCell sx={thSx}>Adresse</TableCell>
                <TableCell sx={{ ...thSx, width: 80, textAlign: "center" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client, idx) => (
                <TableRow
                  key={client.id}
                  sx={{
                    bgcolor: idx % 2 === 0 ? "#fff" : "#FAFAF8",
                    "&:hover": { bgcolor: "#F0F4F1" },
                    transition: "background 0.15s",
                  }}
                >
                  <TableCell
                    sx={{ fontSize: 13, fontWeight: 500, color: "#1C2023", py: 1.25 }}
                  >
                    {client.nom}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25 }}>
                    {client.email}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, color: "#374151", py: 1.25 }}>
                    {client.tel}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 13,
                      color: "#374151",
                      py: 1.25,
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {client.adresse}
                  </TableCell>
                  <TableCell sx={{ py: 1.25, textAlign: "center" }}>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => openEditDrawer(client)}
                        sx={{ color: "#2D6A4F", mr: 0.5 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(client.id)}
                          disabled={deleteLoading === client.id}
                          sx={{ color: "#8B2E2E" }}
                        >
                          {deleteLoading === client.id ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Slide-in Drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: "#F5F5F0",
            p: 0,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: "#1C2023",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#F5F5F0" }}>
            {editTarget ? "Modifier le client" : "Nouveau client"}
          </Typography>
          <IconButton size="small" onClick={closeDrawer} sx={{ color: "rgba(245,245,240,0.55)" }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />

        {/* Form */}
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ flex: 1, overflowY: "auto", px: 3, py: 3, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {submitError && (
            <Alert severity="error" sx={{ fontSize: 13, borderRadius: "4px" }}>
              {submitError}
            </Alert>
          )}

          {/* Nom */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Nom *
            </Typography>
            <TextField
              id="client-nom"
              name="nom"
              fullWidth
              size="small"
              placeholder="Ex : Société Alpha"
              value={formik.values.nom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nom && Boolean(formik.errors.nom)}
              helperText={formik.touched.nom && formik.errors.nom}
              sx={inputSx}
            />
          </Box>

          {/* Email */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email *
            </Typography>
            <TextField
              id="client-email"
              name="email"
              type="email"
              fullWidth
              size="small"
              placeholder="contact@exemple.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={inputSx}
            />
          </Box>

          {/* Téléphone */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Téléphone *
            </Typography>
            <TextField
              id="client-tel"
              name="tel"
              fullWidth
              size="small"
              placeholder="Ex : 0612345678"
              value={formik.values.tel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tel && Boolean(formik.errors.tel)}
              helperText={formik.touched.tel && formik.errors.tel}
              sx={inputSx}
            />
          </Box>

          {/* Adresse */}
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Adresse *
            </Typography>
            <TextField
              id="client-adresse"
              name="adresse"
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Ex : 12 rue des Fleurs, Casablanca"
              value={formik.values.adresse}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adresse && Boolean(formik.errors.adresse)}
              helperText={formik.touched.adresse && formik.errors.adresse}
              sx={inputSx}
            />
          </Box>
        </Box>

        {/* Drawer footer */}
        <Divider sx={{ borderColor: "rgba(0,0,0,0.08)" }} />
        <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={closeDrawer}
            sx={{
              borderRadius: "4px",
              textTransform: "none",
              fontSize: 13,
              borderColor: "#E0E0D8",
              color: "#374151",
              "&:hover": { borderColor: "#1C2023", bgcolor: "transparent" },
            }}
          >
            Annuler
          </Button>
          <Button
            id="client-submit-btn"
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
            onClick={formik.handleSubmit}
            sx={{
              bgcolor: "#2D6A4F",
              color: "#fff",
              borderRadius: "4px",
              boxShadow: "none",
              textTransform: "none",
              fontSize: 13,
              fontWeight: 500,
              "&:hover": { bgcolor: "#245a42", boxShadow: "none" },
              "&:disabled": { bgcolor: "#E0E0D8" },
            }}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : editTarget ? (
              "Enregistrer"
            ) : (
              "Créer"
            )}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ClientsPage;
