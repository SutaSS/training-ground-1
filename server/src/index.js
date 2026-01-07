import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { initSocket } from "./utils/socketManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api", routes);

//Error Handler
app.use("/api",errorHandler);

// ====== Serve static frontend in production ======
if (config.nodeEnv === "production") {
  //path folder build frontend
  const clientBuildPath = path.join(__dirname, '../../client/dist');

  //serve static files (css,js,img,etc)
  app.use(express.static(clientBuildPath));

  // Catch-all route: kirim index.html untuk semua route (SPA routing)
  // Express 5.x: gunakan middleware, bukan app.get("*")
  app.use((req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });

}


//Initialize Socket
initSocket(io);

httpServer.listen(config.port, () => {
  console.log(
    `Server is running on port ${config.port} in ${config.nodeEnv} mode`
  );
  console.log(`JWT Expires In: ${config.jwtExpiresIn}`);
  console.log("websocket server is running");

  if (config.nodeEnv === "production") {
    console.log("Serving frontend static files from client/dist");
  }
});
