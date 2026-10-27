import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';
import { User } from "./User.js"

export const Match = sequelize.define(
    "match",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    { 
        timestamps: false,
        tableName: "matches"
     }
);

User.hasMany(Match, { foreignKey: {name: 'userId', allowNull: false} }); 
Match.belongsTo(User, { foreignKey: {name: 'userId', allowNull: false} });