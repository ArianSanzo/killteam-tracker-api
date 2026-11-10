import { Op } from "sequelize";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { getRoleKey } from "../middleware/auth.js";

const normalizeRole = (name = "") =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
const assignableRoles = new Set([
  "usuario",
  "user",
  "administrador",
  "admin",
  "superadmin",
  "superadministrador",
  "superusuario",
]);

export const findUsers = async (_req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
    include: [{ model: Role, attributes: ["id", "name"] }],
    order: [["name", "ASC"]],
  });
  return res.send(users);
};

export const findRoles = async (_req, res) => {
  const categories = new Map([
    ["usuario", "user"],
    ["user", "user"],
    ["administrador", "admin"],
    ["admin", "admin"],
    ["superadmin", "superadmin"],
    ["superadministrador", "superadmin"],
    ["superusuario", "superadmin"],
  ]);
  const roles = await Role.findAll({ order: [["id", "ASC"]] });
  const selected = new Set();
  return res.send(
    roles.filter((role) => {
      const normalized = normalizeRole(role.name);
      const category = categories.get(normalized);
      if (!category || selected.has(category)) return false;
      selected.add(category);
      return true;
    }),
  );
};

export const updateUserRole = async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [Role] });
  if (!user) {
    return res.status(404).send({ message: "Usuario no encontrado." });
  } 
  if (Number(user.id) === Number(req.user.id)) {
    return res.status(409).send({ message: "No puedes cambiar tu propio rango desde esta pantalla."});
  }
   
  const roleId = Number(req.body.roleId);
  if (!Number.isInteger(roleId) || roleId <= 0) {
    return res.status(400).send({ message: "El rol seleccionado no es válido." });
  }
    
  const role = await Role.findByPk(roleId);
  if (!role) {
    return res.status(400).send({ message: "El rol seleccionado no existe." });
  }
    
  if (!assignableRoles.has(normalizeRole(role.name))) {
    return res.status(400).send({ message: "El rango seleccionado no es válido." });
  }  
  if ( getRoleKey(user.role) === "superadmin" && getRoleKey(role) !== "superadmin") {
    const superadminRoleIds = (await Role.findAll()).filter((item) => getRoleKey(item) === "superadmin").map((item) => item.id);
    const superadminCount = await User.count({
      where: { roleId: { [Op.in]: superadminRoleIds } },
    });
    if (superadminCount <= 1) {
      return res.status(409).send({ message: "Debe quedar al menos un superadmin." });
    }
      
  }

  await user.update({ roleId: role.id });
  return res.send({
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: role.id,
    role: role.name,
  });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id, { include: [Role] });
  if (!user) {
    return res.status(404).send({ message: "Usuario no encontrado." });
  } 
  if (Number(user.id) === Number(req.user.id)) {
    return res.status(409).send({ message: "No puedes eliminar tu propia cuenta desde esta pantalla." });
  }
    
  if (getRoleKey(user.role) === "superadmin") {
    const superadminRoleIds = (await Role.findAll())
      .filter((item) => getRoleKey(item) === "superadmin")
      .map((item) => item.id);
    const superadminCount = await User.count({
      where: { roleId: { [Op.in]: superadminRoleIds } }
    });
    if (superadminCount <= 1) {
      return res.status(409).send({ message: "Debe quedar al menos un superadmin." });
    }
      
  }
  await user.destroy();
  return res.status(204).end();
};
