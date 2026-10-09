import React, { useEffect, useMemo, useState } from "react";

function History({ user }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const loadSales = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/sales?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.message || "No se pudo cargar el historial."
        );
      }

      const data = await response.json();

      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setError(error.message || "Error al cargar historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return sales;
    }

    return sales.filter((sale) => {
      const ticket = String(sale.ticketNumber || "").toLowerCase();
      const cashier = String(sale.cashier || "").toLowerCase();
      const caja = String(sale.cajaId || "").toLowerCase();
      const paymentMethod = String(
        sale.paymentMethod || ""
      ).toLowerCase();

      return (
        ticket.includes(text) ||
        cashier.includes(text) ||
        caja.includes(text) ||
        paymentMethod.includes(text)
      );
    });
  }, [sales, search]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div style={{ padding: "10px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>📜 Historial de Ventas</h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
            }}
          >
            Consulta las últimas ventas registradas en el sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSales}
          disabled={loading}
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            background: "#2563eb",
            color: "white",
            cursor: loading ? "default" : "pointer",
            fontWeight: "bold",
          }}
        >
          🔄 Actualizar
        </button>
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
          placeholder="🔎 Buscar por ticket, cajero, caja o medio de pago..."
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

      {/* CARGANDO */}
      {loading && (
        <div
          style={{
            padding: "30px",
            textAlign: "center",
            background: "white",
            borderRadius: "10px",
          }}
        >
          Cargando historial...
        </div>
      )}

      {/* TABLA */}
      {!loading && !error && (
        <div
          style={{
            background: "white",
            borderRadius: "10px",
            overflow: "auto",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
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
                  Ticket
                </th>

                <th style={{ padding: "12px", textAlign: "left" }}>
                  Fecha
                </th>

                <th style={{ padding: "12px", textAlign: "left" }}>
                  Cajero
                </th>

                <th style={{ padding: "12px", textAlign: "left" }}>
                  Caja
                </th>

                <th style={{ padding: "12px", textAlign: "left" }}>
                  Pago
                </th>

                <th style={{ padding: "12px", textAlign: "right" }}>
                  Total
                </th>

                <th style={{ padding: "12px", textAlign: "center" }}>
                  Detalle
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "30px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No se encontraron ventas.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale._id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      <strong>#{sale.ticketNumber}</strong>
                    </td>

                    <td style={{ padding: "12px" }}>
                      {formatDate(sale.createdAt)}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {sale.cashier || "Sin información"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {sale.cajaId || "-"}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {sale.paymentMethod || "Efectivo"}
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontWeight: "bold",
                      }}
                    >
                      {formatMoney(sale.total)}
                    </td>

                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSale(sale)}
                        style={{
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          background: "#0f766e",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTADOR */}
      {!loading && (
        <p
          style={{
            marginTop: "12px",
            color: "#64748b",
          }}
        >
          Mostrando {filteredSales.length} de {sales.length} ventas.
        </p>
      )}

      {/* MODAL DETALLE */}
      {selectedSale && (
        <div
          onClick={() => setSelectedSale(null)}
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
              width: "min(700px, 100%)",
              maxHeight: "85vh",
              overflow: "auto",
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
                🎫 Ticket #{selectedSale.ticketNumber}
              </h2>

              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                style={{
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <div>
                <strong>Fecha:</strong>
                <br />
                {formatDate(selectedSale.createdAt)}
              </div>

              <div>
                <strong>Cajero:</strong>
                <br />
                {selectedSale.cashier || "-"}
              </div>

              <div>
                <strong>Caja:</strong>
                <br />
                {selectedSale.cajaId || "-"}
              </div>

              <div>
                <strong>Pago:</strong>
                <br />
                {selectedSale.paymentMethod || "-"}
              </div>
            </div>

            <h3>Productos vendidos</h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#e2e8f0" }}>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                    }}
                  >
                    Producto
                  </th>

                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    Cant.
                  </th>

                  <th
                    style={{
                      padding: "10px",
                      textAlign: "right",
                    }}
                  >
                    Precio
                  </th>

                  <th
                    style={{
                      padding: "10px",
                      textAlign: "right",
                    }}
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>

              <tbody>
                {(selectedSale.products || []).map(
                  (product, index) => (
                    <tr key={`${product._id || "product"}-${index}`}>
                      <td style={{ padding: "10px" }}>
                        {product.name || "Producto"}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        {product.quantity || 0}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                          textAlign: "right",
                        }}
                      >
                        {formatMoney(product.price)}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                          textAlign: "right",
                        }}
                      >
                        {formatMoney(product.subtotal)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div
              style={{
                borderTop: "2px solid #e2e8f0",
                marginTop: "20px",
                paddingTop: "15px",
                textAlign: "right",
              }}
            >
              <div>
                <strong>Pago recibido:</strong>{" "}
                {formatMoney(selectedSale.payment)}
              </div>

              <div
                style={{
                  fontSize: "22px",
                  marginTop: "5px",
                }}
              >
                <strong>
                  TOTAL: {formatMoney(selectedSale.total)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;