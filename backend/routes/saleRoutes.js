const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");

// Función auxiliar para calcular rangos de fecha en horario local
const getDayRange = (dateStr) => {
  let startOfDay, endOfDay;

  if (dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  } else {
    const now = new Date();
    startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  return { startOfDay, endOfDay };
};

// =====================================
// 1. REGISTRAR UNA NUEVA VENTA
// =====================================
router.post("/", async (req, res) => {
  try {
    const {
  products,
  subtotal,
  total,
  discountType = "none",
  discountValue = 0,
  discountAmount = 0,
  payment,
  paymentMethod,
  cashier,
  cajaId,
} = req.body;


// Validar los productos recibidos
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "La venta debe contener al menos un producto.",
      });
    }

    // Calcular el subtotal a partir de los productos
    const calculatedSubtotal = products.reduce((sum, item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < 0 ||
        quantity <= 0
      ) {
        return NaN;
      }

      return sum + price * quantity;
    }, 0);

    if (!Number.isFinite(calculatedSubtotal)) {
      return res.status(400).json({
        message: "Los precios o las cantidades de los productos no son válidos.",
      });
    }

    // Validar y calcular el descuento
    const normalizedDiscountType = discountType || "none";
    const numericDiscountValue = Number(discountValue);

    if (
      !["none", "percentage", "fixed"].includes(normalizedDiscountType) ||
      !Number.isFinite(numericDiscountValue) ||
      numericDiscountValue < 0
    ) {
      return res.status(400).json({
        message: "El descuento no es válido.",
      });
    }

    if (
      normalizedDiscountType === "percentage" &&
      numericDiscountValue > 100
    ) {
      return res.status(400).json({
        message: "El descuento porcentual no puede superar el 100%.",
      });
    }

    if (
      normalizedDiscountType === "none" &&
      numericDiscountValue !== 0
    ) {
      return res.status(400).json({
        message: "No puede haber un valor de descuento si el descuento está desactivado.",
      });
    }

    const calculatedDiscountAmount =
      normalizedDiscountType === "percentage"
        ? calculatedSubtotal * numericDiscountValue / 100
        : normalizedDiscountType === "fixed"
          ? Math.min(calculatedSubtotal, numericDiscountValue)
          : 0;

    const calculatedTotal = Math.max(
      0,
      calculatedSubtotal - calculatedDiscountAmount
    );

    // Generar automáticamente el número de ticket incremental
    const lastSale = await Sale.findOne({}, { ticketNumber: 1 }).sort({ ticketNumber: -1 });
    const ticketNumber = lastSale && lastSale.ticketNumber ? lastSale.ticketNumber + 1 : 1;

    const newSale = new Sale({
      ticketNumber,
      products,
      subtotal: calculatedSubtotal,
      discountType: normalizedDiscountType,
      discountValue:
        normalizedDiscountType === "none" ? 0 : numericDiscountValue,
      discountAmount: calculatedDiscountAmount,
      total: calculatedTotal,
      payment:
        paymentMethod === "Efectivo"
          ? Number(payment)
          : calculatedTotal,
      paymentMethod: paymentMethod || "Efectivo",
      cashier: cashier || "Cajera General",
      cajaId: cajaId || "caja_1",
    });

    const savedSale = await newSale.save();

    // Emitir evento por Socket.IO si está configurado
    const io = req.app.get("io");
    if (io) {
      io.emit("new-sale", savedSale);
    }

    res.status(201).json(savedSale);
  } catch (error) {
    console.error("Error al registrar la venta:", error);
    res.status(500).json({ message: "Error al registrar la venta", error: error.message });
  }
});

// =====================================
// 2. OBTENER TODAS LAS VENTAS (HISTORIAL)
// =====================================
router.get("/", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(sales);
  } catch (error) {
    console.error("Error al obtener las ventas:", error);
    res.status(500).json({ message: "Error al obtener las ventas" });
  }
});

// =====================================
// 3. RESUMEN DIARIO DE VENTAS (CIERRE)
// =====================================
router.get("/daily-summary", async (req, res) => {
  try {
    const { cajaId, date } = req.query;
    const { startOfDay, endOfDay } = getDayRange(date);

    const filter = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    if (cajaId) {
      filter.cajaId = cajaId;
    }

    const sales = await Sale.find(filter);

    const totalToday = sales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
    const totalTickets = sales.length;

    const efectivo = sales
      .filter((s) => s.paymentMethod === "Efectivo")
      .reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    const tarjeta = sales
      .filter((s) => s.paymentMethod === "Tarjeta")
      .reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    const transferencia = sales
      .filter((s) => s.paymentMethod === "Transferencia")
      .reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    res.json({
      totalToday,
      totalTickets,
      efectivo,
      tarjeta,
      transferencia,
    });
  } catch (error) {
    console.error("Error al obtener resumen diario:", error);
    res.status(500).json({ message: "Error al obtener resumen diario" });
  }
});

// =====================================
// 4. TOTAL DIARIO (BARRA INFORMATIVA)
// =====================================
router.get("/daily-total", async (req, res) => {
  try {
    const { cajaId, date } = req.query;
    const { startOfDay, endOfDay } = getDayRange(date);

    const filter = {
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    if (cajaId) {
      filter.cajaId = cajaId;
    }

    const sales = await Sale.find(filter);
    const totalToday = sales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    res.json({ totalToday });
  } catch (error) {
    console.error("Error al obtener total diario:", error);
    res.status(500).json({ message: "Error al obtener total diario" });
  }
});

module.exports = router;