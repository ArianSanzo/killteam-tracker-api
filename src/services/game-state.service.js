import { Op } from "sequelize";
import { sequelize } from "../db.js";
import { GameTeam } from "../models/GameTeam.js";
import { GameOperative } from "../models/GameOperative.js";
import { GameOperativeState } from "../models/GameOperativeState.js";
import { Match } from "../models/Match.js";
import { Operative } from "../models/Operative.js";
import { PointsTable } from "../models/PointsTable.js";
import { getRoleKey } from "../middleware/auth.js";
import { matchDetailIncludes } from "./match-query.js";

const isPrivileged = (user) => {
  return ["admin", "superadmin"].includes(getRoleKey(user?.role));
}
  
const canEditMatch = (user, match) =>{
  return isPrivileged(user) || Number(user?.id) === Number(match?.userId);
}
  
const numericInput = (value) => {
  return value === null || value === undefined || (typeof value === "string" && !value.trim()) ? Number.NaN : Number(value);
}
  

const loadMatchForEdit = async (req, res) => {
  const match = await Match.findByPk(req.params.matchId);
  if (!match) {
    res.status(404).send({ message: "Partida no encontrada." });
    return null;
  }
  if (!canEditMatch(req.user, match)) {
    res.status(403).send({ message: "No tienes permiso para editar esta partida." });
    return null;
  }
  if (match.isFinished && !isPrivileged(req.user)) {
    res.status(409).send({ message: "La partida ya está finalizada." });
    return null;
  }
  return match;
};

export const saveTurningPoint = async (req, res) => {
  const turningPoint = Number(req.params.turningPoint);
  if (!Number.isInteger(turningPoint) || turningPoint < 1 || turningPoint > 4) {
    return res.status(400).send({ message: "El turning point debe ser un número entre 1 y 4." });
  }

  const match = await loadMatchForEdit(req, res);
  if (!match) return;

  const gameTeam = await GameTeam.findOne({
    where: { id: req.params.gameTeamId, matchId: match.id },
  });
  if (!gameTeam){
    return res.status(404).send({ message: "Ese equipo no pertenece a la partida." });
  }
    

  const fields = ["critOp", "tacOp", "killOp"];
  const values = {};
  for (const field of fields) {
    const value = req.body[field];
    if (value !== undefined) {
      const numericValue = numericInput(value);
      if (!Number.isInteger(numericValue) || numericValue < 0) {
        return res.status(400).send({message: `${field} debe ser un entero igual o mayor que cero.`,});
      }
      values[field] = numericValue;
    }
  }

  const points = await sequelize.transaction(async (transaction) => {
    let current = await PointsTable.findOne({
      where: { gameTeamId: gameTeam.id, turningPoint },
      transaction,
    });
    const previous =
      turningPoint > 1
        ? await PointsTable.findOne({
            where: {
              gameTeamId: gameTeam.id,
              turningPoint: { [Op.lt]: turningPoint },
            },
            order: [["turningPoint", "DESC"]],
            transaction,
          })
        : null;
    const priorValues = {
      critOp: previous?.critOp ?? 0,
      tacOp: previous?.tacOp ?? 0,
      killOp: previous?.killOp ?? 0,
    };
    const originalValues = current
      ? { critOp: current.critOp, tacOp: current.tacOp, killOp: current.killOp }
      : priorValues;

    if (current) {
      await current.update(values, { transaction });
    } else {
      current = await PointsTable.create(
        {
          gameTeamId: gameTeam.id,
          turningPoint,
          ...priorValues,
          ...values,
        },
        { transaction },
      );
    }

    let carryValues = {
      critOp: current.critOp,
      tacOp: current.tacOp,
      killOp: current.killOp,
    };
    for (
      let nextTurningPoint = turningPoint + 1;
      nextTurningPoint <= 4;
      nextTurningPoint += 1
    ) {
      const next = await PointsTable.findOne({
        where: { gameTeamId: gameTeam.id, turningPoint: nextTurningPoint },
        transaction,
      });
      if (!next) {
        await PointsTable.create(
          {
            gameTeamId: gameTeam.id,
            turningPoint: nextTurningPoint,
            ...carryValues,
          },
          { transaction },
        );
      } else if (
        ["critOp", "tacOp", "killOp"].every(
          (field) => next[field] === originalValues[field],
        )
      ) {
        await next.update(carryValues, { transaction });
      } else {
        break;
      }
    }
    return current;
  });

  return res.send(points);
};

