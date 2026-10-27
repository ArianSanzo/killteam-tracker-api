import { DataTypes } from "sequelize";
import { sequelize } from '../db.js';

import { Operative } from "./Operative.js";
import { Weapon } from "./Weapon.js"

export const OperativeWeapon = sequelize.define(
    "operative_weapons",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
    },
    { 
        timestamps: false,
        tableName: "operative_weapons",
        indexes: [
            {
                unique: true,
                fields: ['operativeId', 'weaponId']
            }
        ]
     }
);

Operative.hasMany(OperativeWeapon, { foreignKey: {name: 'operativeId', allowNull: false} }); 
OperativeWeapon.belongsTo(Operative, { foreignKey: {name: 'operativeId', allowNull: false} });

Weapon.hasMany(OperativeWeapon, { foreignKey: {name: 'weaponId', allowNull: false} }); 
OperativeWeapon.belongsTo(Weapon, { foreignKey: {name: 'weaponId', allowNull: false} });