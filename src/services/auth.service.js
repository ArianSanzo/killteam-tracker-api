import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { createAuthToken, getRoleKey, toPublicUser } from "../middleware/auth.js";

const normalizeRole = (name = "") => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const hashPassword = (password) => bcrypt.hash(password, 10);
const verifyPassword = (password, stored) => bcrypt.compare(password, stored);

export const initializeAuth = async () => {
  const aliases = await Role.findAll();
  const findAlias = (names) => aliases.find((role) => names.includes(normalizeRole(role.name)));
  const userRole = findAlias(["usuario", "user"]) ?? await Role.create({ name: "usuario" });
  const adminRole = findAlias(["administrador", "admin"]) ?? await Role.create({ name: "administrador" });
  const superRole = findAlias(["superadmin", "superadministrador", "superusuario"]) ?? await Role.create({ name: "superadmin" });
  const bootstrapEmail = String(process.env.SUPERADMIN_EMAIL || "first-admin@killteam.local").trim().toLowerCase();
  const existingBootstrap = await User.findOne({ where: { email: bootstrapEmail }, include: [Role] });
  if (!existingBootstrap) {
    const password = process.env.SUPERADMIN_PASSWORD || randomBytes(18).toString("base64url");
    const baseName = process.env.SUPERADMIN_NAME || "Superadmin inicial";
    const name = await User.findOne({ where: { name: baseName } })
      ? `${baseName} ${randomBytes(3).toString("hex")}`
      : baseName;
    await User.create({
      name,
      email: bootstrapEmail,
      password: await hashPassword(password),
      roleId: superRole.id,
    });
    console.log(`Cuenta superadmin inicial: ${bootstrapEmail}`);
    if (!process.env.SUPERADMIN_PASSWORD) {
      console.log(`Contraseña inicial: ${password}`);
      console.log("Guarda esta contraseña; no volverá a mostrarse.");
    }
  } else if (getRoleKey(existingBootstrap.role) !== "superadmin") {
    console.warn(`No se creó el superadmin inicial porque ${bootstrapEmail} ya pertenece a otra cuenta. Define SUPERADMIN_EMAIL antes del primer arranque.`);
  }
  return { userRole, adminRole, superRole };
};

export const login = async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  if (!email || !password || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).send({ message: "Completa email y contraseña (máximo 72 bytes)." });
  }

  const user = await User.findOne({ where: { email }, include: [Role] });
  if (!user) return res.status(401).send({ message: "Email o contraseña incorrectos." });
  if (!await verifyPassword(password, user.password)) {
    return res.status(401).send({ message: "Email o contraseña incorrectos." });
  }

  return res.send({ token: createAuthToken(user), user: toPublicUser(user) });
};

export const register = async (req, res) => {
  const name = String(req.body.name ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).send({ message: "Indica un nombre, un email válido y una contraseña de 8 a 72 bytes." });
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(409).send({ message: "Ya existe una cuenta con ese email." });
  const roles = await Role.findAll();
  const role = roles.find((item) => ["user", "usuario"].includes(normalizeRole(item.name)));
  if (!role) return res.status(500).send({ message: "No está configurado el rol de usuario." });
  try {
    const user = await User.create({ name, email, password: await hashPassword(password), roleId: role.id });
    await user.reload({ include: [Role] });
    return res.status(201).send({ token: createAuthToken(user), user: toPublicUser(user) });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") return res.status(409).send({ message: "Ese nombre o email ya está en uso." });
    throw error;
  }
};

export const currentUser = (req, res) => res.send(toPublicUser(req.user));

export const updateCurrentUser = async (req, res) => {
  const { currentPassword } = req.body;
  const changes = {};

  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) return res.status(400).send({ message: "El nombre no puede quedar vacío." });
    changes.name = name;
  }

  if (req.body.email !== undefined) {
    const email = String(req.body.email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).send({ message: "Indica un email válido." });
    changes.email = email;
  }

  if (req.body.password !== undefined) {
    const password = String(req.body.password);
    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).send({ message: "La nueva contraseña debe tener entre 8 y 72 bytes." });
    }
    changes.password = password;
  }

  if (!Object.keys(changes).length) return res.status(400).send({ message: "Indica al menos un dato para actualizar." });
  if ((changes.email || changes.password) && !await verifyPassword(String(currentPassword ?? ""), req.user.password)) {
    return res.status(401).send({ message: "La contraseña actual no es correcta." });
  }
  if (changes.password) changes.password = await hashPassword(changes.password);

  await req.user.update(changes);
  await req.user.reload({ include: [Role] });
  return res.send(toPublicUser(req.user));
};
