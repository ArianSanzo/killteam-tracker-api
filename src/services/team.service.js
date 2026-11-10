import { GameTeam } from "../models/GameTeam.js";
import { Operative } from "../models/Operative.js";
import { Team } from "../models/Team.js";

const validate = ({ name, logo }) => {
  return typeof name === "string" && name.trim() && typeof logo === "string";
}
  

export const createTeam = async (req, res) => {
  if (!validate(req.body)){
    return res.status(400).send({ message: "Campos name y logo requeridos." }); 
  }

  const existing = await Team.findOne({ where: { name: req.body.name.trim() } });
  if (existing) {
    return res.status(409).send({ message: "Ya existe un equipo con ese nombre." });
  }

  const team = await Team.create({
    name: req.body.name.trim(),
    logo: req.body.logo,
  });
  return res.status(201).send(team);
};

export const updateTeam = async (req, res) => {
  if (!validate(req.body)) {
    return res.status(400).send({ message: "Campos name y logo requeridos." });
  }
    
  const team = await Team.findByPk(req.params.id);
  if (!team) {
    return res.status(404).send({ message: "Equipo no encontrado." });
  } 
  const existing = await Team.findOne({ where: { name: req.body.name.trim() } });
  if (existing && existing.id !== team.id) {
    return res.status(409).send({ message: "Ya existe un equipo con ese nombre." });
  }
  await team.update({ name: req.body.name.trim(), logo: req.body.logo });
  return res.send(team);
};

export const deleteTeam = async (req, res) => {
  const team = await Team.findByPk(req.params.id);
  if (!team) {
    return res.status(404).send({ message: "Equipo no encontrado." });
  } 
  const [operativeCount, gameTeamCount] = await Promise.all([
    Operative.count({ where: { teamId: team.id } }),
    GameTeam.count({ where: { teamId: team.id } }),
  ]);
  if (operativeCount || gameTeamCount) {
    return res.status(409).send({ message:"No se puede eliminar un equipo que tiene operativos o aparece en partidas." });
  }
  await team.destroy();
  return res.status(204).end();
};

export const findTeams = async (_req, res) =>
  res.send(await Team.findAll({ order: [["name", "ASC"]] }));

export const findTeam = async (req, res) => {
  const team = await Team.findByPk(req.params.id);
  if (!team) {
    return res.status(404).send({ message: "Equipo no encontrado." });
  } 
  return res.send(team);
};
