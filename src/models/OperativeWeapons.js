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
        operativeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
        },
        weaponId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
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

Operative.hasMany(OperativeWeapon, { foreignKey: 'operativeId' });
OperativeWeapon.belongsTo(Operative, { foreignKey: 'operativeId' });

Weapon.hasMany(OperativeWeapon, { foreignKey: 'weaponId' });
OperativeWeapon.belongsTo(Weapon, { foreignKey: 'weaponId' });
