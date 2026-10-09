import React, { useState, useEffect } from "react";
import axios from "axios";

// =====================================================
// PERMISOS QUE COINCIDEN CON models/User.js
// =====================================================

const initialPermissions = {
  addProducts: false,
  editProducts: false,
  deleteProducts: false,
  viewHistory: false,
  viewReports: false,
  manageUsers: false,
  editPrices: false,
  discounts: false,
  refunds: false,
  openRegister: true,
  closeRegister: false,
};

// =====================================================
// COMPONENTE
// =====================================================

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "cajero",
    permissions: { ...initialPermissions },
  });

  // =====================================================
  // OBTENER USUARIOS
  // =====================================================

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users`
      );

      setUsers(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);

      if (err.response) {
        console.error(
          "Respuesta servidor:",
          err.response.data
        );
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================================================
  // CAMBIAR PERMISOS
  // =====================================================

  const handlePermissionChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  // =====================================================
  // EDITAR USUARIO
  // =====================================================

  const handleEditClick = (user) => {
    setSelectedUser(user);

    setFormData({
      fullName: user.fullName || "",
      username: user.username || "",
      password: "",
      role: user.role || "cajero",

      permissions: {
        ...initialPermissions,
        ...(user.permissions || {}),
      },
    });
  };

  // =====================================================
  // LIMPIAR FORMULARIO
  // =====================================================

  const resetForm = () => {
    setSelectedUser(null);

    setFormData({
      fullName: "",
      username: "",
      password: "",
      role: "cajero",
      permissions: { ...initialPermissions },
    });
  };

  // =====================================================
  // CREAR / ACTUALIZAR USUARIO
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // -----------------------------------------------
      // NORMALIZAR DATOS
      // -----------------------------------------------

      const dataToSend = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
        role: formData.role,
        permissions: formData.permissions,
      };

      // La contraseña solamente se manda al crear
      // o cuando estamos editando y se escribió una nueva.
      if (!selectedUser || formData.password.trim() !== "") {
        dataToSend.password = formData.password;
      }

      console.log(
        "DATOS ENVIADOS AL SERVIDOR:",
        dataToSend
      );

      // -----------------------------------------------
      // CREAR
      // -----------------------------------------------

      if (!selectedUser) {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users`,
          dataToSend
        );

        console.log(
          "USUARIO CREADO:",
          response.data
        );

        alert("¡Usuario creado exitosamente!");
      }

      // -----------------------------------------------
      // EDITAR
      // -----------------------------------------------

      else {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/${selectedUser._id}`,
          dataToSend
        );

        console.log(
          "USUARIO ACTUALIZADO:",
          response.data
        );

        alert("¡Usuario actualizado correctamente!");
      }

      resetForm();
      fetchUsers();

    } catch (error) {
      console.error(
        "ERROR AL GUARDAR USUARIO:",
        error
      );

      console.error(
        "RESPUESTA DEL SERVIDOR:",
        error.response?.data
      );

      console.error(
        "ESTADO:",
        error.response?.status
      );

      alert(
        error.response?.data?.message ||
        "Error al guardar la información del usuario"
      );
    }
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "10px",
        alignItems: "flex-start",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
      }}
    >

      {/* =================================================
          FORMULARIO CREAR / EDITAR
      ================================================= */}

      <div
        style={{
          flex: "1 1 450px",
          background: "#fff",
          padding: "16px 20px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >

        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#1f2937",
            fontSize: "16px",
          }}
        >
          {selectedUser
            ? "✏️ Editar Usuario"
            : "➕ Crear Nuevo Usuario"}
        </h3>

        <form onSubmit={handleSubmit}>

          {/* NOMBRE + USUARIO */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "8px",
            }}
          >

            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                Nombre Completo:
              </label>

              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fullName: e.target.value,
                  })
                }
                required
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  marginTop: "2px",
                  borderRadius: "6px",
                  border:
                    "1px solid #d1d5db",
                  boxSizing: "border-box",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                Usuario:
              </label>

              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value,
                  })
                }
                required
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  marginTop: "2px",
                  borderRadius: "6px",
                  border:
                    "1px solid #d1d5db",
                  boxSizing: "border-box",
                  fontSize: "13px",
                }}
              />
            </div>

          </div>

          {/* CONTRASEÑA + ROL */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >

            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                Contraseña:
              </label>

              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                required={!selectedUser}
                placeholder={
                  selectedUser
                    ? "Dejar vacío para mantener"
                    : ""
                }
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  marginTop: "2px",
                  borderRadius: "6px",
                  border:
                    "1px solid #d1d5db",
                  boxSizing: "border-box",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                Rol:
              </label>

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  marginTop: "2px",
                  borderRadius: "6px",
                  border:
                    "1px solid #d1d5db",
                  boxSizing: "border-box",
                  backgroundColor: "white",
                  fontSize: "13px",
                }}
              >
                <option value="cajero">
                  Cajero
                </option>

                <option value="admin">
                  Administrador
                </option>

                <option value="superadmin">
                  Superadministrador
                </option>
              </select>
            </div>

          </div>

          <hr
            style={{
              border: 0,
              borderTop:
                "1px solid #e5e7eb",
              margin: "10px 0",
            }}
          />

          {/* PERMISOS */}

          <h4
            style={{
              margin: "0 0 6px 0",
              color: "#111827",
              fontSize: "12px",
            }}
          >
            Permisos del sistema:
          </h4>

          <div
            style={{
              background: "#f9fafb",
              padding: "8px 12px",
              borderRadius: "8px",
              border:
                "1px solid #e5e7eb",
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "6px 12px",
              maxHeight: "215px",
              overflowY: "auto",
            }}
          >

            {/* PRODUCTOS */}

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .addProducts
                }
                onChange={() =>
                  handlePermissionChange(
                    "addProducts"
                  )
                }
              />
              Crear Productos
            </label>

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .editProducts
                }
                onChange={() =>
                  handlePermissionChange(
                    "editProducts"
                  )
                }
              />
              Editar Productos
            </label>

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .deleteProducts
                }
                onChange={() =>
                  handlePermissionChange(
                    "deleteProducts"
                  )
                }
              />
              Eliminar Productos
            </label>

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .editPrices
                }
                onChange={() =>
                  handlePermissionChange(
                    "editPrices"
                  )
                }
              />
              Editar Precios
            </label>

            {/* HISTORIAL */}

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .viewHistory
                }
                onChange={() =>
                  handlePermissionChange(
                    "viewHistory"
                  )
                }
              />
              Ver Historial
            </label>

            {/* REPORTES */}

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .viewReports
                }
                onChange={() =>
                  handlePermissionChange(
                    "viewReports"
                  )
                }
              />
              Ver Reportes
            </label>

            {/* USUARIOS */}

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .manageUsers
                }
                onChange={() =>
                  handlePermissionChange(
                    "manageUsers"
                  )
                }
              />
              Gestionar Usuarios
            </label>

            {/* DESCUENTOS */}

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .discounts
                }
                onChange={() =>
                  handlePermissionChange(
                    "discounts"
                  )
                }
              />
              Descuentos
            </label>

            {/* DEVOLUCIONES */}

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .refunds
                }
                onChange={() =>
                  handlePermissionChange(
                    "refunds"
                  )
                }
              />
              Devoluciones
            </label>

            {/* CAJA */}

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .openRegister
                }
                onChange={() =>
                  handlePermissionChange(
                    "openRegister"
                  )
                }
              />
              Abrir Caja
            </label>

            <label className="permission-label">
              <input
                type="checkbox"
                checked={
                  formData.permissions
                    .closeRegister
                }
                onChange={() =>
                  handlePermissionChange(
                    "closeRegister"
                  )
                }
              />
              Cierre de Caja
            </label>

          </div>

          {/* BOTONES */}

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "8px",
            }}
          >

            <button
              type="submit"
              style={{
                flex: 1,
                padding: "8px",
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {selectedUser
                ? "Guardar Usuario"
                : "Crear Usuario"}
            </button>

            {selectedUser && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "8px 12px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancelar
              </button>
            )}

          </div>

        </form>

      </div>

      {/* =================================================
          TABLA DE USUARIOS
      ================================================= */}

      <div
        style={{
          flex: "1 1 450px",
          background: "#fff",
          padding: "16px 20px",
          borderRadius: "12px",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.1)",
          border:
            "1px solid #e5e7eb",
        }}
      >

        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#1f2937",
            fontSize: "16px",
          }}
        >
          👥 Usuarios Registrados
        </h3>

        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            textAlign: "left",
          }}
        >

          <thead>
            <tr
              style={{
                borderBottom:
                  "2px solid #e5e7eb",
                color: "#4b5563",
                fontSize: "12px",
              }}
            >
              <th style={{ padding: "8px" }}>
                Nombre
              </th>

              <th style={{ padding: "8px" }}>
                Usuario
              </th>

              <th style={{ padding: "8px" }}>
                Rol
              </th>

              <th
                style={{
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                Acción
              </th>
            </tr>
          </thead>

          <tbody>

            {users.map((u) => (
              <tr
                key={u._id}
                style={{
                  borderBottom:
                    "1px solid #f3f4f6",
                }}
              >

                <td
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                  }}
                >
                  {u.fullName}
                </td>

                <td
                  style={{
                    padding: "8px",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  {u.username}
                </td>

                <td
                  style={{
                    padding: "8px",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "10px",
                      fontSize: "10px",
                      fontWeight: "bold",

                      background:
                        u.role ===
                        "superadmin"
                          ? "#fef3c7"
                          : u.role ===
                            "admin"
                          ? "#ede9fe"
                          : "#e0f2fe",

                      color:
                        u.role ===
                        "superadmin"
                          ? "#92400e"
                          : u.role ===
                            "admin"
                          ? "#6d28d9"
                          : "#0369a1",
                    }}
                  >
                    {u.role ===
                    "superadmin"
                      ? "Superadministrador"
                      : u.role === "admin"
                      ? "Administrador"
                      : "Cajero"}
                  </span>
                </td>

                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      handleEditClick(u)
                    }
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Permisos
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}