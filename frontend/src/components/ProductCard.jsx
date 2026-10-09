function ProductCard({
  product,
  deleteProduct,
  setEditingProduct,
  addToCart,
}) {
  return (
    <div className="product-card">

      <h3>{product.name}</h3>

      <p>${product.price}</p>

      <p
        style={{
          color:
            product.stock <= 3
              ? "red"
              : "green",
        }}
      >
        Stock: {product.stock}
      </p>

      {product.stock === 0 && (
        <p
          style={{
            color: "red",
            fontWeight: "bold",
          }}
        >
          SIN STOCK
        </p>
      )}

      <p style={{ color: "red" }}>
        Código: {product.barcode}
      </p>

      <div className="actions">

        <button
          onClick={() =>
            deleteProduct(product._id)
          }
        >
          Eliminar
        </button>

        <button
          onClick={() =>
            setEditingProduct(product)
          }
        >
          Editar
        </button>

        <button
          disabled={product.stock === 0}
          onClick={() =>
            addToCart(product)
          }
        >
          Agregar
        </button>

      </div>

      <hr />

    </div>
  );
}

export default ProductCard;