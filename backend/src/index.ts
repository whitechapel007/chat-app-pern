import dotenv from "dotenv";
import { createServer } from "http";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import app from "./app.js";
import { createSocket } from "./socket";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const PORT = process.env.PORT || 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") ?? [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingTimeout: 20000,
  pingInterval: 20000,
  maxHttpBufferSize: 1e6, // 1MB payload cap
});

createSocket(io);

// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId as string;
// });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
