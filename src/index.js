import express from 'express';

import { PORT } from './config.js';
import { sequelize } from './db.js';
import killteamRoutes from '../routes/killteam.routes.js'

const app = express();

try {
    app.listen(PORT);
    app.use(killteamRoutes);

    await sequelize.authenticate();

    console.log(`Server listening on port ${PORT}`);

} catch (error) {
    console.log('Hubo un error al inicializar el servidor.');
}



