const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, "El nombre del negocio es obligatorio"],
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "CLP",
      trim: true,
    },
    iva: {
      type: Number,
      default: 19,
      min: [0, "El IVA no puede ser negativo"],
    },
    timezone: {
      type: String,
      default: "America/Santiago",
      trim: true,
    },
    initialized: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);