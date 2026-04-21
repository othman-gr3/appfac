import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { getFactures } from "../services/firebaseService";
import { getArticles } from "../services/jsonService";
import { STATUTS } from "../utils/constants";

// ─── KPI Card ────────────────────────────────────────────────
const KpiCard = ({ title, value, subtitle, valueColor }) => (
  <Card
    sx={{
      bgcolor: "#FFFFFF",
      border: "1px solid #E0E0D8",
      borderRadius: "6px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      width: "100%",
      minHeight: 130,
    }}
  >
    <CardContent
      sx={{
        p: "24px 24px 20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        "&:last-child": { pb: "20px" },
      }}
    >
      {/* Label */}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          color: "#6B6B6B",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>

      {/* Value */}
      <Typography
        sx={{
          fontSize: 32,
          fontWeight: 600,
          color: valueColor || "#1C1C1E",
          lineHeight: 1,
          mt: 1.5,
        }}
      >
        {value}
      </Typography>

      {/* Subtitle */}
      <Typography
        sx={{
          fontSize: 11,
          color: "#6B6B6B",
          mt: 1,
          minHeight: 16,
        }}
      >
        {subtitle || ""}
      </Typography>
    </CardContent>
  </Card>
);

// ─── Custom Tooltip for chart ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          p: 1.5,
          border: "1px solid #E0E0D8",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#6B6B6B", mb: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E" }}>
          {Number(payload[0].value).toLocaleString("fr-DZ")} DA
        </Typography>
      </Box>
    );
  }
  return null;
};

// ─── Main Dashboard ───────────────────────────────────────────
const AdminDashboard = () => {
  const [factures, setFactures] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facts, arts] = await Promise.all([getFactures(), getArticles()]);
        setFactures(facts);
        setArticles(arts);
      } catch {
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={28} sx={{ color: "#2D6A4F" }} />
      </Box>
    );
  }

  // ── KPI calculations ──
  const total = factures.length;
  const enAttente = factures.filter((f) => f.statut === STATUTS.EN_ATTENTE).length;
  const payees = factures.filter((f) => f.statut === STATUTS.PAYEE).length;
  const rejetees = factures.filter((f) => f.statut === STATUTS.REJETEE).length;
  const caTotal = factures
    .filter((f) => f.statut === STATUTS.PAYEE)
    .reduce((sum, f) => sum + (Number(f.total_ttc) || 0), 0);

  // ── Monthly chart data ──
  const monthlyMap = {};
  factures
    .filter((f) => f.statut === STATUTS.PAYEE && f.date_creation)
    .forEach((f) => {
      const month = f.date_creation.slice(0, 7);
      monthlyMap[month] = (monthlyMap[month] || 0) + (Number(f.total_ttc) || 0);
    });

  const chartData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ca]) => ({
      month: new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
      ca: Math.round(ca),
    }));

  const displayChart =
    chartData.length > 0
      ? chartData
      : ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"].map((m) => ({ month: m, ca: 0 }));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        gap: 0,
      }}
    >
      {/* Page title */}
      <Typography
        sx={{ fontSize: 16, fontWeight: 600, color: "#1C1C1E", mb: 3 }}
      >
        Tableau de bord
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: "4px" }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards — equal height via alignItems stretch */}
      <Grid container spacing={3} mb={3} alignItems="stretch">
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ display: "flex" }}>
          <KpiCard
            title="Total factures"
            value={total}
            subtitle="toutes statuts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ display: "flex" }}>
          <KpiCard
            title="En attente"
            value={enAttente}
            subtitle="à traiter"
            valueColor="#7A5C1E"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ display: "flex" }}>
          <KpiCard
            title="Payées"
            value={payees}
            subtitle="validées"
            valueColor="#2D6A4F"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ display: "flex" }}>
          <KpiCard
            title="Rejetées"
            value={rejetees}
            subtitle="refusées"
            valueColor="#8B2E2E"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4} sx={{ display: "flex" }}>
          <KpiCard
            title="Chiffre d'affaires"
            value={`${caTotal.toLocaleString("fr-DZ")} DA`}
            subtitle="factures payées"
            valueColor="#2D6A4F"
          />
        </Grid>
      </Grid>

      {/* Monthly CA Chart — fills remaining height */}
      <Card
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E0E0D8",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          p: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1C1C1E", mb: 0.5 }}>
          Chiffre d'affaires mensuel (DA)
        </Typography>
        {chartData.length === 0 && (
          <Typography sx={{ fontSize: 11, color: "#6B6B6B", mb: 2 }}>
            Aucune facture payée pour le moment — données simulées affichées.
          </Typography>
        )}
        <ResponsiveContainer width="100%" height="100%" style={{ flexGrow: 1, minHeight: 260 }}>
          <BarChart data={displayChart} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0D8" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#6B6B6B", paddingTop: 12 }}
            />
            <Bar
              dataKey="ca"
              name="CA (DA)"
              fill="#2D6A4F"
              radius={[2, 2, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
