import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
} from "@mui/material";
import {
  Receipt, HourglassEmpty, CheckCircle, Cancel, TrendingUp,
} from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { getFactures } from "../services/firebaseService";
import { getArticles } from "../services/jsonService";
import { STATUTS } from "../utils/constants";

// ─── KPI Card ────────────────────────────────────────────────
const KpiCard = ({ title, value, icon, color, subtitle }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      background: "white",
      overflow: "visible",
      position: "relative",
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color: color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${color}18`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Custom Tooltip for chart ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: "white", p: 1.5, borderRadius: 2, boxShadow: 3, border: "1px solid #e0e0e0" }}>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" color="#6c63ff">
          CA: {Number(payload[0].value).toLocaleString("fr-DZ")} DA
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
        <CircularProgress />
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

  // ── Monthly chart data (group payée factures by month) ──
  const monthlyMap = {};
  factures
    .filter((f) => f.statut === STATUTS.PAYEE && f.date_creation)
    .forEach((f) => {
      const month = f.date_creation.slice(0, 7); // "2024-03"
      monthlyMap[month] = (monthlyMap[month] || 0) + (Number(f.total_ttc) || 0);
    });

  const chartData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ca]) => ({
      month: new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
      ca: Math.round(ca),
    }));

  // Fallback: show placeholder months if no data yet
  const displayChart =
    chartData.length > 0
      ? chartData
      : ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"].map((m) => ({ month: m, ca: 0 }));

  return (
    <Box>
      {/* Title */}
      <Typography variant="h5" fontWeight={700} mb={3}>
        Tableau de bord
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <KpiCard
            title="Total factures"
            value={total}
            icon={<Receipt sx={{ color: "#6c63ff" }} />}
            color="#6c63ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <KpiCard
            title="En attente"
            value={enAttente}
            icon={<HourglassEmpty sx={{ color: "#f59e0b" }} />}
            color="#f59e0b"
            subtitle="à traiter"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <KpiCard
            title="Payées"
            value={payees}
            icon={<CheckCircle sx={{ color: "#10b981" }} />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <KpiCard
            title="Rejetées"
            value={rejetees}
            icon={<Cancel sx={{ color: "#ef4444" }} />}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <KpiCard
            title="Chiffre d'affaires"
            value={`${caTotal.toLocaleString("fr-DZ")} DA`}
            icon={<TrendingUp sx={{ color: "#3b82f6" }} />}
            color="#3b82f6"
            subtitle="factures payées"
          />
        </Grid>
      </Grid>

      {/* Monthly CA Chart */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Chiffre d'affaires mensuel (DA)
        </Typography>
        {chartData.length === 0 && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            Aucune facture payée pour le moment — données simulées affichées.
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={displayChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="ca"
              name="CA (DA)"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c63ff" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
