import express from 'express';

import { PORT } from './config.js';
import killteamRoutes from '../routes/killteam.routes.js'

const app = express();

app.listen(PORT);
app.use(killteamRoutes)
console.log(`Server listening on port ${PORT}`);
