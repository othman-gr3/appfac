import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Admin
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ArticlesPage from "./pages/ArticlesPage";
import CategoriesPage from "./pages/CategoriesPage";
import ValidationPage from "./pages/ValidationPage";

// User (Hiba's pages)
import UserLayout from "./components/UserLayout";
import UserDashboard from "./pages/UserDashboard";
import ClientsPage from "./pages/ClientsPage";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import InvoiceListPage from "./pages/InvoiceListPage";

import LoginPage from "./pages/LoginPage";

const Unauthorized = () => (
  <h2 style={{ padding: 24 }}>Accès refusé.</h2>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin protected routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<ArticlesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="validation" element={<ValidationPage />} />
          </Route>

          {/* User protected routes (any logged-in user) */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="nouvelle-facture" element={<InvoiceForm />} />
            <Route path="factures" element={<InvoiceListPage />} />
            <Route path="factures/:id" element={<InvoiceDetailPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
