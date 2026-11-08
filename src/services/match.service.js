import { sequelize } from "../db.js";
import { Match } from "../models/Match.js";
import { GameTeam } from "../models/GameTeam.js";
import { GameOperative } from "../models/GameOperative.js";
import { Operative } from "../models/Operative.js";
import { OperativeWeapon } from "../models/OperativeWeapons.js";
import { Team } from "../models/Team.js";
import { Weapon } from "../models/Weapon.js";
import { getRoleKey } from "../middleware/auth.js";

const canManageMatch = (user, match) =>
  ["admin", "superadmin"].includes(getRoleKey(user?.role)) ||
  Number(user?.id) === Number(match?.userId);

const invalidSelection = (message) =>
  Object.assign(new Error(message), { status: 400 });

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

    created.push(await GameOperative.create(
      {
        gameTeamId: gameTeam.id,
        operativeId,
        weaponId,
        number,
        wounds: Number.parseInt(operative.wounds, 10),
        img: operative.img,
      },
      { transaction }
    ));
  }

  return created;
};

export const createMatch = async (req, res) => {
  const { name, date, teams } = req.body;

  if (!name || !date || !req.user?.id) {
    return res.status(400).send({
      message: "Los campos name y date son requeridos",
    });
  }

  if (
    !Array.isArray(teams) ||
    teams.length !== 2 ||
    teams.some(
      (team) =>
        !team?.teamId ||
        !Array.isArray(team.operatives) ||
        team.operatives.length === 0
    )
  ) {
    return res.status(400).send({
      message: "Se requieren dos equipos con teamId y al menos un operativo cada uno",
    });
  }

  if (Number(teams[0].teamId) === Number(teams[1].teamId)) {
    return res.status(400).send({ message: "Los dos equipos deben ser distintos" });
  }

  if (
    teams.some((team) =>
      team.operatives.some(
        (selection) => !selection?.operativeId || !selection?.weaponId
      )
    )
  ) {
    return res.status(400).send({
      message: "Cada operativo debe incluir operativeId y weaponId",
    });
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const newMatch = await Match.create(
        { name, date, userId: req.user.id },
        { transaction }
      );

      const newTeamA = await GameTeam.create(
        { matchId: newMatch.id, teamId: teams[0].teamId },
        { transaction }
      );
      const newOperativesA = await createGameOperatives(
        teams[0], newTeamA, transaction
      );

      const newTeamB = await GameTeam.create(
        { matchId: newMatch.id, teamId: teams[1].teamId },
        { transaction }
      );
      const newOperativesB = await createGameOperatives(
        teams[1], newTeamB, transaction
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
    if (!name || !date) {
        return res.status(400).send({ message: "Los campos name y date son requeridos" });
    }

    const match = await Match.findByPk(id);

    if (!match) {
        return res.status(404).send({ message: "Partida no encontrada"})
    }
    if (!canManageMatch(req.user, match)) {
        return res.status(403).send({ message: "No tienes permiso para editar esta partida." });
    }

    await match.update({
        name,
        date
    });

    await match.save();

    res.send(match);
};

export const deleteMatch = async (req, res) => {
    const { id } = req.params;

    const match = await Match.findByPk(id);

    if (!match) {
        return res.status(404).send({ message: "Partida no encontrada"})
    }

    if (!canManageMatch(req.user, match)) {
        return res.status(403).send({ message: "No tienes permiso para eliminar esta partida." });
    }

    await match.destroy();

    res.send(`Eliminando partida ${id}`)
};

export const findMatches = async (req, res) => {
    const where = ["admin", "superadmin"].includes(getRoleKey(req.user?.role))
      ? {}
      : { userId: req.user.id };
    const matchs = await Match.findAll({ where });
    res.send(matchs);
};

export const findMatch = async (req, res) => {
    const { id } = req.params;
    const match = await Match.findByPk(id, {
    include: [
      {
        model: GameTeam,
        include: [
          { model: Team },
          {
            model: GameOperative,
            include: [Operative, Weapon],
          },
        ],
      },
    ],
    });
    if (!match) {
        return res.status(404).send({ message: "Partida no encontrada"})
    }
    if (!canManageMatch(req.user, match)) {
        return res.status(403).send({ message: "No tienes permiso para ver esta partida." });
    }
    res.send(match);
};
