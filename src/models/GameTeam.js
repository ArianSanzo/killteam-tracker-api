import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Team } from "./Team.js";
import { Match } from "./Match.js";

export const GameTeam = sequelize.define(
    "game_team",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        }
    },
    { 
        timestamps: false,
        tableName: "game_teams",
     }
);

Team.hasMany(GameTeam, { foreignKey: {name: 'teamId', allowNull: false} }); 
GameTeam.belongsTo(Team, { foreignKey: {name: 'teamId', allowNull: false} });

Match.hasMany(GameTeam, { foreignKey: {name: 'matchId', allowNull: false} }); 
GameTeam.belongsTo(Match, { foreignKey: {name: 'matchId', allowNull: false} });

