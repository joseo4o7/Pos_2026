import React, { useEffect, useRef, useState, memo } from "react";

function Sales({
  saleSearch,
  handleSaleSearch,
  cart,
  total,
  discountType,
  discountValue,
  setDiscountType,
  setDiscountValue,
  discountAmount,
  payment,
  setPayment,
  paymentMethod,
  setPaymentMethod,
  change,
  removeFromCart,
  updateCartItem,
  finishSale,
  printTicket,
  increaseQuantity,
  decreaseQuantity,
  addCustomToCart,
}) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const customNameRef = useRef(null);
  const customPriceRef = useRef(null);
  const customQuantityRef = useRef(null);

  // Modal de confirmación de cobro
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalPrint, setModalPrint] = useState(false);
  const paymentInputRef = useRef(null);
  const modalRef = useRef(null);

  // Mantener el buscador de venta listo cuando no hay modal abierto.
  const saleSearchRef = useRef(null);

  
  useEffect(() => {
    if (showCustomInput || showPaymentModal) return;

    const frame = requestAnimationFrame(() => {
      saleSearchRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [showCustomInput, showPaymentModal, cart.length]);


  useEffect(() => {
    if (showPaymentModal) {
      requestAnimationFrame(() => {
        if (paymentMethod === "Efectivo") {
          paymentInputRef.current?.focus();
          paymentInputRef.current?.select();
        } else {
          modalRef.current?.focus();
        }
      });
    }
  }, [showPaymentModal, paymentMethod]);

  const openPaymentModal = (shouldPrint) => {
    if (cart.length === 0) return;

    setModalPrint(shouldPrint);

    // Para tarjeta/transferencia el pago corresponde al total.
    if (paymentMethod !== "Efectivo") {
      setPayment(String(total));
    } else if (!payment || Number(payment) <= 0) {
      setPayment("");
    }

    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setModalPrint(false);
  };

  const handlePaymentKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePaymentModal();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (paymentMethod === "Efectivo" && Number(payment) < Number(total)) {
        alert("El monto pagado es insuficiente.");
        paymentInputRef.current?.focus();
        return;
      }

      setShowPaymentModal(false);

      // La opción elegida al abrir el modal decide si imprime.
      finishSale(modalPrint);
    }
  };

  const handleMethodClick = (method) => {
    setPaymentMethod(method);

    if (method !== "Efectivo") {
      setPayment(String(total));
    } else {
      setPayment("");
    }

    requestAnimationFrame(() => {
      if (method === "Efectivo") {
        paymentInputRef.current?.focus();
      } else {
        modalRef.current?.focus();
      }
    });
  };

  const handleAddCustom = (e) => {
    e.preventDefault();

    if (!customPrice || Number(customPrice) <= 0) {
      alert("Ingresa un precio válido");
      return;
    }

    addCustomToCart({
      name: customName.trim() !== "" ? customName : "Producto Vario",
      price: customPrice,
      quantity: Math.max(1, Number(quantity) || 1),
    });

    setCustomName("");
    setCustomPrice("");
    setQuantity("1");
    setShowCustomInput(false);
  };

  const toggleCustomInput = () => {
    setShowCustomInput((prev) => !prev);
  };

  return (
    <div className="cart-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h2 style={{ margin: 0 }}>Venta</h2>

        <button
          type="button"
          className="btn-vario"
          onClick={toggleCustomInput}
          style={{
            backgroundColor: "#dcfce7",
            color: "#166534",
            border: "1px solid #86efac",
          }}
        >
          {showCustomInput ? "✕ Cancelar" : "+ Venta Rápida"}
        </button>
      </div>

      {showCustomInput ? (
        <form onSubmit={handleAddCustom} className="custom-item-form">
          <input
            ref={customNameRef}
            type="text"
            placeholder="Nombre (opcional)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                customPriceRef.current?.focus();
              }
            }}
          />

          <input
            ref={customPriceRef}
            type="number"
            placeholder="Precio *"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                if (!customPrice || Number(customPrice) <= 0) {
                  alert("Ingresa un precio válido");
                  customPriceRef.current?.focus();
                  return;
                }

                customQuantityRef.current?.focus();
                customQuantityRef.current?.select();
              }
            }}
            required
          />

          <input
            ref={customQuantityRef}
            type="number"
            min="1"
            step="1"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                if (!customPrice || Number(customPrice) <= 0) {
                  alert("Ingresa un precio válido");
                  customPriceRef.current?.focus();
                  return;
                }

                const qty = Math.max(1, Number(quantity) || 1);

                addCustomToCart({
                  name:
                    customName.trim() !== ""
                      ? customName.trim()
                      : "Producto Vario",
                  price: Number(customPrice),
                  quantity: qty,
                });

                setCustomName("");
                setCustomPrice("");
                setQuantity("1");
                setShowCustomInput(false);

                requestAnimationFrame(() => {
                  saleSearchRef.current?.focus();
                });
              }
            }}
            aria-label="Cantidad opcional"
          />

          <button type="submit" className="btn-add-vario">
            Agregar al Carrito
          </button>
        </form>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 92px",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <input
            ref={saleSearchRef}
            type="text"
            placeholder="Escanear o escribir código..."
            value={saleSearch}
            onChange={(e) => {
              const value = e.target.value;
              const qty = Math.max(1, Number(quantity) || 1);

              const added = handleSaleSearch(value, qty);

              // Solo volver a 1 cuando realmente se agregó el producto.
              if (added) {
                setQuantity("1");
              }
            }}
            className="cart-search-input"
            autoComplete="off"
            style={{
              border: "2px solid #86efac",
              boxSizing: "border-box",
            }}
            spellCheck="false"
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            }}
          >
            <label
              htmlFor="sale-quantity"
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#64748b",
                marginLeft: "2px",
              }}
            >
              Cantidad
            </label>

            <input
              id="sale-quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saleSearchRef.current?.focus();
                }
              }}
              placeholder="1"
              aria-label="Cantidad opcional"
              style={{
                width: "100%",
                height: "36px",
                padding: "0 8px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                boxSizing: "border-box",
                fontSize: "14px",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      )}

      
