
import React from "react";

const Ticket = ({
  cart,
  subtotal,
  discountType,
  discountValue,
  discountAmount,
  total,
  payment,
  paymentMethod,
  ticketNumber,
  cashier,
}) => {
  const now = new Date();

  const formattedDate = now.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const change = Number(payment) - Number(total);

  const formatMoney = (value) =>
    `$${Number(value || 0).toLocaleString("es-CL")}`;

  const styles = {
    container: {
      width: "72mm",
      maxWidth: "72mm",
      margin: "0 auto",
      padding: "4mm 0",
      backgroundColor: "#ffffff",
      color: "#000000",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: "12px",
      fontWeight: "400",
      lineHeight: "1.25",
      boxSizing: "border-box",
    },

    header: {
      textAlign: "center",
      marginBottom: "8px",
    },

    title: {
      margin: "0 0 3px",
      padding: 0,
      fontSize: "18px",
      fontWeight: "600",
      letterSpacing: "0.2px",
      lineHeight: "1.1",
    },

    address: {
      margin: 0,
      padding: 0,
      fontSize: "14px",
      lineHeight: "1.2",
    },

    separator: {
      width: "100%",
      borderTop: "1px dashed #000",
      margin: "7px 0",
      height: 0,
    },

    info: {
      width: "100%",
      fontSize: "12px",
      lineHeight: "1.4",
    },

    infoRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: "4px",
      margin: "2px 0",
    },

    infoLabel: {
      fontWeight: "600",
      whiteSpace: "nowrap",
    },

    infoValue: {
      flex: 1,
      minWidth: 0,
      overflowWrap: "anywhere",
    },

    itemsHeader: {
      display: "grid",
      gridTemplateColumns: "9mm minmax(0, 1fr) 15mm 17mm",
      columnGap: "1mm",
      alignItems: "start",
      fontSize: "10px",
      fontWeight: "600",
      lineHeight: "1.2",
      marginBottom: "6px",
    },

    itemRow: {
      display: "grid",
      gridTemplateColumns: "9mm minmax(0, 1fr) 15mm 17mm",
      columnGap: "1mm",
      alignItems: "start",
      fontSize: "11px",
      lineHeight: "1.3",
      margin: "5px 0",
      width: "100%",
    },

    quantity: {
      textAlign: "left",
      overflowWrap: "anywhere",
    },

    itemName: {
      textAlign: "left",
      minWidth: 0,
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    },

    unitPrice: {
      textAlign: "right",
      whiteSpace: "nowrap",
    },

    subtotal: {
      textAlign: "right",
      whiteSpace: "nowrap",
      fontWeight: "400",
    },

    totals: {
      width: "100%",
      fontSize: "12px",
      lineHeight: "1.4",
    },

    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "6px",
      margin: "4px 0",
    },

    totalValue: {
      textAlign: "right",
      whiteSpace: "nowrap",
    },

    totalMain: {
      fontSize: "15px",
      fontWeight: "600",
      margin: "5px 0",
    },

    footer: {
      textAlign: "center",
      fontSize: "12px",
      lineHeight: "1.4",
      marginTop: "9px",
    },

    footerText: {
      margin: "2px 0",
      padding: 0,
    },
  };

  return (
    <div
      id="ticket"
      className="ticket-container ticket-80mm"
      style={styles.container}
    >
      {/* ENCABEZADO */}
      <div style={styles.header}>
        <h2 style={styles.title}>PUNTO ELECTRONICO</h2>
        <p style={styles.address}>MARIQUINA 1190</p>
      </div>

      <div style={styles.separator} />

      {/* INFORMACIÓN DE LA VENTA */}
      <div style={styles.info}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Fecha:</span>
          <span style={styles.infoValue}>
            {formattedDate} {formattedTime}
          </span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Boleta Nº:</span>
          <span style={styles.infoValue}>
            {String(ticketNumber || 0).padStart(6, "0")}
          </span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Atendido:</span>
          <span style={styles.infoValue}>
            {cashier || "Cajera/o"}
          </span>
        </div>
      </div>

      <div style={styles.separator} />

      {/* PRODUCTOS */}
      <div className="ticket-items">
        <div style={styles.itemsHeader}>
          <span>Cant.</span>
          <span>Producto</span>
          <span style={{ textAlign: "right" }}>P. unit.</span>
          <span style={{ textAlign: "right" }}>Subtotal</span>
        </div>

        <div style={styles.separator} />

        {cart &&
          cart.map((item, index) => {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const subtotal = price * quantity;

            return (
              <div
                key={item._id || item.id || index}
                className="item-row"
                style={styles.itemRow}
              >
                <span style={styles.quantity}>{quantity}</span>

                <span style={styles.itemName}>{item.name}</span>

                <span style={styles.unitPrice}>
                  {formatMoney(price)}
                </span>

                <span style={styles.subtotal}>
                  {formatMoney(subtotal)}
                </span>
              </div>
            );
          })}
      </div>

      <div style={styles.separator} />

      {/* TOTALES Y PAGO */}
      <div style={styles.totals}>
        <div style={styles.totalRow}>
  <span>SUBTOTAL:</span>
  <span style={styles.totalValue}>
    {formatMoney(subtotal)}
  </span>
</div>

{Number(discountAmount) > 0 && (
  <div style={styles.totalRow}>
    <span>
      DESCUENTO
      {discountType === "percentage"
        ? ` (${Number(discountValue)}%)`
        : ""}:
    </span>
    <span style={styles.totalValue}>
      -{formatMoney(discountAmount)}
    </span>
  </div>
)}
        <div
          style={{
            ...styles.totalRow,
            ...styles.totalMain,
          }}
        >
          <span>TOTAL:</span>
          <span style={styles.totalValue}>{formatMoney(total)}</span>
        </div>

        <div style={styles.totalRow}>
          <span>PAGO:</span>
          <span style={styles.totalValue}>{formatMoney(payment)}</span>
        </div>

        <div style={styles.totalRow}>
          <span>MÉTODO:</span>
          <span style={styles.totalValue}>{paymentMethod}</span>
        </div>

        <div style={styles.totalRow}>
          <span>VUELTO:</span>
          <span style={styles.totalValue}>
            {formatMoney(change > 0 ? change : 0)}
          </span>
        </div>
      </div>

      <div style={styles.separator} />

      {/* PIE DE BOLETA */}
      <div style={styles.footer}>
        <p style={styles.footerText}>¡Gracias por su compra!</p>
        <p style={styles.footerText}>Que tenga un excelente día.</p>
      </div>
    </div>
  );
};

export default Ticket;
