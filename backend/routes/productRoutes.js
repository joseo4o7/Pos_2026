const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");


// =====================================
// 1. OBTENER TODOS LOS PRODUCTOS
// =====================================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos", error: error.message });
  }
});

// =====================================
// 2. CREAR UN PRODUCTO
// =====================================
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      costPrice: req.body.costPrice || 0,
      barcode: req.body.barcode,
      stock: req.body.stock ?? 0,
    });

    const savedProduct = await newProduct.save();

    const io = req.app.get("io");
    if (io) io.emit("update-products");

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear producto", error: error.message });
  }
});

// =====================================
// 3. IMPORTACIÓN MASIVA DESDE EXCEL
// =====================================
router.post("/bulk", async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No se recibieron productos." });
    }

    // Usar un Map para eliminar filas duplicadas dentro del mismo archivo Excel
    const uniqueProductsMap = new Map();

    products.forEach((prod) => {
      const rawCode = prod.barcode || prod.Codigo || prod.codigo || prod.code;
      if (rawCode !== undefined && rawCode !== null && String(rawCode).trim() !== "") {
        const barcode = String(rawCode).trim();
        // Guarda o sobrescribe la última aparición del producto en el archivo
        uniqueProductsMap.set(barcode, prod);
      }
    });

    const operations = Array.from(uniqueProductsMap.values()).map((prod) => {
      const barcode = String(prod.barcode || prod.Codigo || prod.codigo || prod.code).trim();
      const name = String(prod.name || prod.Nombre || prod.nombre || "Producto sin nombre").trim();

      // Parsea precio de venta
      const rawPrice = prod.price ?? prod.Precio_de_venta ?? prod.Precio ?? prod.precio ?? 0;
      const cleanPrice = String(rawPrice).replace(/[^0-9.,]/g, "").replace(",", ".").trim();
      const price = Math.max(0, parseFloat(cleanPrice) || 0);

      // Parsea precio de costo
      const rawCost = prod.costPrice ?? prod.Costo ?? prod.costo ?? 0;
      const cleanCost = String(rawCost).replace(/[^0-9.,]/g, "").replace(",", ".").trim();
      const costPrice = Math.max(0, parseFloat(cleanCost) || 0);

      // Parsea stock
      const rawStock = String(prod.stock ?? prod.Cantidad ?? prod.cantidad ?? 0).replace(/[^0-9.-]/g, "");
      const parsedStock = Number(rawStock);
      const stock = isNaN(parsedStock) ? 0 : Math.max(0, Math.floor(parsedStock));

      const updateFields = {
        name,
        barcode,
        stock,
        costPrice,
      };

      if (price > 0) {
        updateFields.price = price;
      }

      return {
        updateOne: {
          filter: { barcode },
          update: { $set: updateFields },
          upsert: true,
        },
      };
    });

    if (operations.length === 0) {
      return res.status(400).json({ message: "No se encontraron filas con códigos válidos." });
    }

    await Product.bulkWrite(operations);

    const io = req.app.get("io");
    if (io) io.emit("update-products");

    res.json({ message: `Se importaron/actualizaron ${operations.length} productos correctamente.` });
  } catch (error) {
    console.error("Error en la importación masiva:", error);
    res.status(500).json({ message: "Error al procesar el archivo", error: error.message });
  }
});

// =====================================
// 4. DESCONTAR STOCK (Al vender)
// =====================================
router.put("/sell/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !id ||
      id === "null" ||
      id === "undefined" ||
      id === "generic" ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.json({ message: "Venta rápida procesada (sin descuento de stock)" });
    }

    const qty = Number(req.body.quantity) || 1;

    // Actualización atómica en base de datos para evitar inconsistencias de stock
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!product) {
      return res.json({ message: "Producto no encontrado, se omitió descuento de stock" });
    }

    // Asegurar que el stock no sea negativo
    if (product.stock < 0) {
      product.stock = 0;
      await product.save();
    }

    const io = req.app.get("io");
    if (io) io.emit("update-products");

    res.json(product);
  } catch (error) {
    console.error("Error al descontar stock:", error);
    res.status(500).json({ message: "Error al descontar stock", error: error.message });
  }
});

// =====================================
// 5. EDITAR PRODUCTO POR ID
// =====================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const io = req.app.get("io");
    if (io) io.emit("update-products");

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error al editar producto:", error);
    res.status(500).json({ message: "Error al editar producto", error: error.message });
  }
});

// =====================================
// 6. ELIMINAR PRODUCTO POR ID
// =====================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const io = req.app.get("io");
    if (io) io.emit("update-products");

    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto", error: error.message });
  }
});

module.exports = router;