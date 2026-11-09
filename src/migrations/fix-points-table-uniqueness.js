import { sequelize } from "../db.js";

const tableExists = async () => {
  const [rows] = await sequelize.query(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'points_tables'"
  );
  return rows.length > 0;
};

const indexColumns = async (indexName) => {
  const escapedName = indexName.replaceAll('"', '""');
  const [columns] = await sequelize.query(`PRAGMA index_info("${escapedName}")`);
  return columns.map((column) => column.name);
};

export async function fixPointsTableUniqueness() {
  if (!await tableExists()) return false;

  const [indexes] = await sequelize.query("PRAGMA index_list('points_tables')");
  const invalidIndexes = await Promise.all(indexes
    .filter((index) => index.unique)
    .map(async (index) => {
      const columns = await indexColumns(index.name);
      return columns.length === 1 && ["gameTeamId", "turningPoint"].includes(columns[0]);
    }));

  if (!invalidIndexes.includes(true)) return false;

  await sequelize.query("PRAGMA foreign_keys = OFF");
  try {
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(`
        CREATE TABLE points_tables_fixed (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          turningPoint INTEGER NOT NULL,
          critOp INTEGER NOT NULL,
          tacOp INTEGER NOT NULL,
          killOp INTEGER NOT NULL,
          gameTeamId INTEGER NOT NULL REFERENCES game_teams(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
      `, { transaction });
      await sequelize.query(`
        INSERT INTO points_tables_fixed (id, turningPoint, critOp, tacOp, killOp, gameTeamId)
        SELECT id, turningPoint, critOp, tacOp, killOp, gameTeamId FROM points_tables
      `, { transaction });
      await sequelize.query("DROP TABLE points_tables", { transaction });
      await sequelize.query("ALTER TABLE points_tables_fixed RENAME TO points_tables", { transaction });
      await sequelize.query(`
        CREATE UNIQUE INDEX points_tables_game_team_id_turning_point
        ON points_tables (gameTeamId, turningPoint)
      `, { transaction });
    });
  } finally {
    await sequelize.query("PRAGMA foreign_keys = ON");
  }

  console.log("Actualizado el esquema de puntos por equipo y turning point.");
  return true;
}
