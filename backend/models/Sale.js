const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: Number,
      required: true,
      unique: true, // Evita duplicados en la base de datos
      index: true,  // Acelera las búsquedas de último ticket
    },
    products: [
      {
        _id: String,
        name: String,
        price: Number,
        costPrice: { type: Number, default: 0 },
        quantity: Number,
        subtotal: Number,
      },
    ],
  
    // Subtotal antes de aplicar descuentos
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // Tipo de descuento: ninguno, porcentaje o monto fijo
    discountType: {
      type: String,
      enum: ["none", "percentage", "fixed"],
      default: "none",
    },

    // Valor ingresado por el cajero
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Dinero descontado realmente
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total final después del descuento
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    payment: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "Efectivo",
    },
    cashier: {
      type: String,
      default: "Cajera General",
    },
    cajaId: {
      type: String,
      default: "caja_1",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sale", saleSchema);