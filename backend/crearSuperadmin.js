require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function crearSuperadmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🟢 MongoDB conectado");
    console.log("📦 Base de datos:", mongoose.connection.name);

    // Buscar si ya existe un superadministrador
    const superadmins = await User.find({ role: "superadmin" });

    console.log(
      `👤 Superadministradores encontrados: ${superadmins.length}`
    );

    if (superadmins.length > 0) {
      console.log("⚠️ Ya existe un Superadministrador.");
      console.log("No se creará otro.");
      
      superadmins.forEach((user) => {
        console.log(
          `- ${user.fullName} | usuario: ${user.username} | activo: ${user.active}`
        );
      });

      await mongoose.disconnect();
      return;
    }

    // Crear contraseña
    const password = "Admin1234!";
    const hashedPassword = await bcrypt.hash(password, 10);

    const superadmin = new User({
      fullName: "Super Administrador",
      username: "superadmin",
      password: hashedPassword,
      role: "superadmin",

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

      active: true,
      firstLogin: false,
    });

    await superadmin.save();

    console.log("");
    console.log("=================================");
    console.log("✅ SUPERADMIN CREADO");
    console.log("=================================");
    console.log("Usuario: superadmin");
    console.log("Contraseña: Admin1234!");
    console.log("Rol: superadmin");
    console.log("=================================");

    await mongoose.disconnect();

  } catch (error) {
    console.error("🔴 Error:", error.message);
    process.exit(1);
  }
}

crearSuperadmin();