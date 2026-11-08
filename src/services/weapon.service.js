import { Op } from "sequelize";
import { sequelize } from "../db.js";
import { GameOperative } from "../models/GameOperative.js";
import { Rule } from "../models/Rule.js";
import { Weapon } from "../models/Weapon.js";
import { WeaponRule } from "../models/WeaponRules.js";

const invalid = (message, status = 400) => Object.assign(new Error(message), { status });
const ruleIdsFrom = (body) => {
  if (body.ruleIds === undefined) return undefined;
  if (!Array.isArray(body.ruleIds)) throw invalid("ruleIds debe ser un arreglo de IDs.");
  const ids = [...new Set(body.ruleIds.map(Number))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) throw invalid("ruleIds contiene un ID inválido.");
  return ids;
};
const weaponIncludes = [{ model: WeaponRule, include: [Rule] }];
const asResponse = (instance) => {
  const weapon = instance.toJSON();
  return { ...weapon, rules: (weapon.weapon_rules ?? []).map((link) => link.rule).filter(Boolean) };
};
const validateFields = ({ name, attack, hit, damage, range }) => {
  const missing = (value) => value === undefined || value === null || String(value).trim() === "";
  const invalidRange = range !== null && range !== undefined &&
    (String(range).trim() === "" || !Number.isInteger(Number(range)) || Number(range) < 0);
  if (typeof name !== "string" || !name.trim() || missing(attack) || missing(hit) || missing(damage) || invalidRange) {
    throw invalid("Completa name, attack, hit y damage; range debe ser un entero no negativo o null.");
  }
};

const syncRules = async (weaponId, ruleIds, transaction) => {
  if (ruleIds === undefined) return;
  const count = await Rule.count({ where: { id: { [Op.in]: ruleIds } }, transaction });
  if (count !== ruleIds.length) throw invalid("Una o más reglas seleccionadas no existen.");
  await WeaponRule.destroy({ where: { weaponId }, transaction });
  if (ruleIds.length) {
    await WeaponRule.bulkCreate(ruleIds.map((ruleId) => ({ weaponId, ruleId })), { transaction });
  }
};

export const findWeapons = async (_req, res) => {
  const weapons = await Weapon.findAll({ include: weaponIncludes, order: [["name", "ASC"]] });
  return res.send(weapons.map(asResponse));
};

export const findWeapon = async (req, res) => {
  const weapon = await Weapon.findByPk(req.params.id, { include: weaponIncludes });
  if (!weapon) return res.status(404).send({ message: "Arma no encontrada." });
  return res.send(asResponse(weapon));
};

export const createWeapon = async (req, res) => {
  validateFields(req.body);
  const ruleIds = ruleIdsFrom(req.body) ?? [];
  const weapon = await sequelize.transaction(async (transaction) => {
    const created = await Weapon.create({
      name: req.body.name.trim(), attack: req.body.attack, hit: req.body.hit,
      damage: req.body.damage, range: req.body.range == null ? null : Number(req.body.range),
    }, { transaction });
    await syncRules(created.id, ruleIds, transaction);
    return created;
  });
  const result = await Weapon.findByPk(weapon.id, { include: weaponIncludes });
  return res.status(201).send(asResponse(result));
};

export const updateWeapon = async (req, res) => {
  validateFields(req.body);
  const ruleIds = ruleIdsFrom(req.body);
  const weapon = await sequelize.transaction(async (transaction) => {
    const current = await Weapon.findByPk(req.params.id, { transaction });
    if (!current) throw invalid("Arma no encontrada.", 404);
    await current.update({
      name: req.body.name.trim(), attack: req.body.attack, hit: req.body.hit,
      damage: req.body.damage, range: req.body.range == null ? null : Number(req.body.range),
    }, { transaction });
    await syncRules(current.id, ruleIds, transaction);
    return current;
  });
  const result = await Weapon.findByPk(weapon.id, { include: weaponIncludes });
  return res.send(asResponse(result));
};

export const deleteWeapon = async (req, res) => {
  const weapon = await Weapon.findByPk(req.params.id);
  if (!weapon) return res.status(404).send({ message: "Arma no encontrada." });
  if (await GameOperative.count({ where: { weaponId: weapon.id } })) {
    return res.status(409).send({ message: "No se puede eliminar un arma que ya fue elegida en partidas." });
  }
  await weapon.destroy();
  return res.status(204).end();
};
