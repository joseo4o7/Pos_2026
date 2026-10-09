import { useState, useEffect } from "react";

function ProductForm({
  getProducts,
  editingProduct,
  setEditingProduct,
}) {

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    

  if (editingProduct) {

    setName(editingProduct.name);
    setPrice(editingProduct.price);
    setBarcode(editingProduct.barcode);
    setStock(editingProduct.stock);

  }

}, [editingProduct]);
  

  

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!name || !price) {

  alert("Completa todos los campos");
  return;

}

if (price <= 0) {

  alert("El precio debe ser mayor a 0");
  return;

}

    const newProduct = {
      name,
      price,
      barcode,
      stock,
    };

   if (editingProduct) {

  await fetch(
  `${import.meta.env.VITE_API_URL}/api/products/${editingProduct._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    }
  );

} else {

 await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newProduct),
  });

}


    // ACTUALIZAR LISTA
    getProducts();

    setName("");
    setPrice("");
    setBarcode("");
    setStock("");

    alert("Producto creado");

  };

  return (

    <form onSubmit={handleSubmit}>

      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Precio"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
  type="text"
  placeholder="Código de barras"
  value={barcode}
  onChange={(e) => setBarcode(e.target.value)}
/>

<input
  type="number"
  placeholder="Stock"
  value={stock}
  onChange={(e) => setStock(e.target.value)}
/>

      <button type="submit">
        Guardar
      </button>

      {editingProduct && (

  <button
    type="button"
    onClick={() => {

      setEditingProduct(null);
      setName("");
      setPrice("");
      setStock("");

    }}
  >
    Cancelar
  </button>

)}

    </form>

  );

}

export default ProductForm;