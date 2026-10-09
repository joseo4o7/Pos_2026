import { useState } from "react";
import Layout from "../components/layout/Layout";
import POS from "./POS";
import UsersManager from "../components/UsersManager";
import History from "../components/History";
import Products from "../components/Products";
import Reports from "../components/Reports";
import Settings from "../components/Settings";

function Dashboard({
  user,
  montoBase,
  setMontoBase,
  onLogout,
}) {
  const [page, setPage] = useState("pos");

  return (
    <Layout
      user={user}
      page={page}
      setPage={setPage}
      onLogout={onLogout}
    >
      {page === "dashboard" && (
        <h2>🏠 Bienvenido a Punto Electrónico</h2>
      )}

      {/* Se pasan user y montoBase al componente POS */}
      {page === "pos" && (
       <POS
  user={user}
  montoBase={montoBase}
  setMontoBase={setMontoBase}
  onLogout={onLogout}
/>
      )}

     {page === "products" && (
  <Products user={user} />
)}

     {page === "history" && (
  <History user={user} />
)}

      {/* Panel real de Gestión de Usuarios */}
      {page === "users" && <UsersManager />}

      {page === "reports" && <Reports user={user} />}

      {page === "settings" && <Settings user={user} />}
    </Layout>
  );
}

export default Dashboard;