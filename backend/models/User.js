const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true, // Convierte a minúsculas para evitar 'Admin' y 'admin' duplicados
      index: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "cajero"],
      default: "cajero",
    },
    permissions: {
      addProducts: { type: Boolean, default: false },
      editProducts: { type: Boolean, default: false },
      deleteProducts: { type: Boolean, default: false },
      viewHistory: { type: Boolean, default: false },
      viewReports: { type: Boolean, default: false },
      manageUsers: { type: Boolean, default: false },
      editPrices: { type: Boolean, default: false },
      discounts: { type: Boolean, default: false },
      refunds: { type: Boolean, default: false },
      openRegister: { type: Boolean, default: true },
      closeRegister: { type: Boolean, default: true },
    },
    active: {
      type: Boolean,
      default: true,
    },
    firstLogin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);