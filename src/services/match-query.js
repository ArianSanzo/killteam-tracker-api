import { Ability } from "../models/Ability.js";
import { GameOperative } from "../models/GameOperative.js";
import { GameOperativeState } from "../models/GameOperativeState.js";
import { GameTeam } from "../models/GameTeam.js";
import { Operative } from "../models/Operative.js";
import { OperativeAbility } from "../models/OperativeAbilities.js";
import { PointsTable } from "../models/PointsTable.js";
import { Rule } from "../models/Rule.js";
import { Team } from "../models/Team.js";
import { Weapon } from "../models/Weapon.js";
import { WeaponRule } from "../models/WeaponRules.js";

export const matchHistoryIncludes = [
  {
    model: GameTeam,
    include: [Team, PointsTable],
  },
];

export const matchDetailIncludes = [
  {
    model: GameTeam,
    include: [
      Team,
      PointsTable,
      {
        model: GameOperative,
        include: [
          {
            model: Operative,
            include: [{ model: OperativeAbility, include: [Ability] }],
          },
          { model: Weapon, include: [{ model: WeaponRule, include: [Rule] }] },
          GameOperativeState,
        ],
      },
    ],
  },
];
