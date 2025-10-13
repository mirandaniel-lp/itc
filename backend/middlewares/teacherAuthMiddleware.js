import jwt from "jsonwebtoken";

export const authenticateTeacher = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No autorizado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.teacher = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};
