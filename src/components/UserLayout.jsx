import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logAppfac.png";
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Dashboard,
  AddCircleOutlined,
  ListAlt,
  Logout,
  People,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const DRAWER_WIDTH = 240;

const navItems = [
  { text: "Dashboard", icon: <Dashboard fontSize="small" />, path: "/user" },
  {
    text: "Nouvelle facture",
    icon: <AddCircleOutlined fontSize="small" />,
    path: "/user/nouvelle-facture",
  },
  {
    text: "Mes factures",
    icon: <ListAlt fontSize="small" />,
    path: "/user/factures",
  },
  {
    text: "Clients",
    icon: <People fontSize="small" />,
    path: "/user/clients",
  },
];

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Show first letter of email as avatar
  const avatarLetter = currentUser?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F5F5F0" }}>
      {/* ── Sidebar ── */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#1C2023",
            color: "#F5F5F0",
            borderRight: "none",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Brand / Logo */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 3,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="AppFac"
            sx={{ width: 150, height: "auto", display: "block" }}
          />
        </Box>

        {/* User info badge */}
        <Box
          sx={{
            mx: 2,
            mb: 2,
            p: 1.5,
            bgcolor: "rgba(245,245,240,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: "#2D6A4F",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              sx={{
                fontSize: 11,
                color: "rgba(245,245,240,0.4)",
                lineHeight: 1.2,
              }}
            >
              Connecté en tant que
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "#F5F5F0",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentUser?.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(245,245,240,0.08)" }} />

        {/* Nav links */}
        <List sx={{ pt: 1.5, px: 1, flexGrow: 1 }} disablePadding>
          {navItems.map((item) => {
            // Active if exact match or starts with path (for nested routes)
            const isActive =
              item.path === "/user"
                ? location.pathname === "/user"
                : location.pathname.startsWith(item.path);

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    bgcolor: isActive ? "#2D6A4F" : "transparent",
                    "&:hover": {
                      bgcolor: isActive
                        ? "#2D6A4F"
                        : "rgba(245,245,240,0.06)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive
                        ? "#F5F5F0"
                        : "rgba(245,245,240,0.45)",
                      minWidth: 32,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? "#F5F5F0" : "rgba(245,245,240,0.6)",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Logout */}
        <Box sx={{ px: 1, pb: 2 }}>
          <Divider sx={{ borderColor: "rgba(245,245,240,0.08)", mb: 1.5 }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 0,
              px: 2,
              py: 1,
              "&:hover": { bgcolor: "rgba(139,46,46,0.18)" },
            }}
          >
            <ListItemIcon sx={{ color: "#8B2E2E", minWidth: 32 }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Déconnexion"
              primaryTypographyProps={{
                fontSize: 13,
                fontWeight: 400,
                color: "#8B2E2E",
              }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* ── Main content ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          minHeight: "100vh",
          bgcolor: "#F5F5F0",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;