<div className="cart-products">
  {cart.length === 0 ? (
    <p className="empty-cart-text">Carrito vacío</p>
  ) : (
    cart.map((item, index) => {
      const quantity = Number(item.quantity) || 1;
      const unitPrice = Number(item.price) || 0;
      const subtotal = unitPrice * quantity;

      return (
        <div
          className="cart-item"
          key={item._id || index}
        >
          {/* Nombre, precio unitario y subtotal */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(75px, 0.65fr) minmax(85px, 0.7fr)",
              gap: "8px",
              alignItems: "start",
              width: "100%",
            }}
          >
            {/* Nombre del producto */}
            <div style={{ minWidth: 0 }}>
              <h4
                style={{
                  margin: "4px 0",
                  overflowWrap: "anywhere",
                }}
              >
                {item.name}{" "}
                {item.isCustom && (
                  <small style={{ color: "#e11d48" }}>
                    (Vario)
                  </small>
                )}
              </h4>
            </div>

            {/* Precio por unidad */}
            <div style={{ minWidth: 0, textAlign: "right" }}>
              <small
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "11px",
                  marginBottom: "5px",
                }}
              >
                P. unit.
              </small>

              {item.isCustom ? (
                <input
                  type="number"
                  min="1"
                  step="1"
                  aria-label={`Precio unitario de ${item.name}`}
                  value={item.price}
                  onChange={(e) =>
                    updateCartItem(
                      index,
                      "price",
                      e.target.value === ""
                        ? ""
                        : Number(e.target.value)
                    )
                  }
                  style={{
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    padding: "5px",
                    textAlign: "right",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              ) : (
                <strong style={{ fontSize: "14px" }}>
                  ${unitPrice.toLocaleString("es-CL")}
                </strong>
              )}
            </div>

            {/* Subtotal de la cantidad */}
            <div style={{ minWidth: 0, textAlign: "right" }}>
              <small
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "11px",
                  marginBottom: "5px",
                }}
              >
                Subtotal
              </small>

              <strong
                className="cart-price"
                style={{
                  display: "block",
                  overflowWrap: "anywhere",
                  fontSize: "15px",
                }}
              >
                ${subtotal.toLocaleString("es-CL")}
              </strong>
            </div>
          </div>

          {/* Controles de cantidad y quitar */}
          <div
            className="cart-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
              marginTop: "12px",
            }}
          >
            <div className="quantity-box">
              <button
                type="button"
                className="qty-button"
                onClick={() => decreaseQuantity(index)}
              >
                −
              </button>

              <span className="qty-number">{quantity}</span>

              <button
                type="button"
                className="qty-button"
                onClick={() => increaseQuantity(index)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="remove-button"
              onClick={() => removeFromCart(index)}
            >
              Quitar
            </button>
          </div>
        </div>
      );
    })
  )}
</div>


      <div className="cart-footer">
        
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  }}
>
  <div>
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: "600",
        marginBottom: "4px",
      }}
    >
      Descuento (%)
    </label>
    <input
      type="number"
      min="0"
      max="100"
      step="1"
      placeholder="Ej. 10"
      value={discountType === "percentage" ? discountValue : ""}
      onChange={(e) => {
        const value = e.target.value;
        setDiscountType(value === "" ? "none" : "percentage");
        setDiscountValue(value);
      }}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "7px",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
      }}
    />
  </div>

  <div>
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: "600",
        marginBottom: "4px",
      }}
    >
      Descuento ($)
    </label>
    <input
      type="number"
      min="0"
      step="1"
      placeholder="Ej. 2000"
      value={discountType === "fixed" ? discountValue : ""}
      onChange={(e) => {
        const value = e.target.value;
        setDiscountType(value === "" ? "none" : "fixed");
        setDiscountValue(value);
      }}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "7px",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
      }}
    />
  </div>
