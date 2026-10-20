import express from 'express';

import { PORT } from './config.js';

const app = express();

app.listen(port);
console.log(`Server listening on port ${PORT}`);
