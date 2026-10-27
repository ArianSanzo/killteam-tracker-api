import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { GameTeam } from "./GameTeam.js";

export const PointsTable = sequelize.define(
    "points_table",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        turningPoint: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        critOp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        tacOp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        killOp: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    { 
        timestamps: false,
        tableName: "points_tables",
        indexes: [
            {
                unique: true,
                fields: ['gameTeamId', 'turningPoint']
            }
        ]
     }
);

GameTeam.hasMany(PointsTable, { foreignKey: {name: 'gameTeamId', allowNull: false} }); 
PointsTable.belongsTo(GameTeam, { foreignKey: {name: 'gameTeamId', allowNull: false} });