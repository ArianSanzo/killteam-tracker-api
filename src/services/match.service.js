import { Op } from "sequelize";
import { sequelize } from "../db.js";
import { Match } from "../models/Match.js";
import { GameTeam } from "../models/GameTeam.js";
import { GameOperative } from "../models/GameOperative.js";
import { GameOperativeState } from "../models/GameOperativeState.js";
import { PointsTable } from "../models/PointsTable.js";
import { Operative } from "../models/Operative.js";
import { OperativeWeapon } from "../models/OperativeWeapons.js";
import { Team } from "../models/Team.js";
import { matchDetailIncludes, matchHistoryIncludes } from "./match-query.js";
import { getRoleKey } from "../middleware/auth.js";

const canManageMatch = (user, match) => {
  return ["admin", "superadmin"].includes(getRoleKey(user?.role)) || Number(user?.id) === Number(match?.userId);
};

const invalidSelection = (message) => {
  return Object.assign(new Error(message), { status: 400 });
}

const createGameOperatives = async (team, gameTeam, transaction) => {
  const numbers = new Map();
  const created = [];

  for (const { operativeId, weaponId } of team.operatives) {
    const operative = await Operative.findByPk(operativeId, { transaction });

    if (!operative || Number(operative.teamId) !== Number(team.teamId)) {
      throw invalidSelection("El operativo no pertenece al equipo");
    }

    const weaponLink = await OperativeWeapon.findOne({
      where: { operativeId, weaponId },
      transaction,
    });

    if (!weaponLink) {
      throw invalidSelection("El arma no está asociada al operativo");
    }

    const number = (numbers.get(operative.id) ?? 0) + 1;
    numbers.set(operative.id, number);

    created.push(
      await GameOperative.create(
        {
          gameTeamId: gameTeam.id,
          operativeId,
          weaponId,
          number,
          wounds: Number.parseInt(operative.wounds, 10),
          img: operative.img,
        },
        { transaction },
      ),
    );
  }

  return created;
};

export const createMatch = async (req, res) => {
  const { teams } = req.body;
  const name = String(req.body.name ?? "").trim();
  const date = req.body.date ? new Date(req.body.date) : new Date();

  if (!name || Number.isNaN(date.getTime()) || !req.user?.id) {
    return res.status(400).send({ message: "Indica un nombre válido para la partida y una fecha válida." });
  }

  if (
    !Array.isArray(teams) ||
    teams.length !== 2 ||
    teams.some(
      (team) =>
        !Number.isInteger(Number(team?.teamId)) ||
        Number(team.teamId) <= 0 ||
        !Array.isArray(team.operatives) ||
        team.operatives.length === 0,
    )
  ) {
    return res.status(400).send({ message: "Se requieren dos equipos con teamId y al menos un operativo cada uno" });
  }

  if (Number(teams[0].teamId) === Number(teams[1].teamId)) {
    return res.status(400).send({ message: "Los dos equipos deben ser distintos" });
  }

  const teamCount = await Team.count({
    where: { id: { [Op.in]: teams.map((team) => Number(team.teamId)) } },
  });
  if (teamCount !== 2) {
    return res.status(400).send({ message: "Uno o más equipos seleccionados no existen." });
  }

  if (
    teams.some((team) =>
      team.operatives.some(
        (selection) =>
          !Number.isInteger(Number(selection?.operativeId)) ||
          Number(selection.operativeId) <= 0 ||
          !Number.isInteger(Number(selection?.weaponId)) ||
          Number(selection.weaponId) <= 0,
      ),
    )
  ) {
    return res.status(400).send({ message: "Cada operativo debe incluir operativeId y weaponId"});
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const newMatch = await Match.create(
        { name, date, userId: req.user.id },
        { transaction },
      );

      const newTeamA = await GameTeam.create(
        { matchId: newMatch.id, teamId: teams[0].teamId },
        { transaction },
      );
      const newOperativesA = await createGameOperatives(
        teams[0],
        newTeamA,
        transaction,
      );

      const newTeamB = await GameTeam.create(
        { matchId: newMatch.id, teamId: teams[1].teamId },
        { transaction },
      );
      const newOperativesB = await createGameOperatives(
        teams[1],
        newTeamB,
        transaction,
      );

      return {
        newMatch,
        newTeamA,
        newOperativesA,
        newTeamB,
        newOperativesB,
      };
    });

    return res.status(201).send(result);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).send({ message: error.message });
    }

    console.error("Error al crear la partida:", error);
    return res.status(500).send({ message: "No se pudo crear la partida" });
  }
};

export const updateMatch = async (req, res) => {
  const { id } = req.params;
  const { name, date } = req.body;
  const parsedDate = date ? new Date(date) : null;
  if (
    typeof name !== "string" || !name.trim() || !parsedDate || Number.isNaN(parsedDate.getTime())
  ) {
    return res.status(400).send({ message: "Indica un nombre y una fecha válidos." });
  }

  const match = await Match.findByPk(id);

  if (!match) {
    return res.status(404).send({ message: "Partida no encontrada" });
  }
  if (!canManageMatch(req.user, match)) {
    return res.status(403).send({ message: "No tienes permiso para editar esta partida." });
  }

  await match.update({
    name: name.trim(),
    date: parsedDate,
  });

  await match.save();

  res.send(match);
};

export const deleteMatch = async (req, res) => {
  const { id } = req.params;

  const match = await Match.findByPk(id);

  if (!match) {
    return res.status(404).send({ message: "Partida no encontrada" });
  }

  if (!canManageMatch(req.user, match)) {
    return res.status(403).send({ message: "No tienes permiso para eliminar esta partida." });
  }

  await sequelize.transaction(async (transaction) => {
    const gameTeams = await GameTeam.findAll({
      attributes: ["id"],
      where: { matchId: match.id },
      transaction,
    });
    const gameTeamIds = gameTeams.map((gameTeam) => gameTeam.id);

    if (gameTeamIds.length) {
      const where = { gameTeamId: { [Op.in]: gameTeamIds } };
      const gameOperatives = await GameOperative.findAll({
        attributes: ["id"],
        where,
        transaction,
      });
      const gameOperativeIds = gameOperatives.map((operative) => operative.id);
      if (gameOperativeIds.length) {
        await GameOperativeState.destroy({
          where: { gameOperativeId: { [Op.in]: gameOperativeIds } },
          transaction,
        });
      }
      await PointsTable.destroy({ where, transaction });
      await GameOperative.destroy({ where, transaction });
    }

    await GameTeam.destroy({ where: { matchId: match.id }, transaction });
    await match.destroy({ transaction });
  });

  return res.status(204).end();
};

export const findMatches = async (req, res) => {
  const where = ["admin", "superadmin"].includes(getRoleKey(req.user?.role))
    ? {}
    : { userId: req.user.id };
  const matches = await Match.findAll({
    where,
    include: matchHistoryIncludes,
    order: [["date", "DESC"]],
  });
  res.send(matches);
};

export const findMatch = async (req, res) => {
  const { id } = req.params;
  const match = await Match.findByPk(id, { include: matchDetailIncludes });
  if (!match) {
    return res.status(404).send({ message: "Partida no encontrada" });
  }
  if (!canManageMatch(req.user, match)) {
    return res.status(403).send({ message: "No tienes permiso para ver esta partida." });
  }
  res.send(match);
};
