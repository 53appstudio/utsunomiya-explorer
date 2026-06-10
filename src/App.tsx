import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useAuth } from "./auth/AuthContext";
import { useLang } from "./i18n/LanguageContext";

import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminTagsPage from "./pages/admin/AdminTagsPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import AdminPostEditPage from "./pages/admin/AdminPostEditPage";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLang();
  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("loading")}</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <div className="p-8 text-center">Forbidden</div>;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/admin/post/:id" element={<PostDetailPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
          <Route path="/admin/categories" element={<RequireAdmin><AdminCategoriesPage /></RequireAdmin>} />
          <Route path="/admin/tags" element={<RequireAdmin><AdminTagsPage /></RequireAdmin>} />
          <Route path="/admin/posts" element={<RequireAdmin><AdminPostsPage /></RequireAdmin>} />
          <Route path="/admin/posts/new" element={<RequireAdmin><AdminPostEditPage /></RequireAdmin>} />
          <Route path="/admin/posts/:id" element={<RequireAdmin><AdminPostEditPage /></RequireAdmin>} />
          <Route path="*" element={<div className="p-8 text-center">404</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
