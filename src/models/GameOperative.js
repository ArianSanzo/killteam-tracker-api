import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Operative } from './Operative.js';
import { GameTeam } from "./GameTeam.js";

export const GameOperative = sequelize.define(
    "game_operative",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        wounds: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        img: {
            type: DataTypes.STRING,
        },
        posx: {
            type: DataTypes.INTEGER,
        },
        posy: {
            type: DataTypes.INTEGER,
        } 
    },
    { 
        timestamps: false,
        tableName: "game_operatives",
        indexes: [
            {
                unique: true,
                fields: ['operativeId', 'gameTeamId', 'number']
            }
        ]
     }
);


Operative.hasMany(GameOperative, { foreignKey: {name: 'operativeId', allowNull: false} }); 
GameOperative.belongsTo(Operative, { foreignKey: {name: 'operativeId', allowNull: false} });

GameTeam.hasMany(GameOperative, { foreignKey: {name: 'gameTeamId', allowNull: false} }); 
GameOperative.belongsTo(GameTeam, { foreignKey: {name: 'gameTeamId', allowNull: false} });