import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

export const authorizeRole = (roleId) => (req, res, next) => {
  if (req.user.roleId !== roleId) {
    return res.status(403).json({ error: "No tienes permisos" });
  }
  next();
};
