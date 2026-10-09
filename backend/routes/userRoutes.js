const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const requirePermission = require("../middlewares/permissionMiddleware");

// 1. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Convertir a minúsculas para coincidir con el Schema
    const normalizedUsername = username ? username.trim().toLowerCase() : "";

    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        message: "Usuario deshabilitado",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    // GENERAR TOKEN JWT
    const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error("JWT_SECRET no está configurado.");
  return res.status(500).json({
    message: "Error de configuración del servidor.",
  });
}
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        permissions: user.permissions,
      },
      secret,
      { expiresIn: "12h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error del servidor",
    });
  }
});

// 2. OBTENER TODOS LOS USUARIOS (Protegida)
router.get("/", authMiddleware, requirePermission("manageUsers"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// 3. CREAR NUEVO USUARIO (Protegida)
router.post("/", authMiddleware, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { fullName, username, password, role, permissions } = req.body;

    const normalizedUsername = username ? username.trim().toLowerCase() : "";

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: "El nombre de usuario ya existe" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username: normalizedUsername,
      password: hashedPassword,
      role: role || "cajero",
      permissions: permissions || {},
      active: true,
    });

    await newUser.save();

    const savedUser = newUser.toObject();
    delete savedUser.password;

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error detallado al crear usuario:", error);
    res.status(500).json({ message: error.message || "Error al crear el usuario" });
  }
});

// 4. ACTUALIZAR USUARIO Y PERMISOS (Protegida)
router.put("/:id", authMiddleware, requirePermission("manageUsers"), async (req, res) => {
  try {
    const { fullName, username, role, permissions, active, password } = req.body;

    const updateData = {
      fullName,
      username: username ? username.trim().toLowerCase() : undefined,
      role,
      permissions,
      active: active !== undefined ? active : true,
    };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar permisos del usuario" });
  }
});

// 5. ELIMINAR USUARIO (Protegida)
router.delete("/:id", authMiddleware, requirePermission("manageUsers"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

module.exports = router;