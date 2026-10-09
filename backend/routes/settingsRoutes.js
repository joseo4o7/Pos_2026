const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Settings = require("../models/Settings");
const User = require("../models/User");

const authMiddleware = require("../middlewares/authMiddleware");
const requirePermission = require("../middlewares/permissionMiddleware");

// =====================================
// VERIFICAR SI EL SISTEMA YA FUE CONFIGURADO
// =====================================
router.get("/status", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({
      initialized: !!settings,
    });
  } catch (error) {
    console.error("Error al obtener status:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// =====================================
// OBTENER CONFIGURACIÓN
// =====================================
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// =====================================
// ACTUALIZAR CONFIGURACIÓN
// =====================================
router.put(
  "/",
  authMiddleware,
  requirePermission("manageUsers"),
  async (req, res) => {
    try {
      const {
        businessName,
        address,
        phone,
        email,
        logo,
        currency,
        iva,
        timezone,
      } = req.body;

      const updateData = {};

      if (businessName !== undefined) {
        updateData.businessName = businessName;
      }

      if (address !== undefined) {
        updateData.address = address;
      }

      if (phone !== undefined) {
        updateData.phone = phone;
      }

      if (email !== undefined) {
        updateData.email = email;
      }

      if (logo !== undefined) {
        updateData.logo = logo;
      }

      if (currency !== undefined) {
        updateData.currency = currency;
      }

      if (iva !== undefined) {
        updateData.iva = iva;
      }

      if (timezone !== undefined) {
        updateData.timezone = timezone;
      }

      const settings = await Settings.findOneAndUpdate(
        {},
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!settings) {
        return res.status(404).json({
          message: "No existe una configuración inicial.",
        });
      }

      res.json({
        success: true,
        settings,
      });
    } catch (error) {
      console.error("Error al actualizar configuración:", error);

      res.status(500).json({
        message: "Error al actualizar configuración.",
      });
    }
  }
);

// =====================================
// CONFIGURACIÓN INICIAL
// =====================================
router.post("/initialize", async (req, res) => {
  try {
    const exists = await Settings.findOne();

    if (exists) {
      return res.status(400).json({
        message: "El sistema ya fue configurado.",
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    //-----------------------------------
    // Crear negocio
    //-----------------------------------
    const settings = await Settings.create({
      businessName: req.body.businessName,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      logo: req.body.logo || "",
      currency: req.body.currency || "CLP",
      iva: req.body.iva || 19,
      timezone: req.body.timezone || "America/Santiago",
      initialized: true,
    });

    //-----------------------------------
    // Crear Super Administrador
    //-----------------------------------
    await User.create({
      fullName: req.body.fullName,
      username: req.body.username,
      password: passwordHash,
      role: "superadmin",
      active: true,
      firstLogin: false,
      permissions: {
        addProducts: true,
        editProducts: true,
        deleteProducts: true,
        viewHistory: true,
        viewReports: true,
        manageUsers: true,
        editPrices: true,
        discounts: true,
        refunds: true,
        openRegister: true,
        closeRegister: true,
      },
    });

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error en inicialización:", error);
    res.status(500).json({ message: "Error al inicializar el sistema", error });
  }
});

module.exports = router;