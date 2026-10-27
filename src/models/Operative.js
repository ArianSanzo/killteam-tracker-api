import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Team } from "./Team.js";

export const Operative = sequelize.define(
    "operative",
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
        wounds: {
            type: DataTypes.STRING,
            allowNull: false
        },
        movement: {
            type: DataTypes.STRING,
            allowNull: false},
        apl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        save: {
            type: DataTypes.STRING,
            allowNull: false
        },
        img: {
            type: DataTypes.STRING,
            allowNull: false
        }  
    },
    { 
        timestamps: false,
        tableName: "operatives"
     }
);

Team.hasMany(Operative, { foreignKey: {name: 'teamId', allowNull: false} }); 
Operative.belongsTo(Team, { foreignKey: {name: 'teamId', allowNull: false} });