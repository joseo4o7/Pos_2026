const express = require("express");
const router = express.Router();

const CashRegister = require("../models/CashRegister");
const Sale = require("../models/Sale");

// ==========================================
// 1. OBTENER CAJA ABIERTA
// ==========================================

router.get("/open", async (req, res) => {
  try {
    const { cajaId } = req.query;

    if (!cajaId) {
      return res.status(400).json({
        message: "Debe indicar cajaId",
      });
    }

    const register = await CashRegister.findOne({
      cajaId,
      status: "open",
    }).sort({
      openedAt: -1,
    });

    res.json(register);
  } catch (error) {
    console.error(
      "Error al buscar caja abierta:",
      error
    );

    res.status(500).json({
      message: "Error al consultar la caja",
    });
  }
});

// ==========================================
// 2. ABRIR CAJA
// ==========================================

router.post("/open", async (req, res) => {
  try {
    const {
      cajaId,
      cashier,
      montoBase,
    } = req.body;

    if (!cajaId) {
      return res.status(400).json({
        message: "Debe indicar cajaId",
      });
    }

    const existing = await CashRegister.findOne({
      cajaId,
      status: "open",
    });

    if (existing) {
      return res.status(400).json({
        message: "Esta caja ya se encuentra abierta",
        register: existing,
      });
    }

    const newRegister = new CashRegister({
      cajaId,
      cashier: cashier || "Cajera General",
      montoBase: Number(montoBase) || 0,
      openedAt: new Date(),
      status: "open",
    });

    const savedRegister =
      await newRegister.save();

    res.status(201).json(savedRegister);

  } catch (error) {
    console.error(
      "Error al abrir caja:",
      error
    );

    res.status(500).json({
      message: "Error al abrir caja",
    });
  }
});

// ==========================================
// 3. RESUMEN DEL TURNO ACTUAL
// ==========================================

router.get("/summary", async (req, res) => {
  try {
    const { cajaId } = req.query;

    if (!cajaId) {
      return res.status(400).json({
        message: "Debe indicar cajaId",
      });
    }

    // Buscar la apertura ACTIVA
    const register = await CashRegister.findOne({
      cajaId,
      status: "open",
    }).sort({
      openedAt: -1,
    });

    if (!register) {
      return res.status(404).json({
        message: "No existe una apertura activa",
      });
    }

    // ==========================================
    // SOLO VENTAS DEL TURNO
    // ==========================================

    const sales = await Sale.find({
      cajaId,
      createdAt: {
        $gte: register.openedAt,
      },
    });

    // ==========================================
    // TOTAL DE VENTAS
    // ==========================================

    const totalToday = sales.reduce(
      (acc, sale) =>
        acc + (Number(sale.total) || 0),
      0
    );

    const totalTickets = sales.length;

    // ==========================================
    // EFECTIVO
    // ==========================================

    const efectivo = sales
      .filter(
        (sale) =>
          sale.paymentMethod === "Efectivo"
      )
      .reduce(
        (acc, sale) =>
          acc + (Number(sale.total) || 0),
        0
      );

    // ==========================================
    // TARJETA
    // ==========================================

    const tarjeta = sales
      .filter(
        (sale) =>
          sale.paymentMethod === "Tarjeta" ||
          sale.paymentMethod === "Tarjeta / Débito"
      )
      .reduce(
        (acc, sale) =>
          acc + (Number(sale.total) || 0),
        0
      );

    // ==========================================
    // TRANSFERENCIA
    // ==========================================

    const transferencia = sales
      .filter(
        (sale) =>
          sale.paymentMethod ===
          "Transferencia"
      )
      .reduce(
        (acc, sale) =>
          acc + (Number(sale.total) || 0),
        0
      );

    // ==========================================
    // RESPUESTA
    // ==========================================

    res.json({
      registerId: register._id,
      cajaId: register.cajaId,
      cashier: register.cashier,
      openedAt: register.openedAt,

      totalToday,
      totalTickets,
      efectivo,
      tarjeta,
      transferencia,
    });

  } catch (error) {
    console.error(
      "Error al obtener resumen de turno:",
      error
    );

    res.status(500).json({
      message:
        "Error al obtener resumen de turno",
    });
  }
});

// ==========================================
// 4. CERRAR CAJA
// ==========================================

router.post("/close", async (req, res) => {
  try {
    const { cajaId } = req.body;

    if (!cajaId) {
      return res.status(400).json({
        message: "Debe indicar cajaId",
      });
    }

    const register = await CashRegister.findOne({
      cajaId,
      status: "open",
    }).sort({
      openedAt: -1,
    });

    if (!register) {
      return res.status(404).json({
        message:
          "No existe una caja abierta para cerrar",
      });
    }

    register.status = "closed";
    register.closedAt = new Date();

    await register.save();

    res.json({
      success: true,
      message: "Caja cerrada correctamente",
      register,
    });

  } catch (error) {
    console.error(
      "Error al cerrar caja:",
      error
    );

    res.status(500).json({
      message: "Error al cerrar caja",
    });
  }
});

module.exports = router;