export const updateGameOperativeWounds = async (req, res) => {
  const match = await loadMatchForEdit(req, res);
  if (!match) return;

  const gameTeam = await GameTeam.findOne({
    where: { id: req.params.gameTeamId, matchId: match.id },
  });
  if (!gameTeam){
    return res.status(404).send({ message: "Ese equipo no pertenece a la partida." });
  }
    

  const gameOperative = await GameOperative.findOne({
    where: { id: req.params.gameOperativeId, gameTeamId: gameTeam.id },
    include: [Operative],
  });
  if (!gameOperative){
    return res.status(404).send({ message: "El operativo no pertenece al equipo de la partida." });
  }
    
  const wounds = numericInput(req.body.wounds);
  const maxWounds = Number(gameOperative.operative?.wounds);
  if (!Number.isInteger(wounds) || wounds < 0 || wounds > maxWounds) {
    return res.status(400).send({ message: `Las heridas deben ser un entero entre 0 y ${maxWounds}.`});
  }

  const requestedTurningPoint = req.params.turningPoint;
  if (requestedTurningPoint === undefined) {
    await gameOperative.update({ wounds });
    return res.send(gameOperative);
  }

  const turningPoint = Number(requestedTurningPoint);
  if (!Number.isInteger(turningPoint) || turningPoint < 1 || turningPoint > 4) {
    return res.status(400).send({ message: "El turning point debe ser un número entre 1 y 4." });
  }

  const state = await sequelize.transaction(async (transaction) => {
    const current = await GameOperativeState.findOne({
      where: { gameOperativeId: gameOperative.id, turningPoint },
      transaction,
    });
    const previous =
      turningPoint > 1
        ? await GameOperativeState.findOne({
            where: {
              gameOperativeId: gameOperative.id,
              turningPoint: { [Op.lt]: turningPoint },
            },
            order: [["turningPoint", "DESC"]],
            transaction,
          })
        : null;
    const inheritedWounds = previous?.wounds ?? gameOperative.wounds;
    const originalWounds = current?.wounds ?? inheritedWounds;

    if (current) await current.update({ wounds }, { transaction });
    else
      await GameOperativeState.create(
        {
          gameOperativeId: gameOperative.id,
          turningPoint,
          wounds,
        },
        { transaction },
      );

    for (
      let nextTurningPoint = turningPoint + 1;
      nextTurningPoint <= 4;
      nextTurningPoint += 1
    ) {
      const next = await GameOperativeState.findOne({
        where: {
          gameOperativeId: gameOperative.id,
          turningPoint: nextTurningPoint,
        },
        transaction,
      });
      if (!next) {
        await GameOperativeState.create(
          {
            gameOperativeId: gameOperative.id,
            turningPoint: nextTurningPoint,
            wounds,
          },
          { transaction },
        );
      } else if (next.wounds === originalWounds) {
        await next.update({ wounds }, { transaction });
      } else {
        break;
      }
    }

    return GameOperativeState.findOne({
      where: { gameOperativeId: gameOperative.id, turningPoint },
      transaction,
    });
  });

  return res.send(state);
};

export const continueMatch = async (req, res) => {
  const match = await Match.findByPk(req.params.matchId, {
    include: matchDetailIncludes,
  });
  if (!match){
    return res.status(404).send({ message: "Partida no encontrada." });
  }
    
  if (Number(match.userId) !== Number(req.user.id)) {
    return res.status(403).send({ message: "Solo puedes continuar tus propias partidas." });
  }
  if (match.isFinished){
    return res.status(409).send({ message: "La partida ya está finalizada." });
  }
    
  return res.send(match);
};

export const updateMatchFinished = async (req, res) => {
  const finished = req.body.isFinished;
  if (typeof finished !== "boolean") {
    return res.status(400).send({ message: "isFinished debe ser true o false." });
  }
  const match = await loadMatchForEdit(req, res);
  if (!match) return;
  await match.update({ isFinished: finished });
  return res.send(match);
};
