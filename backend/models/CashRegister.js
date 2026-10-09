const mongoose = require("mongoose");

const cashRegisterSchema = new mongoose.Schema(
  {
    cajaId: {
      type: String,
      required: true,
      default: "caja_1",
    },

    cashier: {
      type: String,
      default: "Cajera General",
    },

    montoBase: {
      type: Number,
      default: 0,
    },

    openedAt: {
      type: Date,
      default: Date.now,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CashRegister",
  cashRegisterSchema
);