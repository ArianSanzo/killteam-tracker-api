import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

export const Weapon = sequelize.define(
    "weapon",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        attack: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        damage: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    { 
        timestamps: false,
        tableName: "weapons"
    }
);