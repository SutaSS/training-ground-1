import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { server } from 'socket.io';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initSocket } from './utils/socket.js';