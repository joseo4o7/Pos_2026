import { useEffect, useState } from "react";
import axios from "axios";

import Setup from "./pages/Setup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// =====================================================
// INTERCEPTOR DE AUTENTICACIÓN
// =====================================================

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// APP
// =====================================================

function App() {
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Usuario actualmente conectado
  const [user, setUser] = useState(null);

  // =====================================================
  // MONTO BASE DE CAJA
  // =====================================================

  const [montoBase, setMontoBase] = useState(() => {
    const savedMonto = localStorage.getItem("montoBase");

    return savedMonto !== null
      ? Number(savedMonto)
      : 0;
  });

  // =====================================================
  // COMPROBAR SI EL SISTEMA YA FUE CONFIGURADO
  // =====================================================

  useEffect(() => {
    checkSystem();
  }, []);

  const checkSystem = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/settings/status`
      );

      setInitialized(response.data.initialized);
    } catch (error) {
      console.error(
        "Error al conectar con el servidor:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (userData, token) => {
    setUser(userData);

    if (token) {
      localStorage.setItem("token", token);
    }
  };

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleLogout = () => {
    setUser(null);

    // Limpiar token
    localStorage.removeItem("token");

    // Limpiar monto base
    localStorage.removeItem("montoBase");
    setMontoBase(0);
  };

  // =====================================================
  // PANTALLA DE CARGA
  // =====================================================

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h2>Cargando POS...</h2>
      </div>
    );
  }

  // =====================================================
  // PRIMER USO DEL SISTEMA
  // =====================================================

  if (!initialized) {
    return <Setup onFinish={checkSystem} />;
  }

  // =====================================================
  // LOGIN
  // =====================================================

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // =====================================================
  // DASHBOARD / POS
  // =====================================================

  return (
    <Dashboard
      user={user}
      montoBase={montoBase}
      setMontoBase={setMontoBase}
      onLogout={handleLogout}
    />
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f6f8",
    fontFamily: "sans-serif",
  },
};

export default App;