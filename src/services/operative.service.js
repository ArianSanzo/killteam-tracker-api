import { Op } from "sequelize";
import { sequelize } from "../db.js";
import { Ability } from "../models/Ability.js";
import { GameOperative } from "../models/GameOperative.js";
import { Operative } from "../models/Operative.js";
import { OperativeAbility } from "../models/OperativeAbilities.js";
import { OperativeWeapon } from "../models/OperativeWeapons.js";
import { Team } from "../models/Team.js";
import { Weapon } from "../models/Weapon.js";

const invalid = (message, status = 400) => Object.assign(new Error(message), { status });
const linksFor = (body, key) => {
  if (body[key] === undefined) return undefined;
  if (!Array.isArray(body[key])) throw invalid(`${key} debe ser un arreglo de IDs.`);
  const ids = [...new Set(body[key].map(Number))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) throw invalid(`${key} contiene un ID inválido.`);
  return ids;
};

const operativeIncludes = [
  Team,
  { model: OperativeWeapon, include: [Weapon] },
  { model: OperativeAbility, include: [Ability] },
];

const asResponse = (instance) => {
  const operative = instance.toJSON();
  return {
    ...operative,
    weapons: (operative.operative_weapons ?? []).map((link) => link.weapon).filter(Boolean),
    abilities: (operative.operative_abilities ?? []).map((link) => link.ability).filter(Boolean),
  };
};

const replaceLinks = async (model, foreignKey, id, ids, transaction) => {
  if (ids === undefined) return;
  const target = foreignKey === "weaponId" ? Weapon : Ability;
  const existingCount = await target.count({ where: { id: { [Op.in]: ids } }, transaction });
  if (existingCount !== ids.length) throw invalid(`Uno o más IDs de ${foreignKey === "weaponId" ? "armas" : "habilidades"} no existen.`);
  await model.destroy({ where: { operativeId: id }, transaction });
  if (ids.length) {
    await model.bulkCreate(ids.map((relatedId) => ({ operativeId: id, [foreignKey]: relatedId })), { transaction });
  }
};

const validateFields = ({ name, wounds, movement, apl, save, img, teamId }) => {
  const missing = (value) => value === undefined || value === null || String(value).trim() === "";
  if (typeof name !== "string" || !name.trim() || missing(wounds) || missing(movement) ||
      missing(apl) || missing(save) || img === undefined || img === null ||
      !Number.isInteger(Number(teamId)) || Number(teamId) <= 0) {
    throw invalid("Completa name, wounds, movement, apl, save, img y teamId.");
  }
};

export const findOperatives = async (_req, res) => {
  const operatives = await Operative.findAll({ include: operativeIncludes, order: [["name", "ASC"]] });
  return res.send(operatives.map(asResponse));
};

export const findOperative = async (req, res) => {
  const operative = await Operative.findByPk(req.params.id, { include: operativeIncludes });
  if (!operative) return res.status(404).send({ message: "Operativo no encontrado." });
  return res.send(asResponse(operative));
};

export const createOperative = async (req, res) => {
  const fields = req.body;
  validateFields(fields);
  const weaponIds = linksFor(fields, "weaponIds");
  if (!weaponIds?.length) throw invalid("Asigna al menos un arma al operativo.");
  const abilityIds = linksFor(fields, "abilityIds") ?? [];

  const operative = await sequelize.transaction(async (transaction) => {
    if (!await Team.findByPk(fields.teamId, { transaction })) throw invalid("El equipo seleccionado no existe.", 404);
    const created = await Operative.create({
      name: fields.name.trim(), wounds: fields.wounds, movement: fields.movement,
      apl: fields.apl, save: fields.save, img: fields.img, teamId: Number(fields.teamId),
    }, { transaction });
    await replaceLinks(OperativeWeapon, "weaponId", created.id, weaponIds, transaction);
    await replaceLinks(OperativeAbility, "abilityId", created.id, abilityIds, transaction);
    return created;
  });

  const result = await Operative.findByPk(operative.id, { include: operativeIncludes });
  return res.status(201).send(asResponse(result));
};

export const updateOperative = async (req, res) => {
  const fields = req.body;
  validateFields(fields);
  const weaponIds = linksFor(fields, "weaponIds");
  if (weaponIds && !weaponIds.length) return res.status(400).send({ message: "Un operativo debe tener al menos un arma." });
  const abilityIds = linksFor(fields, "abilityIds");

  const operative = await sequelize.transaction(async (transaction) => {
    const current = await Operative.findByPk(req.params.id, { transaction });
    if (!current) throw invalid("Operativo no encontrado.", 404);
    if (!await Team.findByPk(fields.teamId, { transaction })) throw invalid("El equipo seleccionado no existe.", 404);
    await current.update({
      name: fields.name.trim(), wounds: fields.wounds, movement: fields.movement,
      apl: fields.apl, save: fields.save, img: fields.img, teamId: Number(fields.teamId),
    }, { transaction });
    await replaceLinks(OperativeWeapon, "weaponId", current.id, weaponIds, transaction);
    await replaceLinks(OperativeAbility, "abilityId", current.id, abilityIds, transaction);
    return current;
  });

  const result = await Operative.findByPk(operative.id, { include: operativeIncludes });
  return res.send(asResponse(result));
};

export const deleteOperative = async (req, res) => {
  const operative = await Operative.findByPk(req.params.id);
  if (!operative) return res.status(404).send({ message: "Operativo no encontrado." });
  if (await GameOperative.count({ where: { operativeId: operative.id } })) {
    return res.status(409).send({ message: "No se puede eliminar un operativo que ya participa en partidas." });
  }
  await operative.destroy();
  return res.status(204).end();
};
