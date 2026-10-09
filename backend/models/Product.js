const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "El precio de venta es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, "El costo no puede ser negativo"],
    },
    barcode: {
      type: String,
      required: [true, "El código de barras es obligatorio"],
      unique: true, // Evita códigos de barras duplicados
      trim: true,
      index: true,  // Agiliza las búsquedas por lector de código de barras
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "El stock no puede ser negativo"],
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model("Product", productSchema);