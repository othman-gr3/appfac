import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Inventory2,
  Category,
  Receipt,
  Dashboard,
  Logout,
  FactCheck,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const DRAWER_WIDTH = 240;

const navItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/admin" },
  { text: "Articles", icon: <Inventory2 />, path: "/admin/articles" },
  { text: "Catégories", icon: <Category />, path: "/admin/categories" },
  { text: "Validation", icon: <FactCheck />, path: "/admin/validation" },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f0f2f5" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
            color: "white",
            borderRight: "none",
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#6c63ff" }}>
            AppFac
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            Admin Panel
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Nav links */}
        <List sx={{ pt: 2 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? "rgba(108,99,255,0.2)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ color: isActive ? "#6c63ff" : "rgba(255,255,255,0.5)", minWidth: 36 }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "white" : "rgba(255,255,255,0.6)",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Logout */}
        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 1 }} />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", px: 1 }}>
            {currentUser?.email}
          </Typography>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mt: 1,
              "&:hover": { bgcolor: "rgba(255,80,80,0.15)" },
            }}
          >
            <ListItemIcon sx={{ color: "#ef5350", minWidth: 36 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary="Déconnexion"
              primaryTypographyProps={{ fontSize: 14, color: "#ef5350" }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
