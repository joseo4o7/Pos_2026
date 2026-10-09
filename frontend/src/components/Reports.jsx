import React, { useEffect, useState } from "react";

function Reports({ user }) {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getToday());
  const [cajaId, setCajaId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const params = new URLSearchParams();

      if (date) {
        params.append("date", date);
      }

      if (cajaId) {
        params.append("cajaId", cajaId);
      }

      const response = await fetch(
        `${API_URL}/api/sales/daily-summary?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "No se pudo obtener el reporte."
        );
      }

      setReport(data);
    } catch (error) {
      console.error("Error al cargar reporte:", error);
      setError(error.message || "Error al cargar reporte.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "10px",
      }}
    >
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
          <h2
            style={{
              margin: 0,
              fontSize: "30px",
              color: "#1e293b",
            }}
          >
            📊 Reportes
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Resumen de ventas del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReport}
          disabled={loading}
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "11px 18px",
            background: "#2563eb",
            color: "white",
            cursor: loading ? "default" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* FILTROS */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "18px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "15px",
            color: "#1e293b",
          }}
        >
          🔎 Filtros
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
          }}
        >
          {/* FECHA */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#475569",
              }}
            >
              📅 Fecha
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "15px",
              }}
            />
          </div>

          {/* CAJA */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#475569",
              }}
            >
              🏪 Caja
            </label>

            <select
              value={cajaId}
              onChange={(e) => setCajaId(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "15px",
                background: "white",
              }}
            >
              <option value="">Todas las cajas</option>
              <option value="caja_1">Caja 1</option>
              <option value="caja_2">Caja 2</option>
            </select>
          </div>

          {/* BOTÓN */}
          <div
            style={{
              display: "flex",
              alignItems: "end",
            }}
          >
            <button
              type="button"
              onClick={loadReport}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                border: "none",
                borderRadius: "8px",
                background: "#0f766e",
                color: "white",
                cursor: loading ? "default" : "pointer",
                fontWeight: "bold",
                fontSize: "15px",
              }}
            >
              📊 Generar reporte
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* CARGANDO */}
      {loading && (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          Cargando reporte...
        </div>
      )}

      {/* RESULTADOS */}
      {!loading && report && (
        <>
          {/* TARJETAS PRINCIPALES */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            {/* TOTAL */}
            <div
              style={{
                background: "white",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                borderLeft: "5px solid #2563eb",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                💰 Total vendido
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                {formatMoney(report.totalToday)}
              </div>
            </div>

            {/* TICKETS */}
            <div
              style={{
                background: "white",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                borderLeft: "5px solid #0f766e",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                🧾 Cantidad de ventas
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                {report.totalTickets}
              </div>
            </div>
          </div>

          {/* MEDIOS DE PAGO */}
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "18px",
                color: "#1e293b",
              }}
            >
              💳 Ventas por medio de pago
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  padding: "18px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  💵 Efectivo
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "8px",
                    fontSize: "22px",
                  }}
                >
                  {formatMoney(report.efectivo)}
                </strong>
              </div>

              <div
                style={{
                  padding: "18px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  💳 Tarjeta
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "8px",
                    fontSize: "22px",
                  }}
                >
                  {formatMoney(report.tarjeta)}
                </strong>
              </div>

              <div
                style={{
                  padding: "18px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  📲 Transferencia
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "8px",
                    fontSize: "22px",
                  }}
                >
                  {formatMoney(report.transferencia)}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;