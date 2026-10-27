import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Weapon } from "./Weapon.js";
import { Rule } from "./Rule.js";

export const WeaponRule = sequelize.define(
    "weapon_rule",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
    },
    { 
        timestamps: false,
        tableName: "weapon_rules",
        indexes: [
            {
                unique: true,
                fields: ['weaponId', 'ruleId']
            }
        ]
     }
);

Weapon.hasMany(WeaponRule, { foreignKey: {name: 'weaponId', allowNull: false} }); 
WeaponRule.belongsTo(Weapon, { foreignKey: {name: 'weaponId', allowNull: false} });

Rule.hasMany(WeaponRule, { foreignKey: {name: 'ruleId', allowNull: false} }); 
WeaponRule.belongsTo(Rule, { foreignKey: {name: 'ruleId', allowNull: false} });