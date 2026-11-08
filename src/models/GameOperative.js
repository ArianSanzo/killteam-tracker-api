import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Operative } from './Operative.js';
import { GameTeam } from "./GameTeam.js";
import { Weapon } from "./Weapon.js";

export const GameOperative = sequelize.define(
    "game_operative",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        operativeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
        },
        gameTeamId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
        },
        wounds: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        weaponId: {
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


Operative.hasMany(GameOperative, { foreignKey: 'operativeId' });
GameOperative.belongsTo(Operative, { foreignKey: 'operativeId' });

GameTeam.hasMany(GameOperative, { foreignKey: 'gameTeamId' });
GameOperative.belongsTo(GameTeam, { foreignKey: 'gameTeamId' });

Weapon.hasMany(GameOperative, { foreignKey: 'weaponId' });
GameOperative.belongsTo(Weapon, { foreignKey: 'weaponId' });
