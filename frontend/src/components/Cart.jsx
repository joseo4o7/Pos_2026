
function Cart({
  paymentMethod,
  setPaymentMethod,
  cart,
  total,
  payment,
  setPayment,
  change,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  finishSale,
  printTicket,
  updateCartPrice,
}) {
  const formatMoney = (value) =>
    `$${Number(value || 0).toLocaleString("es-CL")}`;

  const handlePriceChange = (index, value) => {
    if (updateCartPrice) {
      updateCartPrice(index, value);
    }
  };

  return (
    <div className="cart-wrapper">
      <h2>Carrito</h2>

      <div className="cart-products">
        {cart.map((item, index) => {
          const quantity = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          const subtotal = price * quantity;

          const isVario =
            item.isVario === true ||
            item.type === "vario" ||
            item.name?.toLowerCase().includes("(vario)");

          return (
            <div className="cart-item" key={item._id || item.id || index}>
              <div className="cart-item-prices">
                <div className="cart-item-name">
                  <h4>
                    🛒 {item.name.toUpperCase()}
                  </h4>
                </div>

                <div className="cart-unit-price">
                  <span className="cart-price-label">
                    P. unitario
                  </span>

                  {isVario && updateCartPrice ? (
                    <label className="cart-edit-price">
                      <span>$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          handlePriceChange(index, e.target.value)
                        }
                        aria-label={`Precio unitario de ${item.name}`}
                      />
                    </label>
                  ) : (
                    <strong>{formatMoney(price)}</strong>
                  )}
                </div>

                <div className="cart-line-total">
                  <span className="cart-price-label">
                    Subtotal
                  </span>
                  <strong>{formatMoney(subtotal)}</strong>
                </div>
              </div>

              <div className="cart-row">
                <span>Cantidad</span>

                <div className="quantity-box">
                  <button
                    type="button"
                    className="qty-button"
                    onClick={() => decreaseQuantity(index)}
                  >
                    −
                  </button>

                  <span className="qty-number">
                    {quantity}
                  </span>

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
                  🗑 Quitar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>TOTAL:</span>
          <strong>{formatMoney(total)}</strong>
        </div>

        <div className="cart-row-flex">
          <label>Pago cliente:</label>
          <input
            type="number"
            className="cart-input-pago"
            placeholder="0"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          />
        </div>

        <div className="cart-row-flex">
          <label>Método de pago:</label>
          <select
            className="cart-select-pago"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option>Efectivo</option>
            <option>Débito</option>
            <option>Crédito</option>
            <option>Transferencia</option>
          </select>
        </div>

        <div className="cart-row-flex cart-vuelto">
          <span>Vuelto:</span>
          <strong>{formatMoney(change >= 0 ? change : 0)}</strong>
        </div>

        <button
          type="button"
          className="btn-vender"
          onClick={finishSale}
        >
          [ Finalizar Venta ]
        </button>

        <button
          type="button"
          className="btn-imprimir"
          onClick={printTicket}
        >
          🖨️ [ Imprimir Ticket ]
        </button>
      </div>
    </div>
  );
}

export default Cart;
