import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

export const Team = sequelize.define(
    "team",
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
        logo: {
            type: DataTypes.STRING,
            allowNull: false
        }  
    },
    { 
        timestamps: false,
        tableName: "teams"
     }
);
