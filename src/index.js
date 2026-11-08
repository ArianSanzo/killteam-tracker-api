import express from 'express';
import cors from "cors";

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

app.use(cors({
    origin: "http://localhost:5173",
}));
app.use(express.json());
app.use(killteamRoutes);

try {
    await sequelize.sync();
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

} catch (error) {
    console.error('Hubo un error al inicializar el servidor:', error);
}



