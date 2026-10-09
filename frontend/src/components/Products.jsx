import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

function Products({ user }) {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const permissions = user?.permissions || {};

  const isSuperUser =
    user?.role === "admin" ||
    user?.role === "superadmin" ||
    user?.role === "SuperUsuario";

  const canAdd =
    isSuperUser ||
    permissions.addProducts;

  const canEdit =
    isSuperUser ||
    permissions.editProducts;

  const canDelete =
    isSuperUser ||
    permissions.deleteProducts;

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    price: "",
    costPrice: "",
    stock: "",
  });

  const [importing, setImporting] = useState(false);

  // ==========================================
  // CARGAR PRODUCTOS
  // ==========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudieron cargar los productos."
        );
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError(error.message || "Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ==========================================
  // BUSQUEDA
  // ==========================================

  const filteredProducts = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return products;
    }

    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const barcode = String(product.barcode || "").toLowerCase();

      return (
        name.includes(text) ||
        barcode.includes(text)
      );
    });
  }, [products, search]);

  // ==========================================
  // FORMULARIO
  // ==========================================

  const openCreate = () => {
    setEditingProduct(null);

    setForm({
      name: "",
      barcode: "",
      price: "",
      costPrice: "",
      stock: "",
    });

    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      barcode: product.barcode || "",
      price: product.price ?? "",
      costPrice: product.costPrice ?? "",
      stock: product.stock ?? "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // CREAR / EDITAR
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("El nombre del producto es obligatorio.");
      return;
    }

    if (!form.barcode.trim()) {
      alert("El código de barras es obligatorio.");
      return;
    }

    const price = Number(form.price);
    const costPrice =
      form.costPrice === "" ? 0 : Number(form.costPrice);
    const stock =
      form.stock === "" ? 0 : Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      alert("El precio de venta no es válido.");
      return;
    }

    if (!Number.isFinite(costPrice) || costPrice < 0) {
      alert("El precio de costo no es válido.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      alert("El stock debe ser un número entero mayor o igual a cero.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct._id}`
        : `${API_URL}/api/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          barcode: form.barcode.trim(),
          price,
          costPrice,
          stock,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingProduct
              ? "No se pudo editar el producto."
              : "No se pudo crear el producto.")
        );
      }

      alert(
        editingProduct
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente."
      );

      closeForm();
      await loadProducts();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert(error.message || "Error al guardar producto.");
    }
  };

  // ==========================================
  // ELIMINAR
  // ==========================================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/products/${product._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudo eliminar el producto."
        );
      }

      alert("Producto eliminado correctamente.");

      await loadProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(error.message || "Error al eliminar producto.");
    }
  };

  // ==========================================
  // IMPORTAR EXCEL
  // ==========================================

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImporting(true);

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      if (!rows.length) {
        alert("El archivo Excel no contiene productos.");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/products/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(rows),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "No se pudo importar el archivo."
        );
      }

      alert(
        result.message ||
          "Productos importados correctamente."
      );

      await loadProducts();
    } catch (error) {
      console.error("Error al importar Excel:", error);

      alert(
        error.message ||
          "Error al procesar el archivo Excel."
      );
    } finally {
      setImporting(false);

      // Permite volver a seleccionar el mismo archivo.
      e.target.value = "";
    }
  };

  // ==========================================
  // FORMATO DINERO
  // ==========================================

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div style={{ padding: "10px" }}>
      {/* ENCABEZADO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            📦 Gestión de Productos
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
            }}
          >
            Administración del catálogo de productos.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {canAdd && (
            <>
              <button
                type="button"
                onClick={openCreate}
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "11px 16px",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ➕ Crear Producto
              </button>

              <label
                style={{
                  borderRadius: "8px",
                  padding: "11px 16px",
                  background: "#0ea5e9",
                  color: "white",
                  fontWeight: "bold",
                  cursor: importing
                    ? "default"
                    : "pointer",
                }}
              >
                📥{" "}
                {importing
                  ? "Importando..."
                  : "Importar Excel"}

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  disabled={importing}
                  style={{ display: "none" }}
                />
              </label>
            </>
          )}

          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "11px 16px",
              background: "#64748b",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div
        style={{
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "15px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 Buscar por nombre o código de barras..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* TABLA */}
      <div
  style={{
    background: "white",
    borderRadius: "10px",
    overflowY: "auto",
    overflowX: "hidden",
    maxHeight: "calc(100vh - 300px)",
    width: "100%",
    boxSizing: "border-box",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }}
>
      <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  }}
>
          <thead>
            <tr
              style={{
                background: "#1e293b",
                color: "white",
              }}
            >
              <th style={{ padding: "12px", textAlign: "left" }}>
                Código
              </th>

              <th style={{ padding: "12px", textAlign: "left" }}>
                Nombre
              </th>

              <th style={{ padding: "12px", textAlign: "right" }}>
                Precio venta
              </th>

              <th style={{ padding: "12px", textAlign: "right" }}>
                Precio costo
              </th>

              <th style={{ padding: "12px", textAlign: "center" }}>
                Stock
              </th>

              <th style={{ padding: "12px", textAlign: "center" }}>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  Cargando productos...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  style={{
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  <td style={{ padding: "12px", wordBreak: "break-word",   overflowWrap: "anywhere",}}>
                    {product.barcode}
                  </td>

                  <td style={{ padding: "12px", wordBreak: "break-word",  overflowWrap: "anywhere", }}>
                    <strong>{product.name}</strong>
                  </td>

                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                    }}
                  >
                    {formatMoney(product.price)}
                  </td>

                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                    }}
                  >
                    {formatMoney(product.costPrice)}
                  </td>

                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color:
                        Number(product.stock) <= 0
                          ? "#dc2626"
                          : "#166534",
                    }}
                  >
                    {product.stock}
                  </td>

                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(product)
                          }
                          style={{
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            background: "#f59e0b",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          ✏️
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(product)
                          }
                          style={{
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            background: "#dc2626",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p
        style={{
          marginTop: "12px",
          color: "#64748b",
        }}
      >
        Mostrando {filteredProducts.length} de{" "}
        {products.length} productos.
      </p>

      {/* MODAL CREAR / EDITAR */}
      {showForm && (
        <div
          onClick={closeForm}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              width: "min(550px, 100%)",
              padding: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>
                {editingProduct
                  ? "✏️ Editar Producto"
                  : "➕ Crear Producto"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                style={{
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "6px",
                  padding: "7px 11px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label>
                  <strong>Nombre</strong>
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Nombre del producto"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>
                  <strong>Código de barras</strong>
                </label>

                <input
                  name="barcode"
                  value={form.barcode}
                  onChange={handleFormChange}
                  placeholder="Código de barras"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>
                  <strong>Precio de venta</strong>
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  name="price"
                  value={form.price}
                  onChange={handleFormChange}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label>
                  <strong>Precio de costo</strong>
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  name="costPrice"
                  value={form.costPrice}
                  onChange={handleFormChange}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>
                  <strong>Stock</strong>
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  name="stock"
                  value={form.stock}
                  onChange={handleFormChange}
                  placeholder="0"
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    border: "none",
                    borderRadius: "7px",
                    padding: "11px 18px",
                    background: "#64748b",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    border: "none",
                    borderRadius: "7px",
                    padding: "11px 18px",
                    background: "#16a34a",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  💾 Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: "6px",
  padding: "11px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  fontSize: "15px",
};

export default Products;