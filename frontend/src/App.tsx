import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { AddMealPage } from '@/pages/AddMealPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FoodsPage } from '@/pages/FoodsPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AppDataProvider } from '@/store/AppDataProvider';
import { AuthProvider } from '@/store/AuthProvider';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login fuera del layout: pantalla a página completa, sin navegación */}
          <Route path="/login" element={<LoginPage />} />

          {/* El store cuelga de aquí dentro: sin sesión no hay datos que pedir */}
          <Route element={<RequireAuth />}>
            <Route
              element={
                <AppDataProvider>
                  <AppLayout />
                </AppDataProvider>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/registrar" element={<AddMealPage />} />
              <Route path="/alimentos" element={<FoodsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
