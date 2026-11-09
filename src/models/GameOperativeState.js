import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { GameOperative } from "./GameOperative.js";

export const GameOperativeState = sequelize.define(
  "game_operative_state",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    turningPoint: { type: DataTypes.INTEGER, allowNull: false },
    wounds: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    timestamps: false,
    tableName: "game_operative_states",
    indexes: [{ unique: true, fields: ["gameOperativeId", "turningPoint"] }],
  }
);

GameOperative.hasMany(GameOperativeState, {
  foreignKey: { name: "gameOperativeId", allowNull: false },
});
GameOperativeState.belongsTo(GameOperative, {
  foreignKey: { name: "gameOperativeId", allowNull: false },
});
