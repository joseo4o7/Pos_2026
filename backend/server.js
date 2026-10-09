console.log("SERVER NUEVO");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

// ==========================================
// RUTAS
// ==========================================

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const salesRoutes = require("./routes/saleRoutes");
const cashRegisterRoutes = require("./routes/cashRegisterRoutes");

// ==========================================
// APP
// ==========================================

const app = express();
const server = http.createServer(app);

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(cors());

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Caja conectada:", socket.id);

  socket.on("disconnect", () => {
    console.log("Caja desconectada:", socket.id);
  });
});

// ==========================================
// RUTAS API
// ==========================================

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/sales", salesRoutes);

// ⭐ IMPORTANTE: RUTAS DE CAJA
app.use("/api/cash-register", cashRegisterRoutes);

// ==========================================
// CONEXIÓN MONGODB
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("🟢 MongoDB conectado exitosamente");
  })
  .catch((error) => {
    console.error(
      "🔴 Error de conexión en Mongo:",
      error.message
    );
  });

// ==========================================
// SERVIDOR
// ==========================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Servidor escuchando en el puerto ${PORT}`
  );
});