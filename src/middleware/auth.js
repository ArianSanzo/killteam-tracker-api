import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("Configura JWT_SECRET en el entorno antes de iniciar el servidor.");

const normalizeRole = (name = "") => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const roleKey = (role) => {
  const name = normalizeRole(role?.name);
  if (name.includes("superadmin") || name.includes("superusuario")) return "superadmin";
  if (name === "admin" || name.includes("administrador")) return "admin";
  return "user";
};

export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roleId: user.roleId,
  role: user.role?.name ?? "usuario",
  roleKey: roleKey(user.role),
});

export const createAuthToken = (user) => jwt.sign({ id: user.id }, SECRET, { expiresIn: "12h" });

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return res.status(401).send({ message: "Inicia sesión para continuar." });
    const payload = jwt.verify(token, SECRET);
    const user = await User.findByPk(payload.id, { include: [Role] });
    if (!user) return res.status(401).send({ message: "La cuenta ya no está disponible." });
    req.user = user;
    return next();
  } catch {
    return res.status(401).send({ message: "La sesión no es válida o venció." });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(roleKey(req.user.role))) {
    return res.status(403).send({ message: "No tienes permiso para realizar esta acción." });
  }
  return next();
};

export const getRoleKey = roleKey;
