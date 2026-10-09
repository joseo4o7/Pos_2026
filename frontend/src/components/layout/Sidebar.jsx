import React from "react";

// ==========================================
// SIDEBAR
// El cierre se abre dentro del POS porque
// allí conocemos la Caja 1 / Caja 2 activa.
// ==========================================

function Sidebar({ page, setPage, currentUser = null }) {
  // ==========================================
  // USUARIO Y PERMISOS
  // ==========================================

  const isSuperUser =
    !currentUser ||
    currentUser?.role === "SuperUsuario" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "superadmin";

  const permissions = currentUser?.permissions || {};

  // ==========================================
  // PERMISOS
  // ==========================================

  const canAccessPOS =
    isSuperUser ||
    permissions.pos ||
    permissions.openRegister;

  const canAccessProducts =
    isSuperUser ||
    permissions.products ||
    permissions.addProducts ||
    permissions.editProducts ||
    permissions.deleteProducts;

  const canAccessHistory =
    isSuperUser ||
    permissions.history ||
    permissions.viewHistory;

  const canAccessUsers =
    isSuperUser ||
    permissions.users ||
    permissions.manageUsers;

  const canAccessReports =
    isSuperUser ||
    permissions.reports ||
    permissions.viewReports;

  const canCloseRegister =
    isSuperUser ||
    permissions.closeRegister;

  // ==========================================
  // ABRIR CIERRE DESDE EL POS
  // ==========================================

  const openCloseRegister = () => {
    // Primero llevamos al usuario al POS.
    setPage("pos");

    // Luego de montar/mostrar el POS, le avisamos
    // que debe abrir el modal de Cierre de Caja.
    window.setTimeout(() => {
      window.dispatchEvent(
        new Event("open-cash-register-close")
      );
    }, 100);
  };

  // ==========================================
  // SIDEBAR
  // ==========================================

  return (
    <div className="sidebar">

      <h2>TOCAGÓN_POS</h2>

      {/* INICIO */}
      <button
        type="button"
        onClick={() => setPage("dashboard")}
      >
        🏠 Inicio
      </button>

      {/* PUNTO DE VENTA */}
      {canAccessPOS && (
        <button
          type="button"
          onClick={() => setPage("pos")}
        >
          🛒 Punto de Venta
        </button>
      )}

      {/* PRODUCTOS */}
      {canAccessProducts && (
        <button
          type="button"
          onClick={() => setPage("products")}
        >
          📦 Productos
        </button>
      )}

      {/* HISTORIAL */}
      {canAccessHistory && (
        <button
          type="button"
          onClick={() => setPage("history")}
        >
          📜 Historial
        </button>
      )}

      {/* USUARIOS */}
      {canAccessUsers && (
        <button
          type="button"
          onClick={() => setPage("users")}
        >
          👥 Usuarios
        </button>
      )}

      {/* REPORTES */}
      {canAccessReports && (
        <button
          type="button"
          onClick={() => setPage("reports")}
        >
          📊 Reportes
        </button>
      )}

      {/* CONFIGURACIÓN */}
      {currentUser?.role === "superadmin" && (
        <button onClick={() => setPage("settings")}>
          ⚙️ Configuración
        </button>
      )}

      {/* CIERRE DE CAJA */}
      {canCloseRegister && (
        <button
          type="button"
          onClick={openCloseRegister}
          style={{
            marginTop: "auto",
            background: "#ef4444",
            color: "white",
            fontWeight: "bold",
          }}
        >
          🔒 Cierre de Caja
        </button>
      )}

    </div>
  );
}

export default Sidebar;
