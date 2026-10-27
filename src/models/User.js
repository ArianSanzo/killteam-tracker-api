import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Role } from "./Role.js";

export const User = sequelize.define(
    "user",
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    { 
        timestamps: false,
        tableName: "users"
    }
);
Role.hasMany(User, { foreignKey: {name: 'roleId' , allowNull: false} }); 
User.belongsTo(Role, { foreignKey: {name: 'roleId' , allowNull: false} });