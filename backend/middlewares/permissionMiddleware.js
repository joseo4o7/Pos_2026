const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "No autenticado.",
      });
    }

    // El superadmin tiene acceso a todas las funciones
    if (req.user.role === "superadmin") {
      return next();
    }

    // Verificar permiso específico
    if (!req.user.permissions || !req.user.permissions[permission]) {
      return res.status(403).json({
        message: "No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
};

module.exports = requirePermission;