import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

export const Rule = sequelize.define(
    "rule",
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

        description: {
            type: DataTypes.TEXT,
            allowNull: false
        }

    },
    { 
        timestamps: false,
        tableName: "rules"
     }
);