import express from 'express';

import { PORT } from './config.js';
import { sequelize } from './db.js';

import "./models/Ability.js"
import "./models/GameOperative.js"
import "./models/GameTeam.js"
import "./models/Match.js"
import "./models/Operative.js"
import "./models/OperativeAbilities.js"
import "./models/OperativeWeapons.js"
import "./models/PointsTable.js"
import "./models/Role.js"
import "./models/Rule.js"
import "./models/Team.js"
import "./models/User.js"
import "./models/Weapon.js"
import "./models/WeaponRules.js"

import killteamRoutes from '../routes/killteam.routes.js'

const app = express();

try {
    app.use(express.json());
    app.listen(PORT);
    app.use(killteamRoutes);

    await sequelize.sync();

    console.log(`Server listening on port ${PORT}`);

} catch (error) {
    console.log('Hubo un error al inicializar el servidor.');
}



