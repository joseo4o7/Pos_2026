const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function restablecer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🟢 Conectado a MongoDB");

    // Buscar el Superadmin existente
    const superadmins = await User.find({ role: "superadmin" });

    console.log("👑 Superadministradores encontrados:", superadmins.length);

    if (superadmins.length === 0) {
      console.log("❌ No existe ningún Superadmin.");
      return;
    }

    if (superadmins.length > 1) {
      console.log("⚠️ Hay más de un Superadmin. No se modificará ninguno.");
      superadmins.forEach((user) => {
        console.log(
          `- ${user.fullName} | usuario: ${user.username} | activo: ${user.active}`
        );
      });
      return;
    }

    const user = superadmins[0];

    console.log("👤 Superadmin encontrado:");
    console.log("Nombre:", user.fullName);
    console.log("Usuario:", user.username);
    console.log("Rol:", user.role);
    console.log("Activo:", user.active);

    // Nueva contraseña temporal
    const nuevaPassword = "Jose1234";

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    user.password = hashedPassword;
    user.active = true;

    await user.save();

    console.log("");
    console.log("✅ CONTRASEÑA RESTABLECIDA");
    console.log("👤 Usuario:", user.username);
    console.log("🔑 Nueva contraseña:", nuevaPassword);
    console.log("👑 Rol:", user.role);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

restablecer();