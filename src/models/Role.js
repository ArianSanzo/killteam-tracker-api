import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

export const Role = sequelize.define(
    "role",
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
        }
    },
    { 
        timestamps: false,
        tableName: "roles"
    }
);