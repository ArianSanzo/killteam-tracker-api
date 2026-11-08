import express from 'express';
import cors from "cors";
import morgan from "morgan";

import { PORT } from './config.js';
import { sequelize } from './db.js';
import { initializeAuth } from './services/auth.service.js';

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
app.use(morgan("dev"));
app.use(express.json());
app.use((req, _res, next) => {
    if (req.body == null) req.body = {};
    return next();
});
app.use(killteamRoutes);
app.use((_req, res) => res.status(404).send({ message: "Ruta no encontrada." }));
app.use((error, _req, res, _next) => {
    const knownErrors = {
        SequelizeUniqueConstraintError: 409,
        SequelizeForeignKeyConstraintError: 409,
        SequelizeValidationError: 400,
    };
    const status = error.status || knownErrors[error.name] || 500;
    if (status >= 500) console.error("Error de API:", error);
    return res.status(status).send({
        message: status < 500 ? error.message : "Ocurrió un error interno.",
    });
});

try {
    if (!process.env.JWT_SECRET) throw new Error("Configura JWT_SECRET en el entorno antes de iniciar el servidor.");
    await sequelize.sync();
    await initializeAuth();
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });

} catch (error) {
    console.error('Hubo un error al inicializar el servidor:', error);
}



