import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Operative } from "./Operative.js";
import { Ability } from "./Ability.js";

export const OperativeAbility = sequelize.define(
    "operative_ability",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
    },
    { 
        timestamps: false,
        tableName: "operative_abilities",
        indexes: [
            {
                unique: true,
                fields: ['operativeId', 'abilityId']
            }
        ]
     }
);

Operative.hasMany(OperativeAbility, { foreignKey: {name: 'operativeId', allowNull: false} }); 
OperativeAbility.belongsTo(Operative, { foreignKey: {name: 'operativeId', allowNull: false} });

Ability.hasMany(OperativeAbility, { foreignKey: {name: 'abilityId', allowNull: false} }); 
OperativeAbility.belongsTo(Ability, { foreignKey: {name: 'abilityId', allowNull: false} });