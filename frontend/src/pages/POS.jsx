import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../App.css";

import Ticket from "../components/Ticket";
import ProductTable from "../components/ProductTable";
import Sales from "./Sales";
import CashRegisterClose from "../components/CashRegisterClose";
import socket from "../socket";

function POS({ user, montoBase, setMontoBase, onLogout }) {
  // Estados para productos y ventas
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);
  const [cart, setCart] = useState([]);
  const [saleSearch, setSaleSearch] = useState("");
  const [payment, setPayment] = useState("");
  const [refreshSales, setRefreshSales] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState("");

  // Estado para Modal Cierre de Caja
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Identificador de la caja
  const [cajaId, setCajaId] = useState(() => {
    return user?.cajaId || localStorage.getItem("pos_caja_id") || "caja_1";
  });

  // ESTADO PARA CAJERA/O EN TURNO
  const [cashier, setCashier] = useState(() => {
  return (
    user?.fullName ||
    localStorage.getItem("pos_cashier") ||
    "Cajera General"
  );
});

  // ESTADOS PARA IMPRESORAS
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(() => {
    return localStorage.getItem("selected_printer") || "";
  });

  // Estado para el Total Diario del Cajero y Privacidad
  const [dailyTotal, setDailyTotal] = useState(0);
  const [showDailyTotal, setShowDailyTotal] = useState(false);
  const [showDailyPinModal, setShowDailyPinModal] = useState(false);
  const processingSaleRef = useRef(false);
  const [dailyPin, setDailyPin] = useState("");
  const dailyPinInputRef = useRef(null);

  // ==========================================
  // APERTURA REAL DE CAJA
  // La fuente de verdad es MongoDB/backend.
  // El monto base NO es una venta y NO entra al cierre.
  // ==========================================
  const [initialAmount, setInitialAmount] = useState(null);
  const [inputCajaId, setInputCajaId] = useState(cajaId);
  const [registerId, setRegisterId] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(true);
  const [inputInitialAmount, setInputInitialAmount] = useState("");

  // Estados para Modal de Crear Producto
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    name: "",
    costPrice: "",
    margin: "300",
    price: "",
    stock: "",
  });

  // Subtotal antes del descuento
const subtotal = cart.reduce(
  (sum, item) =>
    sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
  0
);



// Solo se aplica un tipo de descuento a la vez
const discountAmount =
  discountType === "percentage"
    ? Math.min(subtotal, subtotal * Math.min(100, Math.max(0, Number(discountValue) || 0)) / 100)
    : discountType === "fixed"
      ? Math.min(subtotal, Math.max(0, Number(discountValue) || 0))
      : 0;

