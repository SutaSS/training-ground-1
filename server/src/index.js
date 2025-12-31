import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { server } from 'socket.io';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initSocket } from './utils/socket.js';

const app = express();
const httpServer = createServer(app);

const io = new server.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api', routes);

//Error Handler
app.use(errorHandler);

//Initialize Socket
initSocket(io);

httpServer.listen(config.port, () => {
    console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
    console.log(`JWT Expires In: ${config.jwtExpiresIn}`);
    console.log('websocket server is running');
});
