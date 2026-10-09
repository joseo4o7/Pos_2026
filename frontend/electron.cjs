const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const printer = require("@lastapp/node-printer");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(
    path.join(__dirname, "dist", "index.html")
  ).catch((err) => {
    console.error("Error al cargar la aplicación:", err);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


// ======================================================
// OBTENER IMPRESORAS INSTALADAS EN WINDOWS
// ======================================================

ipcMain.handle("get-printers", async () => {
  try {
    const printers = printer.getPrinters();

    return printers.map((p) => ({
      name: p.name,
      displayName: p.name,
      isDefault: p.isDefault || false,
    }));
  } catch (error) {
    console.error("Error obteniendo impresoras:", error);
    return [];
  }
});


// ======================================================
// FUNCIONES ESC/POS
// ======================================================

function crearTicketESC(ticket) {
  const ESC = "\x1B";
  const GS = "\x1D";

  let data = "";

  // Inicializar impresora
  data += ESC + "@";

  // Centrar
  data += ESC + "a" + "\x01";

  // Título
  data += ESC + "E" + "\x01";
  data += "PUNTO ELECTRONICO\n";
  data += ESC + "E" + "\x00";

  data += "MARIQUINA 1190\n";

  data += "-----------------------------------------------\n";

  // Alinear izquierda
  data += ESC + "a" + "\x00";

  const fecha = new Date();

  const fechaTexto = fecha.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const horaTexto = fecha.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  data += `Fecha: ${fechaTexto} ${horaTexto}\n`;

  data += `Boleta Nº: ${String(
    ticket.ticketNumber || "N/A"
  ).padStart(6, "0")}\n`;

  data += `Atendido: ${ticket.cashier || "Cajera/o"}\n`;

  data += "-----------------------------------------------\n";

  // Encabezado productos
  data += "Cant.  Producto                         Total\n";
  data += "-----------------------------------------------\n";


  // ==================================================
  // PRODUCTOS
  // ==================================================

  for (const item of ticket.products || []) {
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const subtotal = price * quantity;

    let nombre = String(item.name || "Producto");

    // Limitar nombre para que no rompa el ticket
    if (nombre.length > 28) {
      nombre = nombre.substring(0, 28);
    }

    const cantidadTexto = String(quantity).padEnd(6);

    const precioTexto = `$${subtotal.toLocaleString("es-CL")}`;

    const precioAjustado = precioTexto.padStart(10);

    data += `${cantidadTexto}${nombre.padEnd(28)}${precioAjustado}\n`;
  }


  data += "-----------------------------------------------\n";


  // ==================================================
  // TOTALES
  // ==================================================

  const total = Number(ticket.total || 0);
  const payment = Number(ticket.payment || 0);
  const vuelto = Math.max(payment - total, 0);

  data += ESC + "E" + "\x01";

  data += `TOTAL:       $${total.toLocaleString("es-CL")}\n`;

  data += ESC + "E" + "\x00";

  data += `PAGO:        $${payment.toLocaleString("es-CL")}\n`;

  data += `METODO:      ${ticket.paymentMethod || "Efectivo"}\n`;

  data += `VUELTO:      $${vuelto.toLocaleString("es-CL")}\n`;

  data += "-----------------------------------------------\n";


  // ==================================================
  // FINAL
  // ==================================================

  data += ESC + "a" + "\x01";

  data += "\n";
  data += "¡Gracias por su compra!\n";
  data += "Que tenga un excelente día.\n";

  // Avanzar papel
  data += "\n";
  data += "\n";
  data += "\n";

  // CORTE DE PAPEL
  data += GS + "V" + "\x00";

  return Buffer.from(data, "utf8");
}


// ======================================================
// IMPRESIÓN DIRECTA ESC/POS
// ======================================================

ipcMain.on(
  "print-ticket",
  (event, { ticket, printerName }) => {

    try {

      if (!printerName) {
        console.error("No se seleccionó una impresora.");
        return;
      }

      const ticketData = crearTicketESC(ticket);

      printer.printDirect({
        data: ticketData,
        printer: printerName,
        type: "RAW",

        success: (jobId) => {
          console.log(
            `Ticket enviado directamente a ${printerName}. Trabajo: ${jobId}`
          );
        },

        error: (error) => {
          console.error(
            "Error de impresión ESC/POS:",
            error
          );
        },
      });

    } catch (error) {

      console.error(
        "Error preparando impresión:",
        error
      );

    }

  }
);