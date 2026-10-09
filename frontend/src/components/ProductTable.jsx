import React, { memo, useMemo, useState } from "react";
import axios from "axios";

function ProductTable({ products, search, addToCart }) {
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  // ==========================================
  // FILTRADO OPTIMIZADO
  // ==========================================
  const filteredProducts = useMemo(() => {
    const searchValue = String(search || "")
      .trim()
      .toLowerCase();

    // Si no hay búsqueda, mostramos todos
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
  // ELIMINAR PRODUCTO
  // ==========================================
  const handleDeleteProduct = async (id, name) => {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar "${name}"?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`
      );

      // Socket.io actualizará la lista
    } catch (error) {
      console.error(
        "Error al eliminar el producto:",
        error
      );

      alert(
        "Error al eliminar el producto de la base de datos."
      );
    }
  };

  // ==========================================
  // GUARDAR PRECIO
  // ==========================================
  const handleSavePrice = async (id) => {
    if (!editPrice || Number(editPrice) <= 0) {
      alert("Ingresa un precio válido");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          price: Number(editPrice),
        }
      );

      setEditingId(null);
      setEditPrice("");

      // Socket.io actualizará la lista
    } catch (error) {
      console.error(
        "Error al actualizar precio:",
        error
      );

      alert("Error al actualizar el precio.");
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
                    onChange={(e) =>
                      setEditPrice(e.target.value)
                    }
                    style={{
                      width: "80px",
                      padding: "2px 4px",
                    }}
                    autoFocus
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleSavePrice(product._id)
                    }
                    style={{
                      backgroundColor: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    ✓
                  </button>

                  <button
                    type="button"
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
                    borderBottom:
                      "1px dashed #0284c7",
                  }}
                >
                  $
                  {Number(product.price || 0)
                    .toLocaleString("es-CL")}{" "}
                  ✏️
                </span>

              )}
            </td>

            {/* STOCK */}
            <td>
              {product.stock}
            </td>

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
                  onClick={() =>
                    addToCart(product)
                  }
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  + Agregar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteProduct(
                      product._id,
                      product.name
                    )
                  }
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>

              </div>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ==========================================
// EVITA RENDERIZADOS INNECESARIOS
// ==========================================
export default memo(ProductTable);