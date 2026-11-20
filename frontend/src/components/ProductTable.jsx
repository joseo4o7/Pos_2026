import React, { memo, useMemo, useState, useRef } from "react";
import axios from "axios";

function ProductTable({ products, search, addToCart }) {
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  // Estado para evitar doble clic accidental en "+ Agregar"
  const [addingId, setAddingId] = useState(null);
  const addLockRef = useRef(false);

  // Estado para confirmar eliminación sin usar window.confirm()
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // ==========================================
  // AGREGAR AL CARRITO (PROTEGIDO CONTRA DOBLE CLIC)
  // ==========================================
  const handleSafeAddToCart = (product) => {
    if (addLockRef.current) return;

    addLockRef.current = true;
    setAddingId(product._id);
    addToCart(product);

    setTimeout(() => {
      addLockRef.current = false;
      setAddingId(null);
    }, 350);
  };

  // ==========================================
  // FILTRADO OPTIMIZADO
  // ==========================================
  const filteredProducts = useMemo(() => {
    const searchValue = String(search || "")
      .trim()
      .toLowerCase();

    if (!searchValue) {
      return products;
    }

    return products.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const barcode = String(p.barcode || "");

      return (
        name.includes(searchValue) ||
        barcode.includes(searchValue)
      );
    });
  }, [products, search]);

  // ==========================================
  // ELIMINAR PRODUCTO (SIN VENTANA NATIVA DE WINDOWS)
  // ==========================================
  const handleDeleteProduct = async (id) => {
    // Primer clic: pide confirmación visual en el botón
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 3000);
      return;
    }

    // Segundo clic: ejecuta la eliminación
    setConfirmDeleteId(null);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`
      );
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert("Error al eliminar el producto de la base de datos.");
    }
  };

  // ==========================================
  // GUARDAR PRECIO
  // ==========================================
  const handleSavePrice = async (id) => {
    if (savingPrice) return;

    if (!editPrice || Number(editPrice) <= 0) {
      alert("Ingresa un precio válido");
      return;
    }

    setSavingPrice(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          price: Number(editPrice),
        }
      );

      setEditingId(null);
      setEditPrice("");
    } catch (error) {
      console.error("Error al actualizar precio:", error);
      alert("Error al actualizar el precio.");
    } finally {
      setSavingPrice(false);
    }
  };

  return (
    <table
      className="products-table"
      style={{
        width: "100%",
        maxWidth: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr>
          <th style={{ width: "22%" }}>Código</th>
          <th style={{ width: "30%" }}>Nombre</th>
          <th style={{ width: "18%" }}>Precio</th>
          <th style={{ width: "12%" }}>Stock</th>
          <th style={{ width: "18%" }}>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {filteredProducts.map((product) => (
          <tr key={product._id}>
            {/* CÓDIGO */}
            <td
              style={{
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {product.barcode || "S/C"}
            </td>

            {/* NOMBRE */}
            <td
              style={{
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {product.name}
            </td>

            {/* PRECIO */}
            <td>
              {editingId === product._id ? (
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePrice(product._id);
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditPrice("");
                      }
                    }}
                    style={{
                      width: "80px",
                      padding: "2px 4px",
                    }}
                    autoFocus
                  />

                  <button
                    type="button"
                    disabled={savingPrice}
                    onClick={() => handleSavePrice(product._id)}
                    style={{
                      backgroundColor: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: savingPrice ? "not-allowed" : "pointer",
                      opacity: savingPrice ? 0.6 : 1,
                    }}
                  >
                    ✓
                  </button>

                  <button
                    type="button"
                    disabled={savingPrice}
                    onClick={() => {
                      setEditingId(null);
                      setEditPrice("");
                    }}
                    style={{
                      backgroundColor: "#94a3b8",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span
                  onClick={() => {
                    setEditingId(product._id);
                    setEditPrice(product.price);
                  }}
                  title="Haz clic para editar precio rápidamente"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px dashed #0284c7",
                  }}
                >
                  ${Number(product.price || 0).toLocaleString("es-CL")} ✏️
                </span>
              )}
            </td>

            {/* STOCK */}
            <td>{product.stock}</td>

            {/* ACCIONES */}
            <td>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                }}
              >
                <button
                  type="button"
                  disabled={addingId === product._id}
                  onClick={() => handleSafeAddToCart(product)}
                  style={{
                    backgroundColor:
                      addingId === product._id ? "#1d4ed8" : "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor:
                      addingId === product._id ? "not-allowed" : "pointer",
                    opacity: addingId === product._id ? 0.75 : 1,
                  }}
                >
                  {addingId === product._id ? "✓" : "+ Agregar"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProduct(product._id)}
                  title={
                    confirmDeleteId === product._id
                      ? "Haz clic nuevamente para confirmar"
                      : "Eliminar producto"
                  }
                  style={{
                    backgroundColor:
                      confirmDeleteId === product._id ? "#b91c1c" : "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: confirmDeleteId === product._id ? "bold" : "normal",
                  }}
                >
                  {confirmDeleteId === product._id ? "¿Borrar?" : "🗑️"}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default memo(ProductTable);