const total = Math.max(0, subtotal - discountAmount);
const change = Number(payment) - total;

  // Índices rápidos para encontrar productos por código o nombre.
  // Se recalculan solamente cuando cambia la lista de productos.
  const productByBarcode = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const barcode = String(product?.barcode ?? "").trim();
      if (barcode) map.set(barcode, product);
    });
    return map;
  }, [products]);

  const productByName = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const name = String(product?.name ?? "").trim().toLowerCase();
      if (name) map.set(name, product);
    });
    return map;
  }, [products]);

  // ==========================================
  // RECUPERAR APERTURA ACTIVA DE LA CAJA
  // ==========================================
  const fetchOpenRegister = async (selectedCaja = cajaId) => {
    setRegisterLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cash-register/open`,
        {
          params: { cajaId: selectedCaja },
        }
      );

      const register = response.data;

      if (register) {
        setRegisterId(register._id);
        setInitialAmount(Number(register.montoBase) || 0);

        if (setMontoBase) {
          setMontoBase(Number(register.montoBase) || 0);
        }
      } else {
        setRegisterId(null);
        setInitialAmount(null);

        if (setMontoBase) {
          setMontoBase(0);
        }
      }
    } catch (error) {
      console.error("Error al consultar apertura de caja:", error);
      setRegisterId(null);
      setInitialAmount(null);

      if (setMontoBase) {
        setMontoBase(0);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenRegister(cajaId);
  }, [cajaId]);

  // Permite que el Sidebar abra directamente el cierre del POS.
  useEffect(() => {
    const openCloseModal = () => {
      setShowCloseModal(true);
    };

    window.addEventListener(
      "open-cash-register-close",
      openCloseModal
    );

    return () => {
      window.removeEventListener(
        "open-cash-register-close",
        openCloseModal
      );
    };
  }, []);

  // Cambiar y guardar nombre de la cajera
  const handleCashierChange = (e) => {
    const name = e.target.value;
    setCashier(name);
    localStorage.setItem("pos_cashier", name);
  };

  // Manejador del cambio de método de pago
  const handlePaymentMethodChange = useCallback((newMethod) => {
    setPaymentMethod(newMethod);
    if (newMethod !== "Efectivo") {
      setPayment(total);
    } else {
      setPayment("");
    }
  }, [total]);

  useEffect(() => {
    if (paymentMethod !== "Efectivo") {
      setPayment(total);
    }
  }, [cart, paymentMethod, total]);

  // "Vendido Hoy" muestra solamente las ventas del turno
  // de la caja actualmente abierta. Usa el mismo resumen del cierre.
  const fetchDailyTotal = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cash-register/summary`,
        {
          params: { cajaId },
        }
      );

      setDailyTotal(Number(res.data?.totalToday || 0));
    } catch (error) {
      console.error("Error al obtener el total del turno:", error);
    }
  };

  // OBTENER IMPRESORAS DESDE ELECTRON
  useEffect(() => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require("electron");
        ipcRenderer.invoke("get-printers").then((printerList) => {
          if (printerList && Array.isArray(printerList)) {
            setPrinters(printerList);
            if (!localStorage.getItem("selected_printer")) {
              const defaultPrinter = printerList.find((p) => p.isDefault);
              if (defaultPrinter) {
                setSelectedPrinter(defaultPrinter.name);
                localStorage.setItem("selected_printer", defaultPrinter.name);
              }
            }
          }
        });
      } catch (err) {
        console.warn("No se pudieron obtener las impresoras de Electron:", err);
      }
    }
  }, []);

  // Cargar productos y WebSocket
  useEffect(() => {
    getProducts();
    fetchDailyTotal();

    socket.on("connect", () => {
      console.log("Conectado al servidor");
    });

    socket.on("update-products", () => {
      console.log("Productos actualizados desde servidor");
      getProducts();
    });

    return () => {
      socket.off("connect");
      socket.off("update-products");
    };
  }, [cajaId]);

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products`
      );
      setProducts(response.data);
    } catch (error) {
      console.log("Error al cargar productos:", error);
    }
  };

  const handlePrinterChange = (e) => {
    const printerName = e.target.value;
    setSelectedPrinter(printerName);
    localStorage.setItem("selected_printer", printerName);
  };

  const toggleShowDailyTotal = () => {
    if (showDailyTotal) {
      setShowDailyTotal(false);
      return;
    }

    setDailyPin("");
    setShowDailyPinModal(true);

    requestAnimationFrame(() => {
      dailyPinInputRef.current?.focus();
    });
  };

  const closeDailyPinModal = () => {
    setShowDailyPinModal(false);
    setDailyPin("");
  };

  useEffect(() => {
    if (!showDailyPinModal) return;

    const handleDailyPinEscape = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDailyPinModal();
      }
    };

    window.addEventListener("keydown", handleDailyPinEscape);
    return () => window.removeEventListener("keydown", handleDailyPinEscape);
  }, [showDailyPinModal]);

  const confirmDailyPin = (e) => {
    e?.preventDefault();

    const CLAVE_CORRECTA = "0407";

    if (dailyPin === CLAVE_CORRECTA) {
      setShowDailyTotal(true);
      closeDailyPinModal();
    } else {
      alert("🔒 Clave incorrecta. Acceso denegado.");
      setDailyPin("");
      requestAnimationFrame(() => {
        dailyPinInputRef.current?.focus();
      });
    }
  };

const handleSetInitialAmount = async (e) => {
  e.preventDefault();

  // Validar número de caja
  if (!inputCajaId) {
    alert("Por favor selecciona una caja.");
    return;
  }

  // Validar monto base
  const val = Number(inputInitialAmount);

  if (!Number.isFinite(val) || val < 0) {
    alert("Por favor ingresa un monto válido");
    return;
  }

  try {
    // La caja elegida en la apertura pasa a ser la caja activa
    setCajaId(inputCajaId);
    localStorage.setItem("pos_caja_id", inputCajaId);

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/cash-register/open`,
      {
        cajaId: inputCajaId,
        cashier,
        montoBase: val,
      }
    );

    const register = response.data;

    setRegisterId(register._id);
    setInitialAmount(Number(register.montoBase) || 0);
    setInputInitialAmount("");

    if (setMontoBase) {
      setMontoBase(Number(register.montoBase) || 0);
    }

    sessionStorage.setItem(
      `montoBase_${inputCajaId}`,
      String(Number(register.montoBase) || 0)
    );

  } catch (error) {
    console.error("Error al abrir caja:", error);

    // Si ya existe una caja abierta,
    // recuperamos esa apertura en lugar de crear otra.
    if (error.response?.data?.register) {
      const register = error.response.data.register;

      setCajaId(register.cajaId);
      setInputCajaId(register.cajaId);
      localStorage.setItem("pos_caja_id", register.cajaId);

      setRegisterId(register._id);
      setInitialAmount(Number(register.montoBase) || 0);

      if (setMontoBase) {
        setMontoBase(Number(register.montoBase) || 0);
      }

      return;
    }

    alert(
      error.response?.data?.message ||
        "No se pudo abrir la caja."
    );
  }
};

  const handleRestoreProducts = async () => {
    const confirm = window.confirm(
      "¿Deseas recargar la lista de productos desde la base de datos?"
    );
    if (!confirm) return;

    try {
      await getProducts();
      alert("¡Productos recargados correctamente!");
    } catch (error) {
      console.error("Error al restaurar productos:", error);
      alert("Error al restaurar productos");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const rawData = XLSX.utils.sheet_to_json(ws);

        if (!rawData || rawData.length === 0) {
          alert("El archivo Excel está vacío.");
          return;
        }

        const formattedData = rawData
          .map((row) => {
            const valPrice =
              row.Precio_de_venta ??
              row.Precio_de_ve ??
              row.Precio ??
              row.price ??
              row.precio ??
              0;
            const cleanPrice = String(valPrice)
              .replace(/[^0-9.,]/g, "")
              .replace(",", ".")
              .trim();

            const priceNum = parseFloat(cleanPrice);

            return {
              barcode: String(
                row.Codigo || row.codigo || row.code || row.barcode || ""
              ).trim(),
              name: String(
                row.Nombre || row.nombre || row.name || "Producto sin nombre"
              ).trim(),
              price: isNaN(priceNum) ? 0 : priceNum,
              stock:
                Number(
                  String(row.Cantidad || row.stock || 0).replace(
                    /[^0-9.-]/g,
                    ""
                  )
                ) || 0,
              brand: String(row.Marca || row.brand || "Sin marca").trim(),
            };
          })
          .filter((prod) => prod.barcode !== "");

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products/bulk`,
          formattedData
        );

        alert("¡Productos importados con éxito!");
        getProducts();
        e.target.value = "";
      } catch (error) {
        console.error("Error al procesar el Excel:", error);
        alert(
          error.response?.data?.message || "Error al importar los productos."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addToCart = useCallback((product, focusSearch = true, quantity = 1) => {
    if (!product) return;

    const quantityToAdd = Math.max(1, Number(quantity) || 1);

    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item._id === product._id);

      if (existingProduct) {
        return prevCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: (Number(item.quantity) || 1) + quantityToAdd,
              }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: quantityToAdd }];
    });

    if (focusSearch) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, []);

  const addCustomToCart = useCallback((customItem) => {
    const tempProduct = {
      _id: `custom-${Date.now()}`,
      barcode: "S/C",
      name: customItem.name || "Producto Vario",
      price: Number(customItem.price),
      quantity: Math.max(1, Number(customItem.quantity) || 1),
      isCustom: true,
    };
    setCart((prevCart) => [...prevCart, tempProduct]);
  }, []);

  // Búsqueda de venta optimizada: O(1) por código/nombre, en lugar de
  // recorrer todos los productos en cada carácter escrito/escaneado.
  const handleSaleSearch = useCallback((input, quantity = 1) => {
    const value = typeof input === "string"
      ? input.trim()
      : String(input?.target?.value ?? "").trim();

    setSaleSearch(value);

    if (!value) return false;

    const quantityToAdd = Math.max(1, Number(quantity) || 1);

    const foundProduct =
      productByBarcode.get(value) ||
      productByName.get(value.toLowerCase());

    if (foundProduct) {
      addToCart(foundProduct, false, quantityToAdd);
      setSaleSearch("");
      return true;
    }

    return false;
  }, [productByBarcode, productByName, addToCart]);

  const removeFromCart = useCallback((indexToRemove) => {
    setCart((prevCart) =>
      prevCart.filter((_, index) => index !== indexToRemove)
    );
  }, []);

  const updateCartItem = useCallback((index, field, value) => {
    setCart((prevCart) =>
      prevCart.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }, []);

  const increaseQuantity = useCallback((index) => {
    setCart((prevCart) =>
      prevCart.map((item, i) =>
        i === index
          ? { ...item, quantity: (item.quantity || 0) + 1 }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((index) => {
    setCart((prevCart) =>
      prevCart
        .map((item, i) =>
          i === index
            ? { ...item, quantity: (item.quantity || 0) - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const handleInputChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const calculateSuggestedPrice = () => {
    const cost = Number(newProduct.costPrice) || 0;
    const pct = Number(newProduct.margin) || 0;
    if (cost > 0) {
      const suggested = cost * (1 + pct / 100);
      return Math.round(suggested);
    }
    return 0;
  };

  const handleApplySuggestedPrice = () => {
    const suggested = calculateSuggestedPrice();
    if (suggested > 0) {
      setNewProduct((prev) => ({
        ...prev,
        price: suggested.toString(),
      }));
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, {
        barcode: newProduct.barcode,
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
      });

      alert("¡Producto creado exitosamente!");
      setShowModal(false);
      setNewProduct({
        barcode: "",
        name: "",
        costPrice: "",
        margin: "300",
        price: "",
        stock: "",
      });
      getProducts();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto");
    }
  };

  const printTicket = useCallback((saleData = null) => {
  const ticket = saleData || lastSale;

  if (!ticket) return;

  if (!window.require) {
    console.warn(
      "La impresión ESC/POS directa solo está disponible en Electron."
    );
    return;
  }

  try {
    const { ipcRenderer } = window.require("electron");

    ipcRenderer.send("print-ticket", {
      ticket,
      printerName: selectedPrinter,
    });

  } catch (error) {
    console.error(
      "Error enviando ticket a Electron:",
      error
    );
  }
}, [lastSale, selectedPrinter]);

  const finishSale = useCallback(async (shouldPrint = true) => {
    if (processingSaleRef.current) return;

    if (cart.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }

    const finalPayment =
      paymentMethod !== "Efectivo" ? total : Number(payment);

    if (finalPayment < total) {
      alert("El pago es insuficiente");
      return;
    }

    processingSaleRef.current = true;

    try {
      for (const item of cart) {
        const isRealMongoId =
          item._id &&
          !String(item._id).startsWith("custom-") &&
          !item.isCustom;

        if (isRealMongoId) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/products/sell/${item._id}`,
            { quantity: item.quantity }
          );
        }
      }

      const formattedProducts = cart.map((item) => {
        const isCustom =
          item.isCustom || String(item._id).startsWith("custom-");
        return {
          barcode: item.barcode || "S/C",
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          ...(isCustom ? {} : { _id: item._id, productId: item._id }),
        };
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sales`,
        {
          products: formattedProducts,
          subtotal,
          discountType,
          discountValue: Number(discountValue) || 0,
          discountAmount,
          total,
          payment: finalPayment,
          paymentMethod,
          cashier,
          cajaId,
        }
      );

      setDailyTotal((prevTotal) => prevTotal + total);

      const ticketData = {
        products: [...cart],
        subtotal,
        discountType,
        discountValue: Number(discountValue) || 0,
        discountAmount,
        total,
        payment: finalPayment,
        paymentMethod,
        cashier,
        cajaId,
        ticketNumber: response.data?.ticketNumber || "N/A",
      };

      setLastSale(ticketData);

      // ESTADOS LIMPIADOS PARA LA SIGUIENTE VENTA
      setCart([]);
      setPayment("");
      setPaymentMethod("Efectivo"); // Reset a Efectivo
      setDiscountType("none");
      setDiscountValue("");
      setRefreshSales((prev) => !prev);
      getProducts();

      if (shouldPrint) {
        // Electron recibe el ticket completo con todos sus valores.
        printTicket(ticketData);
      } else {
        window.focus();
      }
    } catch (error) {
      console.error("Error al procesar la venta:", error);
      alert("Error al procesar la venta.");
    } finally {
      processingSaleRef.current = false;
    }
  }, [cart, payment, paymentMethod, total, cashier, cajaId, printTicket]);

  if (registerLoading) {
    return (
      <div
        className="pos-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
        }}
      >
        <h3>🔄 Verificando apertura de caja...</h3>
      </div>
    );
  }

  return (
    <div className="pos-container">
      {/* MODAL APERTURA DE CAJA */}
     {initialAmount === null && (
  <div className="modal-overlay" style={{ zIndex: 10000 }}>
    <div
      className="modal-content"
      style={{
        textAlign: "center",
        maxWidth: "380px",
      }}
    >
      <h2>💵 Apertura de Caja</h2>

      <form onSubmit={handleSetInitialAmount}>

        {/* NÚMERO DE CAJA */}
        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
            }}
          >
            🖥️ Número de Caja
          </label>

          <select
            value={inputCajaId}
            onChange={(e) => setInputCajaId(e.target.value)}
            style={{
              width: "100%",
              fontSize: "18px",
              padding: "10px",
              textAlign: "center",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
            required
          >
            <option value="caja_1">Caja 1</option>
            <option value="caja_2">Caja 2</option>
          </select>
        </div>

        {/* MONTO BASE */}
        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "6px",
            }}
          >
            💰 Monto Base
          </label>

          <input
            type="number"
            placeholder="Ej. 50000"
            value={inputInitialAmount}
            onChange={(e) =>
              setInputInitialAmount(e.target.value)
            }
            style={{
              fontSize: "18px",
              padding: "10px",
              textAlign: "center",
              width: "100%",
              boxSizing: "border-box",
            }}
            min="0"
            step="1"
            autoFocus
            required
          />
        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          className="btn-guardar-mongo"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
          }}
        >
          Iniciar Turno
        </button>

      </form>
    </div>
  </div>
)}

      <div
  className="pos-top"
  style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 38%)",
    width: "100%",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    gap: "15px",
  }}
>
        <div
  className="products-section"
  style={{
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
          <h2 style={{ margin: "0 0 10px 0" }}>Buscar producto</h2>

          {/* BARRA SUPERIOR POS */}
          <div className="pos-top-bar">
            {/* Caja ID */}
            <div style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", borderLeft: "3px solid #e11d48" }}>
              <span style={{ color: "#94a3b8", fontWeight: "bold" }}>🖥️ Caja:</span>
              <select
                value={cajaId}
              onChange={(e) => {
                  const nuevaCaja = e.target.value;

                  setCajaId(nuevaCaja);
                  localStorage.setItem("pos_caja_id", nuevaCaja);

                  setInitialAmount(null);
                  setRegisterId(null);
                  setRegisterLoading(true);

                  fetchOpenRegister(nuevaCaja);
                }}
                style={{ backgroundColor: "#1e293b", color: "#f8fafc", border: "1px solid #475569", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", outline: "none", cursor: "pointer" }}
              >
                <option value="caja_1">Caja 1</option>
                <option value="caja_2">Caja 2</option>
              </select>
            </div>

            {/* Cajera */}
            <div style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", borderLeft: "3px solid #f59e0b" }}>
              <span style={{ color: "#94a3b8", fontWeight: "bold" }}>👤 Cajera/o:</span>
              <input
                type="text"
                value={cashier}
                onChange={handleCashierChange}
                placeholder="Nombre de cajera"
                style={{ backgroundColor: "#1e293b", color: "#f8fafc", border: "1px solid #475569", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", width: "110px", outline: "none" }}
              />
            </div>

            {/* Monto Base */}
            <div style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", borderLeft: "3px solid #38bdf8" }}>
              <span style={{ color: "#94a3b8", fontWeight: "bold" }}>Monto Base:</span>
              <strong style={{ color: "#38bdf8", fontSize: "14px" }}>${(initialAmount || 0).toLocaleString("es-CL")}</strong>
            </div>

            {/* Vendido Hoy */}
            <div
              style={{ 
                backgroundColor: "#0f172a", 
                color: "#ffffff", 
                padding: "6px 12px", 
                borderRadius: "6px", 
                fontSize: "12px", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px", 
                borderLeft: "3px solid #22c55e",
                cursor: "pointer" 
              }}
            >
              <span style={{ color: "#94a3b8", fontWeight: "bold" }}>Vendido Hoy:</span>
              <strong style={{ color: "#22c55e", fontSize: "14px" }}>
                {showDailyTotal ? `$${dailyTotal.toLocaleString("es-CL", { minimumFractionDigits: 0 })}` : "$ ****"}
              </strong>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShowDailyTotal();
                }}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", padding: "0 2px" }}
              >
                {showDailyTotal ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Impresora */}
            <div style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px", borderLeft: "3px solid #a855f7" }}>
              <span style={{ color: "#94a3b8", fontWeight: "bold" }}>🖨️ Impresora:</span>
              <select value={selectedPrinter} onChange={handlePrinterChange} style={{ backgroundColor: "#1e293b", color: "#f8fafc", border: "1px solid #475569", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", outline: "none", cursor: "pointer" }}>
                <option value="">Default del sistema</option>
                {printers.map((printer, idx) => (
                  <option key={idx} value={printer.name}>
                    {printer.name} {printer.isDefault ? "★" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ACCIONES SECUNDARIAS */}
          <div className="pos-actions-row">
            <button type="button" onClick={handleRestoreProducts} style={{ backgroundColor: "#64748b", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
              🔄 Restaurar
            </button>

            <label style={{ backgroundColor: "#0284c7", color: "#fff", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "12px", display: "inline-block" }}>
              📁 Cargar Excel
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>

            <button className="btn-crear-producto" onClick={() => setShowModal(true)}>
              + Crear Producto
            </button>
            <button
              type="button"
              onClick={() => setShowCloseModal(true)}
              style={{
                backgroundColor: "#059669",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              🔒 Cierre de Caja
            </button>
          </div>

          {/* BÚSQUEDA DE PRODUCTO */}
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => {
              // Si el foco se pierde accidentalmente, se recupera al siguiente ciclo.
              requestAnimationFrame(() => {
                if (document.activeElement === document.body) {
                  searchInputRef.current?.focus();
                }
              });
            }}
          />

          {/* TABLA DE PRODUCTOS */}
          <div
  className="products-table-container"
  style={{
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
  }}
>
  <ProductTable
    products={products}
    search={search}
    addToCart={addToCart}
  />
</div>
        </div>

        {/* SECCIÓN CARRITO */}
        <div
  className="cart-section"
  style={{
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  }}
>
          <Sales
            saleSearch={saleSearch}
            handleSaleSearch={handleSaleSearch}
            cart={cart}
            total={total}
            subtotal={subtotal}
            discountType={discountType}
            discountValue={discountValue}
            setDiscountType={setDiscountType}
            setDiscountValue={setDiscountValue}
            discountAmount={discountAmount}
            payment={payment}
            setPayment={setPayment}
            paymentMethod={paymentMethod}
            setPaymentMethod={handlePaymentMethodChange}
            change={change}
            removeFromCart={removeFromCart}
            updateCartItem={updateCartItem}
            finishSale={finishSale}
            printTicket={printTicket}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            addCustomToCart={addCustomToCart}
          />
        </div>
      </div>

      {/* MODAL CLAVE PARA VER VENDIDO HOY */}
      {showDailyPinModal && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeDailyPinModal();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
        >
          <form
            onSubmit={confirmDailyPin}
            style={{
              width: "min(360px, 100%)",
              background: "#ffffff",
              borderRadius: "14px",
              padding: "22px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "20px",
                }}
              >
                🔒 Acceso de Administrador
              </h3>

              <button
                type="button"
                onClick={closeDailyPinModal}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                margin: "0 0 10px 0",
                color: "#475569",
                fontSize: "14px",
              }}
            >
              Ingresa la clave para ver el total vendido.
            </p>

            <input
              ref={dailyPinInputRef}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={dailyPin}
              onChange={(e) => setDailyPin(e.target.value)}
              placeholder="Clave de Administrador"
              autoFocus
              style={{
                width: "100%",
                height: "46px",
                boxSizing: "border-box",
                padding: "0 12px",
                border: "2px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "18px",
                outline: "none",
                textAlign: "center",
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                height: "44px",
                marginTop: "12px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Ver vendido
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: "9px",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              ENTER = confirmar · ESC = cancelar
            </div>
          </form>
        </div>
      )}

      {/* TICKET DE IMPRESIÓN */}
{showTicket && lastSale && (
  <div className="ticket-wrapper">
    <Ticket
      cart={lastSale.products}
      subtotal={lastSale.subtotal}
      discountType={lastSale.discountType}
      discountValue={lastSale.discountValue}
      discountAmount={lastSale.discountAmount}
      total={lastSale.total}
      payment={lastSale.payment}
      paymentMethod={lastSale.paymentMethod}
      ticketNumber={lastSale.ticketNumber}
      cashier={lastSale.cashier}
    />
  </div>
)}

      {/* MODAL CIERRE DE CAJA */}
      {showCloseModal && (
        <CashRegisterClose
          cajaId={cajaId}
          registerId={registerId}
          onClose={() => setShowCloseModal(false)}
          onClosed={() => {
            setShowCloseModal(false);
            setInitialAmount(null);
            setRegisterId(null);

            if (setMontoBase) {
              setMontoBase(0);
            }

            sessionStorage.removeItem(
              `montoBase_${cajaId}`
            );

            if (onLogout) {
              onLogout();
            }
          }}
        />
      )}

      {/* MODAL CREAR PRODUCTO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Nuevo Producto</h3>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Código / Barcode:</label>
                <input type="text" name="barcode" value={newProduct.barcode} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Nombre del Producto:</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} required />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Precio Costo (Opcional):</label>
                  <input
                    type="number"
                    name="costPrice"
                    placeholder="Ej. 1000"
                    value={newProduct.costPrice}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group" style={{ width: "100px" }}>
                  <label>% Ganancia:</label>
                  <input
                    type="number"
                    name="margin"
                    value={newProduct.margin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ margin: 0 }}>Precio Venta Final:</label>
                  {Number(newProduct.costPrice) > 0 && (
                    <button
                      type="button"
                      onClick={handleApplySuggestedPrice}
                      style={{
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                        border: "1px solid #7dd3fc",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      💡 Sugerir {newProduct.margin}% (${calculateSuggestedPrice().toLocaleString("es-CL")})
                    </button>
                  )}
                </div>
                <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Stock Inicial:</label>
                <input type="number" name="stock" value={newProduct.stock} onChange={handleInputChange} required />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-guardar-mongo">Guardar</button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => {
                    setShowModal(false);
                    setNewProduct({
                      barcode: "",
                      name: "",
                      costPrice: "",
                      margin: "300",
                      price: "",
                      stock: "",
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default POS;