</div>

{discountAmount > 0 && (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
      color: "#dc2626",
      fontSize: "13px",
    }}
  >
    <span>Descuento aplicado</span>
    <strong>
      -${discountAmount.toLocaleString("es-CL")}
    </strong>
  </div>
)}

        <div className="total-box">
          <span>TOTAL:</span>
          <span className="total-amount">
            ${Number(total).toLocaleString("es-CL")}
          </span>
        </div>


        <div
          className="action-buttons-row"
          style={{
          display: "flex",
          gap: "8px",
          marginTop: "0px",
  }}
>
          <button
            type="button"
            className="btn-finish-sale btn-no-print"
            onClick={() => openPaymentModal(false)}
            disabled={cart.length === 0}
            style={{ background: "#2563eb", minHeight: "52px", fontSize: "16px", fontWeight: "700" }}
          >
            ⚡ Solo Cobrar
          </button>

          <button
            type="button"
            className="btn-finish-sale"
            onClick={() => openPaymentModal(true)}
            disabled={cart.length === 0}
            style={{ background: "#16a34a", minHeight: "52px", fontSize: "16px", fontWeight: "700" }}
          >
            🖨️ Cobrar + Ticket
          </button>
        </div>
      </div>

      {showPaymentModal && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closePaymentModal();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onKeyDown={handlePaymentKeyDown}
            style={{
              width: "min(520px, 100%)",
              background: "#ffffff",
              borderRadius: "14px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: "20px",
              outline: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  color: "#0f172a",
                }}
              >
                {modalPrint ? "🖨️ Cobrar + Ticket" : "⚡ Solo Cobrar"}
              </h3>

              <button
                type="button"
                onClick={closePaymentModal}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              <strong>Total:</strong>

              <strong
                style={{
                  fontSize: "22px",
                  color: "#16a34a",
                }}
              >
                ${Number(total).toLocaleString("es-CL")}
              </strong>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontWeight: "700",
                  marginBottom: "8px",
                  color: "#334155",
                }}
              >
                Método de Pago
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleMethodClick("Efectivo")}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "8px",
                    border:
                      paymentMethod === "Efectivo"
                        ? "2px solid #16a34a"
                        : "1px solid #cbd5e1",
                    background:
                      paymentMethod === "Efectivo"
                        ? "#dcfce7"
                        : "#ffffff",
                    color: "#0f172a",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  💵 Efectivo
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodClick("Tarjeta")}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "8px",
                    border:
                      paymentMethod === "Tarjeta"
                        ? "2px solid #2563eb"
                        : "1px solid #cbd5e1",
                    background:
                      paymentMethod === "Tarjeta"
                        ? "#dbeafe"
                        : "#ffffff",
                    color: "#0f172a",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  💳 Tarjeta
                </button>

                <button
                  type="button"
                  onClick={() => handleMethodClick("Transferencia")}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "8px",
                    border:
                      paymentMethod === "Transferencia"
                        ? "2px solid #7c3aed"
                        : "1px solid #cbd5e1",
                    background:
                      paymentMethod === "Transferencia"
                        ? "#ede9fe"
                        : "#ffffff",
                    color: "#0f172a",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  🏦 Transferencia
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "700",
                  marginBottom: "6px",
                  color: "#334155",
                }}
              >
                Monto Pagado
              </label>

              <input
                ref={paymentInputRef}
                type="number"
                value={payment}
                placeholder="0"
                onChange={(e) => setPayment(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  handlePaymentKeyDown(e);
                }}
                autoComplete="off"
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 12px",
                  border: "2px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "20px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {paymentMethod === "Efectivo" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "11px 12px",
                  background: change >= 0 ? "#ecfdf5" : "#fef2f2",
                  border:
                    change >= 0
                      ? "1px solid #bbf7d0"
                      : "1px solid #fecaca",
                  borderRadius: "8px",
                  marginBottom: "14px",
                  color: change >= 0 ? "#166534" : "#b91c1c",
                  fontWeight: "700",
                }}
              >
                <span>Vuelto / Cambio:</span>
                <span>
                  $
                  {change >= 0
                    ? Number(change).toLocaleString("es-CL")
                    : "0"}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (
                  paymentMethod === "Efectivo" &&
                  Number(payment) < Number(total)
                ) {
                  alert("El monto pagado es insuficiente.");
                  paymentInputRef.current?.focus();
                  return;
                }

                setShowPaymentModal(false);
                finishSale(modalPrint);
              }}
              style={{
                width: "100%",
                height: "46px",
                border: "none",
                borderRadius: "8px",
                background: modalPrint ? "#16a34a" : "#2563eb",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              {modalPrint
                ? "🖨️ Confirmar y emitir ticket"
                : "⚡ Confirmar solo cobro"}
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              ENTER = confirmar · ESC = cancelar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Sales);
