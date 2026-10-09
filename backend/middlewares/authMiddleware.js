const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // 1. Obtener el token del encabezado de la petición
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Si no hay token, denegar el acceso
  if (!token) {
    return res.status(401).json({
      message: "Acceso denegado. No se proporcionó un token de autenticación.",
    });
  }

  try {
    // 3. Obtener la clave secreta desde las variables de entorno
    const secret = process.env.JWT_SECRET;

    // 4. Verificar que el servidor tenga configurada la clave
    if (!secret) {
      console.error("JWT_SECRET no está configurado.");
      return res.status(500).json({
        message: "Error de configuración del servidor.",
      });
    }

    // 5. Verificar si el token es válido
    const decoded = jwt.verify(token, secret);

    // 6. Guardar los datos del usuario decodificado
    req.user = decoded;

    // 7. Continuar a la siguiente función/ruta
    next();
  } catch (error) {
    console.error("Error al validar token:", error.message);

    return res.status(403).json({
      message: "Token inválido o expirado.",
    });
  }
};

module.exports = authMiddleware;