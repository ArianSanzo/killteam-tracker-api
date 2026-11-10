import { Ability } from "../models/Ability.js";
import { OperativeAbility } from "../models/OperativeAbilities.js";

const valid = (body) => {
  return typeof body.name === "string" && body.name.trim() && typeof body.description === "string" && body.description.trim();
} 

export const createAbility = async (req, res) => {
  if (!valid(req.body)){
    return res.status(400).send({ message: "Los campos name y description son requeridos." });
  } 
  const existing = await Ability.findOne({ where: { name: req.body.name.trim() } });
  if (existing) {
    return res.status(409).send({ message: "Ya existe una habilidad con ese nombre." });
  }
  const ability = await Ability.create({ 
    name: req.body.name.trim(), 
    description: req.body.description });

  return res.status(201).send(ability);
};

export const updateAbility = async (req, res) => {
  if (!valid(req.body)){
    return res.status(400).send({ message: "Los campos name y description son requeridos." });
  } 
  const ability = await Ability.findByPk(req.params.id);
  if (!ability) {
    return res.status(404).send({ message: "Habilidad no encontrada." });
  } 
  const existing = await Ability.findOne({ where: { name: req.body.name.trim() } });
  if (existing && existing.id !== ability.id) {
    return res.status(409).send({ message: "Ya existe una habilidad con ese nombre." });
  }
  await ability.update({ 
    name: req.body.name.trim(), 
    description: req.body.description });

  return res.send(ability);
};

export const deleteAbility = async (req, res) => {
  const ability = await Ability.findByPk(req.params.id);
  if (!ability) {
    return res.status(404).send({ message: "Habilidad no encontrada." });
  } 
  if (await OperativeAbility.count({ where: { abilityId: ability.id } })) {
    return res.status(409).send({ message: "No se puede eliminar una habilidad asignada a operativos." });
  }

  await ability.destroy();

  return res.status(204).end();
};

export const findAbility = async (req, res) => {
  const ability = await Ability.findByPk(req.params.id);
  if (!ability){
    return res.status(404).send({ message: "Habilidad no encontrada." });
  } 

  return res.send(ability);
};

export const findAbilities = async (req, res) => {
  return res.send(await Ability.findAll({ order: [["name"]] }));
} ;
