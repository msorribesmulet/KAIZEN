import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { AddMealPage } from '@/pages/AddMealPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FoodsPage } from '@/pages/FoodsPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AppDataProvider } from '@/store/AppDataProvider';

export function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          {/* Login fuera del layout: pantalla a página completa, sin navegación */}
          <Route path="/login" element={<LoginPage />} />

          {/* TODO: conectar con API — envolver estas rutas en un <RequireAuth>
              que compruebe el token y redirija a /login si no hay sesión. */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/registrar" element={<AddMealPage />} />
            <Route path="/alimentos" element={<FoodsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}
