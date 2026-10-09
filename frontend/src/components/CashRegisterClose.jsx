import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CashRegisterClose({
  onClose,
  onClosed,
  cajaId,
  registerId,
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  // ==========================================
  // OBTENER RESUMEN DEL TURNO ACTUAL
  // ==========================================
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/cash-register/summary`,
          {
            params: {
              cajaId,
            },
          }
        );

        setSummary(response.data);
      } catch (error) {
        console.error("Error al obtener resumen de cierre:", error);

        const message =
          error.response?.data?.message ||
          "Error al cargar el resumen de ventas del turno.";

        alert(message);
      } finally {
        setLoading(false);
      }
    };

    if (cajaId) {
      fetchSummary();
    } else {
      setLoading(false);
    }
  }, [cajaId, registerId]);

  // ==========================================
  // CERRAR E IMPRIMIR
  // ==========================================
  const handleCloseAndPrint = async () => {
    if (closing) return;

    const confirmed = window.confirm(
      `¿Confirmas el cierre de ${cajaId === "caja_1" ? "Caja 1" : "Caja 2"}?\n\n` +
        `Total de ventas: $${Number(summary?.totalToday || 0).toLocaleString("es-CL")}\n` +
        `Tickets: ${summary?.totalTickets || 0}`
    );

    if (!confirmed) return;

    setClosing(true);

    try {
      // 1. Marcar la caja como cerrada en MongoDB.
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cash-register/close`,
        {
          cajaId,
        }
      );

      // 2. Imprimir únicamente el voucher de cierre.
      // El monto base NO se incluye.
      printCloseVoucher();

      // 3. Avisar al POS que la caja terminó.
      // POS.jsx se encarga de limpiar la apertura y volver al Login.
      setTimeout(() => {
        if (onClosed) {
          onClosed();
        }
      }, 500);
    } catch (error) {
      console.error("Error al cerrar caja:", error);

      alert(
        error.response?.data?.message ||
          "No se pudo cerrar la caja."
      );

      setClosing(false);
    }
  };
  // ==========================================
  // VOUCHER DE CIERRE - IMPRESIÓN TÉRMICA
  // ==========================================
  const printCloseVoucher = () => {
    const cajaNombre =
      cajaId === "caja_1" ? "Caja 1" : "Caja 2";

    const ahora = new Date();

    const fecha = ahora.toLocaleDateString("es-CL");

    const hora = ahora.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const total = Number(summary?.totalToday || 0);
    const tickets = Number(summary?.totalTickets || 0);
    const efectivo = Number(summary?.efectivo || 0);
    const tarjeta = Number(summary?.tarjeta || 0);
    const transferencia = Number(summary?.transferencia || 0);

    const printWindow = window.open(
      "",
      "_blank",
      "width=400,height=700"
    );

    if (!printWindow) {
      alert(
        "El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes e inténtalo nuevamente."
      );
      return;
    }

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">

          <title>Cierre de ${cajaNombre}</title>

          <style>

            @page {
              size: 80mm auto;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              width: 80mm;
              margin: 0;
              padding: 0;
              background: white;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              color: #000;
            }

            .voucher {
              width: 72mm;
              margin: 0 auto;
              padding: 5mm 0;
            }

            .center {
              text-align: center;
            }

            .titulo {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 4px;
            }

            .caja {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 4px;
            }

            .fecha {
              font-size: 13px;
            }

            .linea {
              border-top: 1px dashed #000;
              margin: 12px 0;
              width: 100%;
            }

            .tickets {
              text-align: center;
              font-size: 14px;
              margin: 8px 0;
            }

            .fila {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              margin: 8px 0;
              font-size: 14px;
            }

            .fila strong {
              white-space: nowrap;
            }

            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 12px;
              margin-bottom: 12px;
            }

            .footer {
              text-align: center;
              font-size: 12px;
              margin-top: 15px;
              line-height: 1.4;
            }

            @media print {

              html,
              body {
                width: 80mm;
                margin: 0;
                padding: 0;
              }

              .voucher {
                width: 72mm;
                margin: 0 auto;
                padding: 5mm 0;
              }

            }

          </style>
        </head>

        <body>

          <div class="voucher">

            <div class="center">

              <div class="titulo">
                CIERRE DE CAJA
              </div>

              <div class="caja">
                ${cajaNombre}
              </div>

              <div class="fecha">
                ${fecha} - ${hora}
              </div>

            </div>

            <div class="linea"></div>

            <div class="tickets">
              <strong>${tickets}</strong>
              tickets registrados
            </div>

            <div class="linea"></div>

            <div class="fila">
              <span>EFECTIVO:</span>
              <strong>
                $${efectivo.toLocaleString("es-CL")}
              </strong>
            </div>

            <div class="fila">
              <span>TARJETA:</span>
              <strong>
                $${tarjeta.toLocaleString("es-CL")}
              </strong>
            </div>

            <div class="fila">
              <span>TRANSFERENCIA:</span>
              <strong>
                $${transferencia.toLocaleString("es-CL")}
              </strong>
            </div>

            <div class="linea"></div>

            <div class="fila total">
              <span>TOTAL VENTAS:</span>
              <strong>
                $${total.toLocaleString("es-CL")}
              </strong>
            </div>

            <div class="linea"></div>

            <div class="footer">
              Cierre de caja realizado correctamente.
              <br>
              ${cajaNombre}
            </div>

          </div>

          <script>

            window.onload = function () {

              setTimeout(function () {
                window.focus();
                window.print();
              }, 500);

            };

            window.onafterprint = function () {

              setTimeout(function () {
                window.close();
              }, 500);

            };

          </script>

        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // ==========================================
  // CARGANDO
  // ==========================================
  if (loading) {
    return (
      <div className="modal-overlay">
        <div
          className="modal-content"
          style={{
            textAlign: "center",
            width: "450px",
            maxWidth: "90%",
          }}
        >
          <h3>📊 Cierre de Caja</h3>
          <p>Cargando resumen de ventas del turno...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA DEL CIERRE
  // ==========================================
  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          width: "450px",
          maxWidth: "90%",
        }}
      >
        <h3>
          📊 Cierre de Caja (
          {new Date().toLocaleDateString("es-CL")})
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            margin: "15px 0",
          }}
        >
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#166534",
                fontWeight: "bold",
              }}
            >
              TOTAL VENTAS
            </span>

            <div
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#15803d",
              }}
            >
              $
              {Number(summary?.totalToday || 0).toLocaleString(
                "es-CL"
              )}
            </div>
          </div>

          <div
            style={{
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              padding: "10px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#374151",
                fontWeight: "bold",
              }}
            >
              TOTAL TICKETS
            </span>

            <div
              style={{
                fontSize: "20px",
                fontWeight: "800",
                color: "#1f2937",
              }}
            >
              {summary?.totalTickets || 0} tickets
            </div>
          </div>
        </div>

        <h4
          style={{
            margin: "10px 0 5px 0",
            fontSize: "14px",
          }}
        >
          Desglose por medio de pago:
        </h4>

        <div
          style={{
            background: "#fafafa",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #eee",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span>💵 Efectivo:</span>
            <strong>
              $
              {Number(summary?.efectivo || 0).toLocaleString(
                "es-CL"
              )}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span>💳 Tarjeta:</span>
            <strong>
              $
              {Number(summary?.tarjeta || 0).toLocaleString(
                "es-CL"
              )}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>📲 Transferencia:</span>
            <strong>
              $
              {Number(
                summary?.transferencia || 0
              ).toLocaleString("es-CL")}
            </strong>
          </div>
        </div>

        <div
          style={{
            marginTop: "12px",
            padding: "10px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#9a3412",
          }}
        >
          <strong>Importante:</strong> el monto base de apertura
          no forma parte del total de ventas y no se imprimirá
          en el voucher.
        </div>

        <div
          className="modal-actions"
          style={{
            marginTop: "15px",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            type="button"
            className="btn-guardar-mongo"
            onClick={handleCloseAndPrint}
            disabled={closing}
            style={{
              flex: 1,
              background: closing ? "#94a3b8" : "#16a34a",
            }}
          >
            {closing
              ? "⏳ Cerrando..."
              : "🖨️ Cerrar e Imprimir"}
          </button>

          <button
            type="button"
            className="btn-cancelar"
            onClick={onClose}
            disabled={closing}
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
