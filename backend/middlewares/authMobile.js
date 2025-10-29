import jwt from "jsonwebtoken";

export default function authMobile(req, res, next) {
  const h = req.headers.authorization || "";
  const p = h.split(" ");
  if (p.length !== 2 || p[0] !== "Bearer") {
    return res
      .status(401)
      .json({ ok: false, message: "No autorizado", code: "UNAUTHORIZED" });
  }
  try {
    const decoded = jwt.verify(p[1], process.env.JWT_SECRET || "devsecret");
    if (!decoded || !decoded.studentId) {
      return res
        .status(401)
        .json({ ok: false, message: "No autorizado", code: "UNAUTHORIZED" });
    }
    req.studentId = decoded.studentId;
    next();
  } catch {
    return res.status(401).json({
      ok: false,
      message: "Sesión expirada o token inválido",
      code: "TOKEN_INVALID",
    });
  }
}
