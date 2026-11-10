import { Rule } from "../models/Rule.js";
import { WeaponRule } from "../models/WeaponRules.js";

const valid = (body) => {
  return typeof body.name === "string" && body.name.trim() && typeof body.description === "string" && body.description.trim();
}
  
export const createRule = async (req, res) => {
  if (!valid(req.body)){
    return res.status(400).send({ message: "Campos name y description requeridos." });
  }
  const existing = await Rule.findOne({ where: { name: req.body.name.trim() } });
  if (existing) {
    return res.status(409).send({ message: "Ya existe una regla con ese nombre." });
  }

  const rule = await Rule.create({
    name: req.body.name.trim(),
    description: req.body.description,
  });
  return res.status(201).send(rule);
};

export const updateRule = async (req, res) => {
  if (!valid(req.body)) {
    return res.status(400).send({ message: "Campos name y description requeridos." });
  }
    
  const rule = await Rule.findByPk(req.params.id);
  if (!rule){
    return res.status(404).send({ message: "Regla no encontrada" });
  } 
  const existing = await Rule.findOne({ where: { name: req.body.name.trim() } });
  if (existing && existing.id !== rule.id) {
    return res.status(409).send({ message: "Ya existe una regla con ese nombre." });
  }
  await rule.update({
    name: req.body.name.trim(),
    description: req.body.description,
  });
  return res.send(rule);
};

export const deleteRule = async (req, res) => {
  const rule = await Rule.findByPk(req.params.id);
  if (!rule){
    return res.status(404).send({ message: "Regla no encontrada." });
  } 
  if (await WeaponRule.count({ where: { ruleId: rule.id } })) {
    return res.status(409).send({ message: "No se puede eliminar una regla asignada a armas." });
  }
  await rule.destroy();
  return res.status(204).end();
};

export const findRules = async (_req, res) =>
  res.send(await Rule.findAll({ order: [["name", "ASC"]] }));

export const findRule = async (req, res) => {
  const rule = await Rule.findByPk(req.params.id);
  if (!rule) {
    return res.status(404).send({ message: "Regla no encontrada." });
  } 
  return res.send(rule);
};
